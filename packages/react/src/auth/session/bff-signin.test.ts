/**
 * The app's only sign-in: the backend (BFF) sign-in (ajna-app-infra#1554). Ported from
 * plant-manager-ui#166. The start URL, the
 * boot session check (with one refresh on a 401), the route guard's decision and loop guard,
 * the refresh, the sign-out, and the one-time purge of old browser tokens.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  configureFreshSession,
  resetSessionEnv,
  stubSessionEnv,
} from "./testing/env";

const APP = "https://myapp.example.test";
const DOOR = "https://acme.myapp.example.test";
const ME = `${DOOR}/api/v1/auth/me`;
const REFRESH = `${DOOR}/api/v1/auth/oidc/refresh`;
const LOGOUT = `${DOOR}/api/v1/auth/logout`;
const USER = {
  user_id: "u-1",
  username: "ana@acme.example",
  email: "ana@acme.example",
  role: "admin",
  tenant_id: "acme",
  company_name: null,
};

let store: Map<string, string>;
let session: Map<string, string>;
let assigned: string[];
let cookie: string;
let fetchMock: ReturnType<typeof vi.fn>;
let replies: Record<string, () => Response | Promise<Response>>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function stubPage(origin: string, path = "/items", search = "") {
  const url = new URL(`${origin}${path}${search}`);
  vi.stubGlobal("window", {
    location: {
      origin: url.origin,
      host: url.host,
      hostname: url.hostname,
      protocol: url.protocol,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      href: url.toString(),
      assign: (u: string) => void assigned.push(u),
    },
  });
}

beforeEach(() => {
  store = new Map();
  session = new Map();
  assigned = [];
  cookie = "__Host-ajna_csrf=csrf-1";
  const mapStorage = (m: Map<string, string>) => ({
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
  });
  vi.stubGlobal("localStorage", mapStorage(store));
  vi.stubGlobal("sessionStorage", mapStorage(session));
  vi.stubGlobal("document", {
    get cookie() {
      return cookie;
    },
  });
  stubPage(DOOR);
  replies = {
    [ME]: () => json(USER),
    [REFRESH]: () => json({ token_type: "cookie" }),
    [LOGOUT]: () => json({ success: true }),
  };
  fetchMock = vi.fn(async (url: string) => {
    const reply = replies[url];
    if (!reply) throw new Error(`unexpected fetch ${url}`);
    return reply();
  });
  vi.stubGlobal("fetch", fetchMock);
  stubSessionEnv("VITE_API_URL", `${APP}/api/v1`);
  stubSessionEnv("VITE_PORTAL_ORG_HOST", "");
  stubSessionEnv("VITE_DEFAULT_TENANT", "");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  resetSessionEnv();
});

async function load() {
  vi.resetModules();
  await configureFreshSession();
  const bff = await import("./bff-signin");
  const sessionStore = await import("./session-store");
  return { bff, sessionStore };
}

const calledUrls = () => fetchMock.mock.calls.map((c) => c[0] as string);
const headersOf = (index: number) =>
  (fetchMock.mock.calls[index][1] as RequestInit).headers;

describe("the start URL", () => {
  it("is same-origin /api/v1/auth/oidc/start with the current page as return", async () => {
    const { bff } = await load();
    expect(bff.bffStartUrl()).toBe(
      `${DOOR}/api/v1/auth/oidc/start?return=%2Fitems`,
    );
  });

  it("every start marks the tab; only an automatic start counts, and a click resets the count", async () => {
    const { bff } = await load();
    bff.beginBffLogin({ auto: true, returnTo: "/items/7" });
    const url = new URL(assigned[0]);
    expect(url.pathname).toBe("/api/v1/auth/oidc/start");
    expect(url.searchParams.get("return")).toBe("/items/7");
    expect(Number(session.get(bff.AUTO_STARTED_KEY))).toBeGreaterThan(0);
    expect(session.get(bff.AUTO_START_COUNT_KEY)).toMatch(/^\d+:1$/);
    bff.beginBffLogin({ returnTo: "/items/7" });
    expect(Number(session.get(bff.AUTO_STARTED_KEY))).toBeGreaterThan(0);
    expect(session.has(bff.AUTO_START_COUNT_KEY)).toBe(false);
  });

  it.each([
    ["//evil.example/x", "/items"],
    ["/\\evil.example", "/items"],
    ["https://evil.example/", "/items"],
    ["/login", "/items"],
    ["/auth/callback?code=x", "/items"],
  ])(
    "an unsafe or old sign-in return %j falls back to the current page",
    async (bad, want) => {
      const { bff } = await load();
      expect(
        new URL(bff.bffStartUrl({ returnTo: bad })!).searchParams.get("return"),
      ).toBe(want);
    },
  );

  it("an old /login bookmark returns to / (never to a sign-in page)", async () => {
    stubPage(DOOR, "/login", "?reason=idle");
    const { bff } = await load();
    expect(bff.currentPath()).toBe("/");
  });

  it("drops ?auth_error from the return path", async () => {
    stubPage(DOOR, "/orders", "?auth_error=state&tab=open");
    const { bff } = await load();
    expect(bff.currentPath()).toBe("/orders?tab=open");
  });

  it("is refused on the bare app host (the cockpit has no callback for it)", async () => {
    stubPage(APP);
    const { bff } = await load();
    expect(() => bff.beginBffLogin()).toThrow(/organisation's address/);
    expect(assigned).toEqual([]);
  });

  it("is null for a cross-origin API, and the start throws instead of a token exchange", async () => {
    stubSessionEnv("VITE_API_URL", "http://localhost:8002/v1");
    const { bff } = await load();
    expect(bff.bffStartUrl()).toBeNull();
    expect(() => bff.beginBffLogin()).toThrow(/own address/);
  });

  it("a relative API base is this page's own origin (local dev through the Vite proxy)", async () => {
    stubSessionEnv("VITE_API_URL", "/api/v1");
    const { bff } = await load();
    expect(bff.bffStartUrl()).toBe(
      `${DOOR}/api/v1/auth/oidc/start?return=%2Fitems`,
    );
  });
});

describe("bootSession", () => {
  it("adopts the cookie session from /auth/me, in memory only", async () => {
    const { bff, sessionStore } = await load();
    expect(await bff.bootSession()).toBe("signed_in");
    expect(sessionStore.sessionUser()).toEqual({
      user_id: "u-1",
      username: "ana@acme.example",
      email: "ana@acme.example",
      role: "admin",
      tenant_id: "acme",
      company_name: null,
    });
    expect(calledUrls()).toEqual([ME]);
    expect(headersOf(0)).toEqual({
      "X-Ajna-Session": "cookie",
      "X-Tenant-ID": "acme",
    });
    expect([...store.keys()]).toEqual([]);
  });

  it("unwraps a {success, data} envelope; a UUID username shows the email", async () => {
    replies[ME] = () =>
      json({
        success: true,
        data: { ...USER, username: "3f2a-uuid", role: "user" },
      });
    const { bff, sessionStore } = await load();
    await bff.bootSession();
    expect(sessionStore.sessionUser()).toMatchObject({
      role: "user",
      username: "ana@acme.example",
    });
  });

  it("a 401 gets ONE refresh, then /auth/me again", async () => {
    let first = true;
    replies[ME] = () => {
      const reply = first ? json({ error: "x" }, 401) : json(USER);
      first = false;
      return reply;
    };
    const { bff } = await load();
    expect(await bff.bootSession()).toBe("signed_in");
    expect(calledUrls()).toEqual([ME, REFRESH, ME]);
    expect(headersOf(1)).toMatchObject({
      "X-Ajna-Session": "cookie",
      "X-Ajna-CSRF": "csrf-1",
    });
  });

  it("a 401 with a refused refresh is signed out", async () => {
    replies[ME] = () => json({ error: "x" }, 401);
    replies[REFRESH] = () => json({ error: "No refresh session" }, 401);
    const { bff, sessionStore } = await load();
    expect(await bff.bootSession()).toBe("signed_out");
    expect(calledUrls()).toEqual([ME, REFRESH]);
    expect(sessionStore.sessionUser()).toBeNull();
  });

  it.each([
    ["a 403 (not a member)", () => json({ code: "tenant_not_member" }, 403)],
    ["a body with no user", () => json({ role: "admin" })],
  ])("%s is account_failed, not a sign-in loop", async (_name, reply) => {
    replies[ME] = reply;
    const { bff } = await load();
    expect(await bff.bootSession()).toBe("account_failed");
  });

  it("a 5xx gets one retry; a second 5xx is unreachable, and Try again reloads", async () => {
    vi.useFakeTimers();
    replies[ME] = () => json({}, 503);
    const { bff } = await load();
    const boot = bff.bootSession();
    await vi.advanceTimersByTimeAsync(bff.BOOT_RETRY_MS);
    expect(await boot).toBe("unreachable");
    expect(calledUrls()).toEqual([ME, ME]);
    expect(bff.signInDecision(false)).toMatchObject({
      kind: "stopped",
      retry: "reload",
    });
  });

  it("a cold 5xx then a good /auth/me signs in", async () => {
    vi.useFakeTimers();
    let first = true;
    replies[ME] = () => {
      const reply = first ? json({}, 502) : json(USER);
      first = false;
      return reply;
    };
    const { bff } = await load();
    const boot = bff.bootSession();
    await vi.advanceTimersByTimeAsync(bff.BOOT_RETRY_MS);
    expect(await boot).toBe("signed_in");
  });

  it("an idle-expired session is not refreshed at boot", async () => {
    replies[ME] = () => json({}, 401);
    store.set("ajna_idle_minutes", "5");
    store.set("ajna_last_activity", String(Date.now() - 10 * 60 * 1000));
    const { bff } = await load();
    expect(await bff.bootSession()).toBe("signed_out");
    expect(calledUrls()).toEqual([ME]);
    expect(store.has("ajna_last_activity")).toBe(false);
  });

  it("a network error is unreachable, and the guard says so instead of looping", async () => {
    vi.useFakeTimers();
    replies[ME] = () => Promise.reject(new TypeError("offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { bff } = await load();
    const boot = bff.bootSession();
    await vi.advanceTimersByTimeAsync(bff.BOOT_RETRY_MS);
    expect(await boot).toBe("unreachable");
    expect(bff.signInDecision(false)).toMatchObject({
      kind: "stopped",
      message: expect.stringMatching(/Check your connection/),
    });
  });

  it("skips the bare app host (it cannot sign in) without a call", async () => {
    stubPage(APP);
    const { bff } = await load();
    expect(await bff.bootSession()).toBe("skipped");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("purges every token an older bundle stored, once", async () => {
    for (const key of [
      "auth_token",
      "auth_user",
      "auth_refresh_token",
      "auth_id_token",
    ]) {
      store.set(key, "old");
    }
    store.set("handoff_refresh", "old");
    store.set("auth_kind", "old");
    store.set("theme", "dark");
    session.set("hosted_auth_pkce_verifier", "v");
    session.set("active_tenant", "acme");
    const { bff } = await load();
    await bff.bootSession();
    expect([...store.keys()]).toEqual(["theme"]);
    expect([...session.keys()]).toEqual([]);
  });

  it("restarts the idle clock only when this tab is back from its own sign-in", async () => {
    const { bff } = await load();
    await bff.bootSession();
    expect(store.has("ajna_last_activity")).toBe(false);
    session.set(bff.AUTO_STARTED_KEY, String(Date.now()));
    await bff.bootSession();
    expect(store.has("ajna_last_activity")).toBe(true);
    expect(session.has(bff.AUTO_STARTED_KEY)).toBe(false);
  });
});

describe("signInDecision (the route guard, nobody signed in)", () => {
  it("starts the sign-in with no click", async () => {
    replies[ME] = () => json({}, 401);
    replies[REFRESH] = () => json({}, 401);
    const { bff } = await load();
    await bff.bootSession();
    expect(bff.signInDecision(false)).toEqual({ kind: "start" });
  });

  it("shows nothing to sign in to while a sign-out is under way", async () => {
    const { bff } = await load();
    expect(bff.signInDecision(true)).toEqual({ kind: "leaving" });
  });

  it("stops on a callback error", async () => {
    const { bff } = await load();
    expect(bff.signInDecision(false, "?auth_error=denied")).toEqual({
      kind: "stopped",
      message: "Sign-in was cancelled or denied.",
      retry: "sign-in",
    });
    expect(bff.signInDecision(false, "?auth_error=zzz")).toMatchObject({
      kind: "stopped",
    });
  });

  it("stops after MAX_AUTO_STARTS automatic starts, even when /auth/me signs in between", async () => {
    const { bff } = await load();
    for (let i = 0; i < bff.MAX_AUTO_STARTS; i += 1) {
      bff.beginBffLogin({ auto: true });
      await bff.bootSession(); // back with a session: the "returned" mark clears, the count stays
    }
    expect(bff.signInDecision(false)).toMatchObject({
      kind: "stopped",
      message: expect.stringMatching(/keeps ending/),
      retry: "sign-in",
    });
  });

  it("stops when its own automatic start came back without a session (no loop)", async () => {
    const { bff } = await load();
    session.set(bff.AUTO_STARTED_KEY, String(Date.now()));
    expect(bff.signInDecision(false)).toMatchObject({ kind: "stopped" });
    session.set(
      bff.AUTO_STARTED_KEY,
      String(Date.now() - bff.AUTO_START_WINDOW_MS - 1),
    );
    expect(bff.signInDecision(false)).toEqual({ kind: "start" });
  });

  it("stops when the account could not be loaded", async () => {
    replies[ME] = () => json({}, 403);
    const { bff } = await load();
    await bff.bootSession();
    expect(bff.signInDecision(false)).toMatchObject({
      kind: "stopped",
      message: expect.stringMatching(/could not load your account/),
    });
  });

  it("on the bare app host says to use the organisation's address", async () => {
    stubPage(APP);
    const { bff } = await load();
    expect(bff.signInDecision(false)).toMatchObject({
      kind: "unavailable",
      message: expect.stringMatching(/organisation's address/),
    });
  });

  it("on the bare app host goes to the dev default tenant's door when one is set", async () => {
    stubPage(APP, "/items");
    stubSessionEnv("VITE_DEFAULT_TENANT", "acme");
    const { bff } = await load();
    expect(bff.signInDecision(false)).toEqual({
      kind: "door",
      url: `${DOOR}/items`,
    });
  });

  it("is unavailable for a cross-origin API", async () => {
    stubSessionEnv("VITE_API_URL", "http://localhost:8002/v1");
    const { bff } = await load();
    expect(bff.signInDecision(false)).toMatchObject({ kind: "unavailable" });
  });
});

describe("refreshBffSession", () => {
  it("shares one request between concurrent callers", async () => {
    const { bff } = await load();
    const [a, b] = await Promise.all([
      bff.refreshBffSession(),
      bff.refreshBffSession(),
    ]);
    expect([a, b]).toEqual(["refreshed", "refreshed"]);
    expect(calledUrls()).toEqual([REFRESH]);
  });

  it("a 4xx is refused (the session is over); a 5xx or network error is failed", async () => {
    const { bff } = await load();
    replies[REFRESH] = () => json({}, 401);
    expect(await bff.refreshBffSession()).toBe("refused");
    replies[REFRESH] = () => json({}, 502);
    expect(await bff.refreshBffSession()).toBe("failed");
    replies[REFRESH] = () => Promise.reject(new TypeError("offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await bff.refreshBffSession()).toBe("failed");
  });
});

describe("signOutBffSession", () => {
  it("clears the backend cookies (cookie mode, CSRF echo, no bearer) and forgets the user", async () => {
    const { bff, sessionStore } = await load();
    await bff.bootSession();
    store.set("auth_token", "old");
    store.set("ajna_last_activity", "1");
    const destination = await bff.signOutBffSession();
    const logout = fetchMock.mock.calls.find((c) => c[0] === LOGOUT)!;
    const init = logout[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "X-Ajna-Session": "cookie",
      "X-Ajna-CSRF": "csrf-1",
    });
    expect(sessionStore.sessionUser()).toBeNull();
    expect(store.has("auth_token")).toBe(false);
    expect(store.has("ajna_last_activity")).toBe(false);
    // A tenant door's portal is its organisation's door (portal-url.ts).
    expect(destination).toBe(
      "https://acme.example.test/?signed_out=acme.myapp.example.test",
    );
    // Other tabs follow it (sign-out.ts watchSignOutInOtherTabs).
    expect(Number(store.get(bff.SIGNED_OUT_AT_KEY))).toBeGreaterThan(0);
    expect(bff.signedOutRecently()).toBe(true);
  });

  it("passes reason=idle to the portal for an idle sign-out", async () => {
    const { bff } = await load();
    const destination = new URL(
      await bff.signOutBffSession({ reason: "idle" }),
    );
    expect(destination.searchParams.get("reason")).toBe("idle");
  });

  it("does not wait for a backend that never answers", async () => {
    vi.useFakeTimers();
    replies[LOGOUT] = () => new Promise<Response>(() => {});
    const { bff } = await load();
    const done = bff.signOutBffSession();
    await vi.advanceTimersByTimeAsync(bff.SIGN_OUT_WAIT_MS);
    await expect(done).resolves.toMatch(/^https:\/\/acme\.example\.test\//);
  });
});
