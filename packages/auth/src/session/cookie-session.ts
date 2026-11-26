import { appApiBase } from "./api-base";
import { sessionConfig } from "./config";

/**
 * Cookie sessions (security item M5, ajna-app-infra#1487 / ajna-cloud-sdk#464).
 *
 * A request opts in with `X-Ajna-Session: cookie`. The backend keeps the access and refresh
 * tokens in HttpOnly `__Host-` cookies that page script cannot read, and answers
 * `"token_type": "cookie"` with no token in the body. The cookie session is this app's ONLY
 * session: the page never holds a token (bff-signin.ts).
 *
 * Every write that relies on the cookie must echo the readable `__Host-ajna_csrf` cookie in
 * `X-Ajna-CSRF` (double-submit), or the backend answers 403.
 *
 * The cookies are host-only, so cookie mode works only when the API is SAME-ORIGIN with the page.
 */

export const COOKIE_SESSION_MARKER = "cookie";
export const SESSION_MODE_HEADER = "X-Ajna-Session";
export const CSRF_HEADER = "X-Ajna-CSRF";
export const CSRF_COOKIE = "__Host-ajna_csrf";

const SAFE_METHODS: ReadonlySet<string> = new Set(["GET", "HEAD", "OPTIONS"]);

/** The `__Host-ajna_csrf` cookie value, or null when this host has none (or no document). */
export function csrfToken(): string | null {
  let raw: string;
  try {
    raw = typeof document === "undefined" ? "" : String(document.cookie ?? "");
  } catch {
    return null;
  }
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0 || part.slice(0, eq).trim() !== CSRF_COOKIE) continue;
    // Sent back exactly as set: the backend compares the raw cookie value.
    const value = part.slice(eq + 1).trim();
    return value || null;
  }
  return null;
}

/**
 * Headers for a cookie-mode request: always the opt-in, plus the CSRF echo on a write when the
 * `__Host-ajna_csrf` cookie exists.
 */
export function cookieModeHeaders(method = "GET"): Record<string, string> {
  const headers: Record<string, string> = {
    [SESSION_MODE_HEADER]: COOKIE_SESSION_MARKER,
  };
  if (SAFE_METHODS.has(method.toUpperCase())) return headers;
  const csrf = csrfToken();
  return csrf ? { ...headers, [CSRF_HEADER]: csrf } : headers;
}

/** The app's API base from the build env (`.../v1`), or null when none is configured. */
export function configuredApiBase(): string | null {
  const host = sessionConfig().apiUrl;
  if (!host) return null;
  return appApiBase(String(host), window.location.origin);
}

/**
 * Can this page use cookie sessions? Only when the API base is same-origin with the page: a
 * cross-origin API never receives the host-only cookies, and there is no other session, so such
 * a page cannot sign in.
 */
export function cookieModeAvailable(
  apiBase: string | null = configuredApiBase(),
): boolean {
  if (!apiBase) return false;
  try {
    const here = window.location.origin;
    return new URL(apiBase, here).origin === here;
  } catch {
    return false;
  }
}

/** Absolute same-origin URL for an API path, or null when cookie mode is not available. */
export function cookieModeUrl(
  path: string,
  apiBase: string | null = configuredApiBase(),
): string | null {
  if (!apiBase || !cookieModeAvailable(apiBase)) return null;
  return new URL(`${apiBase}${path}`, window.location.origin).toString();
}
