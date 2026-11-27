/**
 * Sign-out (sign-out.ts): the app's cleanups run first, then the backend session ends, then the
 * page goes to the portal. A sign-out in one tab signs out the other open tabs of this app.
 * Without that, the other tab's next 401 starts the sign-in again, and the portal signs the user
 * straight back in.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  configureFreshSession,
  resetSessionEnv,
  stubSessionEnv,
} from "./testing/env";

const HOST = "acme.myapp.example.test";
const PORTAL = `https://acme.example.test/?signed_out=${HOST}`;
const USER = {
  user_id: "u",
  username: "pat@example.com",
  email: "pat@example.com",
  role: "admin",
  tenant_id: "acme",
  company_name: null,
};

let assigned: string[];
let listener: ((event: StorageEvent) => void) | null;
const target = {
  addEventListener: (_t: "storage", l: (event: StorageEvent) => void) =>
    void (listener = l),
  removeEventListener: () => void (listener = null),
};

beforeEach(() => {
  assigned = [];
  listener = null;
  vi.stubGlobal("window", {
    location: {
      host: HOST,
      hostname: HOST,
      origin: `https://${HOST}`,
      assign: (u: string) => void assigned.push(u),
    },
  });
  vi.stubGlobal("document", { cookie: "" });
  const noop = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  vi.stubGlobal("localStorage", noop);
  vi.stubGlobal("sessionStorage", noop);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 200 })),
  );
  stubSessionEnv("VITE_API_URL", "https://myapp.example.test/api/v1");
  stubSessionEnv("VITE_PORTAL_ORG_HOST", "");
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetSessionEnv();
});

async function load(signedIn: boolean) {
  vi.resetModules();
  await configureFreshSession();
  const store = await import("./session-store");
  const signOut = await import("./sign-out");
  if (signedIn) store.setSessionUser(USER);
  return { store, signOut };
}

const event = (key: string, newValue: string | null) =>
  ({ key, newValue }) as StorageEvent;

describe("signOut", () => {
  it("runs the app's cleanups, ends the backend session, then goes to the portal", async () => {
    const { store, signOut } = await load(true);
    const order: string[] = [];
    signOut.onSignOut(() => order.push("cleanup"));
    vi.mocked(fetch).mockImplementation(async () => {
      order.push("logout");
      return new Response("{}", { status: 200 });
    });
    await signOut.signOut("user");
    expect(order).toEqual(["cleanup", "logout"]);
    expect(store.sessionUser()).toBeNull();
    expect(assigned).toEqual([PORTAL]);
  });

  it("a second call while leaving does nothing", async () => {
    const { signOut } = await load(true);
    await Promise.all([signOut.signOut(), signOut.signOut()]);
    expect(assigned).toHaveLength(1);
  });

  it("an unsubscribed cleanup does not run", async () => {
    const { signOut } = await load(true);
    const cleanup = vi.fn();
    signOut.onSignOut(cleanup)();
    await signOut.signOut();
    expect(cleanup).not.toHaveBeenCalled();
  });
});

describe("watchSignOutInOtherTabs", () => {
  it("a sign-out in another tab drops this tab's user and data, and goes to the portal", async () => {
    const { store, signOut } = await load(true);
    const cleanup = vi.fn();
    signOut.onSignOut(cleanup);
    signOut.watchSignOutInOtherTabs(target);
    listener!(event("ajna_signed_out_at", String(Date.now())));
    expect(cleanup).toHaveBeenCalledOnce();
    expect(store.sessionUser()).toBeNull();
    expect(store.isLeaving()).toBe(true);
    expect(assigned).toEqual([PORTAL]);
  });

  it("ignores other keys, and a tab with nobody signed in", async () => {
    let { signOut } = await load(true);
    signOut.watchSignOutInOtherTabs(target);
    listener!(event("theme", "dark"));
    expect(assigned).toEqual([]);
    ({ signOut } = await load(false));
    signOut.watchSignOutInOtherTabs(target);
    listener!(event("ajna_signed_out_at", String(Date.now())));
    expect(assigned).toEqual([]);
  });
});
