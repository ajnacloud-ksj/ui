/**
 * installSessionInterceptors: the axios client has ONE session, the backend's HttpOnly cookie.
 * Every call to the app's own API sends the opt-in and, on a write, the CSRF echo; none sends a
 * bearer or reads browser storage. A 401 gets ONE refresh and a replay; when that fails, the page
 * starts the BFF sign-in for the path it is on. Runs in node with a fresh axios instance.
 */
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  configureFreshSession,
  resetSessionEnv,
  stubSessionEnv,
} from "./testing/env";

const DOOR = "https://acme.myapp.example.test";
const API = "https://myapp.example.test/api/v1";
const REFRESH = `${DOOR}/api/v1/auth/oidc/refresh`;
const START = `${DOOR}/api/v1/auth/oidc/start?return=${encodeURIComponent("/items?tab=open")}`;

let sent: InternalAxiosRequestConfig[];
let assigned: string[];
let statuses: number[];
let refreshStatus: number;
let storageReads: string[];

function stubStorage(values: Record<string, string> = {}) {
  return {
    getItem: (k: string) => {
      storageReads.push(k);
      return values[k] ?? null;
    },
    setItem: () => {},
    removeItem: () => {},
  };
}

beforeEach(() => {
  sent = [];
  assigned = [];
  statuses = [];
  refreshStatus = 200;
  storageReads = [];
  const url = new URL(`${DOOR}/items?tab=open`);
  vi.stubGlobal("window", {
    location: {
      origin: url.origin,
      host: url.host,
      hostname: url.hostname,
      pathname: url.pathname,
      search: url.search,
      href: url.toString(),
      assign: (u: string) => void assigned.push(u),
    },
  });
  vi.stubGlobal("document", { cookie: "__Host-ajna_csrf=csrf-1" });
  vi.stubGlobal("localStorage", stubStorage());
  vi.stubGlobal("sessionStorage", stubStorage());
  vi.stubGlobal(
    "fetch",
    vi.fn(async (u: string) => {
      if (u !== REFRESH) throw new Error(`unexpected fetch ${u}`);
      return new Response(JSON.stringify({ token_type: "cookie" }), {
        status: refreshStatus,
      });
    }),
  );
  stubSessionEnv("VITE_API_URL", API);
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetSessionEnv();
});

async function load(baseURL = "/api/v1"): Promise<AxiosInstance> {
  vi.resetModules();
  await configureFreshSession();
  const { installSessionInterceptors } = await import("./api-interceptor");
  const instance = axios.create({ baseURL });
  installSessionInterceptors(instance);
  instance.defaults.adapter = async (config) => {
    sent.push(config);
    const status = statuses.shift() ?? 200;
    const response = { data: {}, status, statusText: "", headers: {}, config };
    if (status >= 400)
      throw new AxiosError("fail", "ERR", config, null, response);
    return response;
  };
  return instance;
}

const header = (c: InternalAxiosRequestConfig, name: string) =>
  c.headers.get(name) ?? undefined;

describe("cookie mode is the only path", () => {
  it("sends the opt-in and the cookies, and never a bearer", async () => {
    const api = await load();
    await api.get("/items");
    const [c] = sent;
    expect(c.withCredentials).toBe(true);
    expect(header(c, "X-Ajna-Session")).toBe("cookie");
    expect(header(c, "X-Ajna-CSRF")).toBeUndefined();
    expect(header(c, "Authorization")).toBeUndefined();
  });

  it("echoes the CSRF cookie on a write", async () => {
    const api = await load();
    await api.post("/items", { name: "x" });
    expect(header(sent[0], "X-Ajna-CSRF")).toBe("csrf-1");
  });

  it("reads no session from localStorage or sessionStorage", async () => {
    const api = await load();
    await api.get("/items");
    await api.post("/items", {});
    expect(storageReads).toEqual([]);
  });

  it("sends no session header to another origin", async () => {
    const api = await load();
    await api.post("https://evil.example/collect", {});
    expect(header(sent[0], "X-Ajna-Session")).toBeUndefined();
    expect(header(sent[0], "X-Ajna-CSRF")).toBeUndefined();
    expect(sent[0].withCredentials).toBeFalsy();
  });

  it("sends no session header when the API itself is cross-origin", async () => {
    const api = await load("http://localhost:8000/v1");
    await api.post("/items", {});
    expect(header(sent[0], "X-Ajna-Session")).toBeUndefined();
  });
});

describe("a 401", () => {
  it("gets ONE refresh, then the call is replayed", async () => {
    statuses = [401, 200];
    const api = await load();
    await expect(api.get("/items")).resolves.toMatchObject({ status: 200 });
    expect(sent).toHaveLength(2);
    expect(vi.mocked(fetch).mock.calls.map((c) => c[0])).toEqual([REFRESH]);
    expect(assigned).toEqual([]);
  });

  it("with a refused refresh starts the BFF sign-in for this page", async () => {
    statuses = [401];
    refreshStatus = 401;
    const api = await load();
    await expect(api.get("/items")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(assigned).toEqual([START]);
  });

  it("after the replay (refresh worked, still 401) starts the BFF sign-in, no second refresh", async () => {
    statuses = [401, 401];
    const api = await load();
    await expect(api.get("/items")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    expect(assigned).toEqual([START]);
  });

  it("with a refresh that could not reach the backend fails the call, no sign-in", async () => {
    statuses = [401];
    refreshStatus = 503;
    const api = await load();
    await expect(api.get("/items")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(assigned).toEqual([]);
  });

  it("from the session check itself is an answer: no refresh", async () => {
    statuses = [401];
    const api = await load();
    await expect(api.get("/auth/me")).rejects.toBeInstanceOf(AxiosError);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("after a sign-out in another tab starts nothing", async () => {
    statuses = [401];
    refreshStatus = 401;
    const api = await load();
    vi.stubGlobal(
      "localStorage",
      stubStorage({ ajna_signed_out_at: String(Date.now()) }),
    );
    await expect(api.get("/items")).rejects.toBeInstanceOf(AxiosError);
    expect(assigned).toEqual([]);
  });

  it("when the loop guard holds, drops the user for the route guard and starts nothing", async () => {
    statuses = [401];
    refreshStatus = 401;
    const api = await load();
    const store = await import("./session-store");
    store.setSessionUser({
      user_id: "u-1",
      username: "pat@example.com",
      email: "pat@example.com",
      role: "admin",
      tenant_id: "acme",
      company_name: null,
    });
    vi.stubGlobal(
      "sessionStorage",
      stubStorage({ bff_auto_sign_in_count: `${Date.now()}:2` }),
    );
    await expect(api.get("/items")).rejects.toBeInstanceOf(AxiosError);
    expect(assigned).toEqual([]);
    expect(store.sessionUser()).toBeNull();
  });

  it("while signing out starts nothing (the sign-out owns the navigation)", async () => {
    statuses = [401];
    const api = await load();
    const { markLeaving } = await import("./session-store");
    markLeaving();
    await expect(api.get("/items")).rejects.toBeInstanceOf(AxiosError);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    expect(assigned).toEqual([]);
  });
});
