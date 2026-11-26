import { cookieModeHeaders, cookieModeUrl } from "./cookie-session";
import {
  clearIdleState,
  enforceIdleTimeout,
  markActivity,
} from "./idle-timeout";
import { portalSignOutUrl } from "./portal-url";
import {
  type IAppSessionUser,
  setSessionUser,
  userFromMe,
} from "./session-store";
import {
  classifyHost,
  configuredAppHost,
  currentDefaultTenantDoorUrl,
  currentTenantSlug,
} from "./tenant-host";

/**
 * Sign-in is a platform feature. This app has no sign-in page, no password form and no token.
 *
 * People sign in only at the platform portal and arrive through the app's own backend
 * (backend-for-frontend, ajna-app-infra#1554):
 *
 *   GET /api/v1/auth/oidc/start?return=<path> → portal → /api/v1/auth/oidc/callback
 *
 * The backend makes the state, nonce and PKCE verifier, redeems the code server-to-server, sets
 * the HttpOnly cookie session and redirects back to the door. The page only NAVIGATES: it makes
 * no cross-origin call and never holds a token. Every API call then runs in cookie mode
 * (cookie-session.ts): `X-Ajna-Session: cookie`, and on a write `X-Ajna-CSRF` echoing the
 * readable `__Host-ajna_csrf` cookie.
 *
 * Who is signed in comes from `GET /api/v1/auth/me` at boot (bootSession), held in memory
 * (session-store.ts). A page with no session goes straight to the start URL: there is no
 * landing page and no "Continue to sign in" button. The loop guard below stops a sign-in that
 * keeps coming back without a session from starting again on its own.
 *
 * A failed callback lands on `/?auth_error=<fixed code>` (ajna-cloud-sdk oidc_bff).
 */

// The API base ends at "/v1" (cookie-session.ts configuredApiBase), so paths start after it.
const START_PATH = "/auth/oidc/start";
const ME_PATH = "/auth/me";
const REFRESH_PATH = "/auth/oidc/refresh";
const LOGOUT_PATH = "/auth/logout";

/** How long a sign-out waits for the backend to clear its cookies before it navigates away. */
export const SIGN_OUT_WAIT_MS = 3000;

/**
 * When this tab last started a sign-in (ms epoch, sessionStorage). Back on the page with no
 * session inside AUTO_START_WINDOW_MS, that attempt did not end in a session: the page then says
 * so and does not start again, so it can never loop. A session clears it.
 */
export const AUTO_STARTED_KEY = "bff_auto_sign_in_started";
/** The backend's sign-in flow lives 10 minutes (ajna-cloud-sdk oidc_bff FLOW_MAX_AGE_S). */
export const AUTO_START_WINDOW_MS = 10 * 60 * 1000;
/**
 * How many automatic starts this tab may make inside AUTO_START_WINDOW_MS (sessionStorage,
 * `<first start ms>:<count>`). Unlike AUTO_STARTED_KEY, a good `/auth/me` does NOT clear it, so a
 * session that `/auth/me` accepts but every data call refuses (401 after a refresh) cannot loop.
 */
export const AUTO_START_COUNT_KEY = "bff_auto_sign_in_count";
export const MAX_AUTO_STARTS = 2;
/** How long a sign-out in ANOTHER tab blocks an automatic start in this one. */
export const SIGNED_OUT_HOLD_MS = 30 * 1000;
/** Set (ms epoch, localStorage) by every sign-out, so other tabs follow it (sign-out.ts). */
export const SIGNED_OUT_AT_KEY = "ajna_signed_out_at";

export const AUTH_ERROR_PARAM = "auth_error";

const AUTO_START_FAILED_MESSAGE = "Sign-in did not complete. Please try again.";
const TOO_MANY_STARTS_MESSAGE =
  "Sign-in keeps ending without access to this app. Please try again, or contact your administrator.";
const ACCOUNT_FAILED_MESSAGE =
  "You signed in, but this app could not load your account for this organisation. " +
  "Please try again, or contact your administrator.";
const UNREACHABLE_MESSAGE =
  "Could not reach the app to check your sign-in. Check your connection and try again.";
const ORG_ADDRESS_MESSAGE =
  "Sign in through your organisation's address, not the app's shared address.";
const NO_SAME_ORIGIN_MESSAGE =
  "Sign-in needs the app's API on this page's own address (/api). " +
  "Open the app through your organisation's address.";

/** The fixed callback codes (ajna-cloud-sdk oidc_bff) and what the user is told. */
const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  login_required: "",
  denied: "Sign-in was cancelled or denied.",
  flow: "The sign-in took too long or was started in another browser. Please try again.",
  state: "The sign-in could not be verified. Please try again.",
  exchange: "The sign-in service did not answer. Please try again.",
  id_token: "The sign-in could not be verified. Please try again.",
  request: "The sign-in request was incomplete. Please try again.",
  provider: "The sign-in service refused the request. Please try again.",
  unavailable: "Sign-in is not available right now. Please try again later.",
});
const UNKNOWN_AUTH_ERROR = "Sign-in failed. Please try again.";

/**
 * Every key an older bundle kept a session in (the old sign-in form, hosted Cognito login, the
 * portal code hand-off, the earlier BFF markers). purgeBrowserTokens() deletes them once at boot.
 */
const LEGACY_LOCAL_KEYS: readonly string[] = [
  "auth_token",
  "auth_user",
  "auth_refresh_token",
  "auth_id_token",
  "auth_kind",
  "handoff_refresh",
  "handoff_portal",
  "bff_signed_out",
];
const LEGACY_SESSION_KEYS: readonly string[] = [
  "hosted_auth_pkce_verifier",
  "hosted_auth_state",
  "hosted_auth_nonce",
  "hosted_auth_return_to",
  "hosted_auth_auto_tried",
  "bff_adopt_failed",
  "ajna_idle_signout",
  "active_tenant",
];

function storageGet(store: () => Storage, key: string): string | null {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
}

function storageSet(
  store: () => Storage,
  key: string,
  value: string | null,
): void {
  try {
    if (value === null) store().removeItem(key);
    else store().setItem(key, value);
  } catch {
    // Storage blocked (private mode): the flow still works, only the loop guard is per page.
  }
}

const local = () => localStorage;
const session = () => sessionStorage;

// Control characters (C0 and DEL): a browser strips or rewrites them, so "/\t/evil" can become
// protocol-relative after the check.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/**
 * An app-relative path: starts with one "/", never "//" (protocol-relative), never a backslash
 * (a browser reads "/\\host" as "//host") and never a control character.
 */
export function isSafeReturnPath(path: string | null | undefined): boolean {
  if (!path || !path.startsWith("/")) return false;
  return (
    !path.startsWith("//") && !path.includes("\\") && !CONTROL_CHARS.test(path)
  );
}

/** Old sign-in pages (`/login`, `/auth/...`): never a return target (no replay, no loop). */
const OLD_SIGN_IN_PATH =
  /^\/(?:auth(?:[/?#]|$)|login(?:[/?#]|$)|initiate-login|authorize)/;

function isReturnablePath(path: string | null | undefined): boolean {
  return isSafeReturnPath(path) && !OLD_SIGN_IN_PATH.test(path as string);
}

/** The page's own path, without `?auth_error`, when it is a safe return target; else "/". */
export function currentPath(): string {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  params.delete(AUTH_ERROR_PARAM);
  const query = params.toString();
  const path = `${pathname}${query ? `?${query}` : ""}`;
  return isReturnablePath(path) ? path : "/";
}

export interface IBffStartOptions {
  /** App-relative path to open after sign-in; anything else becomes the current path or "/". */
  returnTo?: string | null;
  /** Started by the page with no session (not a click): the loop guard counts it. */
  auto?: boolean;
}

/**
 * The same-origin start URL, or null when the API is not same-origin with the page: the
 * backend's host-only cookies would never reach the page.
 */
export function bffStartUrl(options: IBffStartOptions = {}): string | null {
  const base = cookieModeUrl(START_PATH);
  if (!base) return null;
  const url = new URL(base);
  url.searchParams.set(
    "return",
    isReturnablePath(options.returnTo)
      ? (options.returnTo as string)
      : currentPath(),
  );
  return url.toString();
}

/** Is this page the app's shared (bare) host? The cockpit has no callback for it (#159). */
export function isBareAppHost(
  hostname: string = window.location.hostname,
): boolean {
  return classifyHost(hostname, configuredAppHost()).kind === "app";
}

/**
 * Start the sign-in: a top-level navigation to the backend. Throws a user-readable Error when
 * this page cannot use it (the bare app host, or a cross-origin API). Never falls back to a
 * browser token exchange.
 */
export function beginBffLogin(options: IBffStartOptions = {}): void {
  if (isBareAppHost()) throw new Error(ORG_ADDRESS_MESSAGE);
  const url = bffStartUrl(options);
  if (!url) throw new Error(NO_SAME_ORIGIN_MESSAGE);
  // Every start marks the tab, so the return can be recognised (the idle clock restarts then).
  // Only an automatic start counts toward MAX_AUTO_STARTS; a click resets the count.
  const now = Date.now();
  storageSet(session, AUTO_STARTED_KEY, String(now));
  storageSet(
    session,
    AUTO_START_COUNT_KEY,
    options.auto ? nextAutoStartCount(now) : null,
  );
  window.location.assign(url);
}

/** The callback's `?auth_error` code, or null. */
export function authErrorCode(
  search: string = window.location.search,
): string | null {
  const code = new URLSearchParams(search).get(AUTH_ERROR_PARAM);
  return code ? code.slice(0, 32) : null;
}

/** The message for a callback code ("" for `login_required`). */
export function authErrorMessage(code: string | null): string {
  if (!code) return "";
  return Object.prototype.hasOwnProperty.call(AUTH_ERROR_MESSAGES, code)
    ? AUTH_ERROR_MESSAGES[code]
    : UNKNOWN_AUTH_ERROR;
}

/** Did this tab's own start come back here, recently (with or without a session)? */
function autoStartReturned(now: number = Date.now()): boolean {
  const at = Number(storageGet(session, AUTO_STARTED_KEY) ?? "");
  return at > 0 && now - at < AUTO_START_WINDOW_MS;
}

/** The automatic starts inside the current window: [first start ms, count]. */
function autoStartCount(now: number = Date.now()): [number, number] {
  const [first, count] = (storageGet(session, AUTO_START_COUNT_KEY) ?? "")
    .split(":")
    .map(Number);
  if (!(first > 0) || !(count > 0) || now - first >= AUTO_START_WINDOW_MS)
    return [now, 0];
  return [first, count];
}

function nextAutoStartCount(now: number): string {
  const [first, count] = autoStartCount(now);
  return `${first}:${count + 1}`;
}

/** Did a tab of this browser sign out in the last SIGNED_OUT_HOLD_MS? */
export function signedOutRecently(now: number = Date.now()): boolean {
  const at = Number(storageGet(local, SIGNED_OUT_AT_KEY) ?? "");
  return at > 0 && now - at < SIGNED_OUT_HOLD_MS;
}

export type TBootResult =
  "signed_in" | "signed_out" | "account_failed" | "unreachable" | "skipped";

let bootResult: TBootResult = "skipped";

/** What bootSession found. The route guard reads it. */
export function lastBootResult(): TBootResult {
  return bootResult;
}

/**
 * Why the page must NOT start the sign-in on its own, or "" when it may. Each reason stops a
 * loop: a callback error, an account the backend could not load, a backend that does not
 * answer, a start that came back without a session, or too many automatic starts.
 */
export function signInStopReason(
  search: string = window.location.search,
): string {
  const fromCallback = authErrorMessage(authErrorCode(search));
  if (fromCallback) return fromCallback;
  if (bootResult === "account_failed") return ACCOUNT_FAILED_MESSAGE;
  if (bootResult === "unreachable") return UNREACHABLE_MESSAGE;
  if (autoStartCount()[1] >= MAX_AUTO_STARTS) return TOO_MANY_STARTS_MESSAGE;
  return autoStartReturned() ? AUTO_START_FAILED_MESSAGE : "";
}

/** The message for a page that cannot start the sign-in at all (bare host, cross-origin), or "". */
export function signInUnavailableReason(): string {
  if (isBareAppHost()) return ORG_ADDRESS_MESSAGE;
  return bffStartUrl() ? "" : NO_SAME_ORIGIN_MESSAGE;
}

/**
 * What the route guard does for a page with no signed-in user:
 * - "leaving": a sign-out is under way; show that, start nothing.
 * - "door": the bare app host with a dev default tenant (VITE_DEFAULT_TENANT): go to its door.
 * - "unavailable": this page cannot sign in at all (the bare host, a cross-origin API).
 * - "stopped": the loop guard holds (see signInStopReason); show why, and offer one retry.
 * - "start": go to the BFF sign-in now, with no click.
 * Read it ONCE when the guard mounts: starting the sign-in sets the loop guard's mark.
 */
export type TSignInDecision =
  | { kind: "leaving" }
  | { kind: "start" }
  | { kind: "door"; url: string }
  | { kind: "unavailable"; message: string }
  /** `retry`: "reload" when the backend did not answer, else "sign-in" (one more start). */
  | { kind: "stopped"; message: string; retry: "reload" | "sign-in" };

export function signInDecision(
  leaving: boolean,
  search: string = window.location.search,
): TSignInDecision {
  if (leaving) return { kind: "leaving" };
  const door = isBareAppHost() ? currentDefaultTenantDoorUrl(false) : null;
  if (door) return { kind: "door", url: door };
  const unavailable = signInUnavailableReason();
  if (unavailable) return { kind: "unavailable", message: unavailable };
  const stopped = signInStopReason(search);
  if (stopped) {
    const retry = bootResult === "unreachable" ? "reload" : "sign-in";
    return { kind: "stopped", message: stopped, retry };
  }
  return { kind: "start" };
}

function tenantHeader(): Record<string, string> {
  const tenant = currentTenantSlug();
  return tenant ? { "X-Tenant-ID": tenant } : {};
}

type TMeResult = { user: IAppSessionUser } | { status: number };

/**
 * `GET /api/v1/auth/me` in cookie mode. It carries `X-Tenant-ID` like every API call: the SDK
 * picks the role for THIS door's organisation from it.
 */
async function fetchMe(): Promise<TMeResult> {
  const url = cookieModeUrl(ME_PATH);
  if (!url) return { status: 0 };
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { ...cookieModeHeaders("GET"), ...tenantHeader() },
    });
    if (!res.ok) return { status: res.status };
    const user = userFromMe(await res.json());
    // A 200 that names no user: the account could not be loaded (not transient).
    return user ? { user } : { status: res.status };
  } catch (err) {
    console.error("Sign-in: the session check could not reach the app:", err);
    return { status: 0 };
  }
}

/**
 * "refreshed": the backend rotated the HttpOnly session. "refused": a definitive 4xx (spent,
 * expired or revoked), so the session is over. "failed": transient (network, 5xx).
 */
export type TBffRefreshResult = "refreshed" | "refused" | "failed";

let refreshInFlight: Promise<TBffRefreshResult> | null = null;

/** Rotate the cookie session at `POST /api/v1/auth/oidc/refresh`. One request at a time. */
export function refreshBffSession(): Promise<TBffRefreshResult> {
  if (!refreshInFlight) {
    refreshInFlight = requestRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function requestRefresh(): Promise<TBffRefreshResult> {
  const url = cookieModeUrl(REFRESH_PATH);
  if (!url) return "refused";
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...cookieModeHeaders("POST"),
        ...tenantHeader(),
      },
      body: "{}",
    });
    if (res.ok) return "refreshed";
    return res.status >= 400 && res.status < 500 ? "refused" : "failed";
  } catch (err) {
    console.error("Sign-in: the session refresh could not reach the app:", err);
    return "failed";
  }
}

/**
 * Delete every token or session marker an older bundle left in this browser, once, at boot.
 * Nothing in this bundle writes them again. Returns how many keys were present.
 */
export function purgeBrowserTokens(): number {
  let found = 0;
  for (const key of LEGACY_LOCAL_KEYS) {
    if (storageGet(local, key) !== null) found += 1;
    storageSet(local, key, null);
  }
  for (const key of LEGACY_SESSION_KEYS) {
    if (storageGet(session, key) !== null) found += 1;
    storageSet(session, key, null);
  }
  return found;
}

/** The wait before boot asks `/auth/me` a second time. */
export const BOOT_RETRY_MS = 800;

function isTransient(status: number): boolean {
  return status === 0 || status >= 500;
}

/**
 * The boot step, before React mounts: drop the old browser tokens, then ask the backend who is
 * signed in. A 401 gets ONE refresh attempt and one more `/auth/me`. The bare app host cannot
 * sign in, so it has no session to ask about.
 */
export async function bootSession(): Promise<TBootResult> {
  purgeBrowserTokens();
  if (isBareAppHost()) return finishBoot("skipped", null);
  let me = await fetchMe();
  // A cold backend (5xx, no answer) gets ONE retry before the page says anything.
  if ("status" in me && isTransient(me.status)) {
    await new Promise((resolve) => setTimeout(resolve, BOOT_RETRY_MS));
    me = await fetchMe();
  }
  if ("status" in me && me.status === 401) {
    // An idle-expired session is signed out, never refreshed (idle-timeout.ts).
    if (enforceIdleTimeout()) {
      clearIdleState();
      return finishBoot("signed_out", null);
    }
    if ((await refreshBffSession()) === "refreshed") me = await fetchMe();
  }
  if ("user" in me) return finishBoot("signed_in", me.user);
  // 401: no session. 5xx or no answer: the backend is not answering, not a sign-in problem.
  // Anything else (403 not a member): a session exists, but the account could not be loaded.
  // In both of the last two cases the page must not loop through the sign-in.
  if (me.status === 401) return finishBoot("signed_out", null);
  return finishBoot(
    isTransient(me.status) ? "unreachable" : "account_failed",
    null,
  );
}

function finishBoot(
  result: TBootResult,
  user: IAppSessionUser | null,
): TBootResult {
  bootResult = result;
  if (user) {
    // Back from a sign-in this tab started: the idle clock starts fresh. A plain reload keeps
    // the clock, so a reload never extends an idle session. The automatic-start COUNT stays.
    if (autoStartReturned()) markActivity();
    storageSet(session, AUTO_STARTED_KEY, null);
  }
  setSessionUser(user);
  return result;
}

/** "user": the Logout button. "idle": the idle timeout ended the session. */
export type TSignOutReason = "user" | "idle";

/**
 * End the backend cookie session on THIS browser: `POST /api/v1/auth/logout` in cookie mode, so
 * the backend clears its session cookies. No bearer is sent, so this signs out this device only.
 * Waits at most SIGN_OUT_WAIT_MS, so a slow backend never traps the user.
 */
async function clearBackendSession(): Promise<void> {
  const url = cookieModeUrl(LOGOUT_PATH);
  if (!url) return;
  const request = fetch(url, {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      ...cookieModeHeaders("POST"),
    },
    body: "{}",
  }).then(
    () => undefined,
    () => undefined,
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, SIGN_OUT_WAIT_MS);
  });
  await Promise.race([request, timeout]);
  clearTimeout(timer);
}

/**
 * Sign this browser out: forget the user, clear the backend cookies, then the idle clock, the
 * loop guard and any old token. Resolves to where the caller must go next: the portal, still
 * signed in there (portal-url.ts portalSignOutUrl). Navigation is the caller's (sign-out.ts).
 */
export async function signOutBffSession(
  options: { reason?: TSignOutReason } = {},
): Promise<string> {
  // First: other tabs follow this sign-out (sign-out.ts watchSignOutInOtherTabs).
  storageSet(local, SIGNED_OUT_AT_KEY, String(Date.now()));
  setSessionUser(null);
  await clearBackendSession();
  purgeBrowserTokens();
  clearIdleState();
  storageSet(session, AUTO_STARTED_KEY, null);
  return portalSignOutUrl(options.reason ?? "user");
}
