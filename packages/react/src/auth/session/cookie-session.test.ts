/**
 * Cookie sessions (M5): the header and same-origin helpers. Runs in node: window, document and
 * localStorage are stubbed. The axios side is in api-interceptor.test.ts.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  configureFreshSession,
  resetSessionEnv,
  stubSessionEnv,
} from "./testing/env";

const DOOR = "https://acme.myapp.example.test";
const API_URL = "https://myapp.example.test/api/v1";
const CSRF = "csrf-abc_123";

let store: Map<string, string>;

function installBrowser(cookie = "", origin = DOOR): void {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal(
    "window",
    Object.assign(new EventTarget(), {
      location: {
        origin,
        hostname: new URL(origin).hostname,
        pathname: "/items",
        hash: "",
        search: "",
        assign: () => {},
      },
    }),
  );
  vi.stubGlobal(
    "document",
    Object.assign(new EventTarget(), { visibilityState: "visible", cookie }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  resetSessionEnv();
});

async function loadHelpers(apiUrl = API_URL) {
  stubSessionEnv("VITE_API_URL", apiUrl);
  vi.resetModules();
  await configureFreshSession();
  return import("./cookie-session");
}

describe("cookie-session helpers", () => {
  it("opts in with the exact marker", async () => {
    installBrowser();
    const h = await loadHelpers();
    expect(h.COOKIE_SESSION_MARKER).toBe("cookie");
    expect(h.SESSION_MODE_HEADER).toBe("X-Ajna-Session");
  });

  it("reads the __Host- CSRF cookie among others, and nothing else", async () => {
    installBrowser(`a=1; ajna_csrf=old; __Host-ajna_csrf=${CSRF}; b=2`);
    const h = await loadHelpers();
    expect(h.csrfToken()).toBe(CSRF);
    installBrowser("ajna_csrf=unprefixed; x=y");
    expect(h.csrfToken()).toBeNull();
    installBrowser("");
    expect(h.csrfToken()).toBeNull();
  });

  it("adds the CSRF echo on writes only, and only when the cookie exists", async () => {
    installBrowser(`__Host-ajna_csrf=${CSRF}`);
    const h = await loadHelpers();
    expect(h.cookieModeHeaders("get")).toEqual({ "X-Ajna-Session": "cookie" });
    expect(h.cookieModeHeaders("HEAD")).toEqual({ "X-Ajna-Session": "cookie" });
    expect(h.cookieModeHeaders("post")).toEqual({
      "X-Ajna-Session": "cookie",
      "X-Ajna-CSRF": CSRF,
    });
    installBrowser("");
    expect(h.cookieModeHeaders("DELETE")).toEqual({
      "X-Ajna-Session": "cookie",
    });
  });

  it("is available only for a same-origin API", async () => {
    installBrowser();
    const h = await loadHelpers();
    // The door's injected apex API resolves to the door's own path: same-origin.
    expect(h.configuredApiBase()).toBe("/api/v1");
    expect(h.cookieModeAvailable()).toBe(true);
    expect(h.cookieModeAvailable(`${DOOR}/api/v1`)).toBe(true);
    expect(h.cookieModeAvailable("http://localhost:8000/v1")).toBe(false);
    expect(h.cookieModeAvailable(null)).toBe(false);
    expect(h.cookieModeUrl("/auth/oidc/start")).toBe(
      `${DOOR}/api/v1/auth/oidc/start`,
    );
  });

  it("is unavailable for a cross-origin API (local UI on :5173, backend on :8000)", async () => {
    installBrowser("", "http://localhost:5173");
    const h = await loadHelpers("http://localhost:8000");
    expect(h.cookieModeAvailable()).toBe(false);
    expect(h.cookieModeUrl("/auth/oidc/start")).toBeNull();
  });
});
