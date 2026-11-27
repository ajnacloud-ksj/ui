import { describe, expect, it, vi } from "vitest";

import {
  ConfigError,
  type ConfigPins,
  fetchAuthConfig,
  httpSessionClient,
  parseAuthConfig,
  safeNextPath,
} from "./http";
import { SessionError } from "./machine";

const POOL = "ap-south-1_TESTPOOL0";
const PINS: ConfigPins = {
  poolIds: [POOL],
  logoHosts: ["static.example.test"],
  doorZone: "example.test",
};

const GOOD = {
  pool: { id: POOL, region: "ap-south-1", client_id: "testclient0" },
  flows: { srp: true, forgot_password: true, sign_up: false, federation: [] },
  mfa: { mode: "OPTIONAL", types: ["TOTP"] },
  password_policy: {
    min_length: 8,
    require_upper: true,
    require_lower: true,
    require_digit: true,
    require_symbol: false,
  },
  branding: {
    display_name: "Acme",
    logo_url: "https://static.example.test/brand/acme.png",
    primary_color: "#1A73E8",
    org_slug: "acme",
    app: { name: "plant-manager", display_name: "Plant Manager" },
  },
  collector: { enabled: false, url: null },
  bundle_version: "2026.11.26-1",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const withBranding = (patch: Record<string, unknown>) => ({
  ...GOOD,
  branding: { ...GOOD.branding, ...patch },
});

describe("parseAuthConfig (spec A1)", () => {
  it("accepts the spec shape and keeps what the page needs", () => {
    expect(parseAuthConfig(GOOD, PINS)).toMatchObject({
      poolId: POOL,
      region: "ap-south-1",
      clientId: "testclient0",
      forgotPassword: true,
      mfaMode: "OPTIONAL",
      orgSlug: "acme",
      doorZone: "example.test",
      branding: {
        displayName: "Acme",
        appDisplayName: "Plant Manager",
        primaryColor: "#1a73e8",
      },
      collectorUrl: null,
    });
  });

  it("accepts a page with no org context (null or missing)", () => {
    expect(
      parseAuthConfig(withBranding({ org_slug: null }), PINS).orgSlug,
    ).toBeNull();
    const branding = Object.fromEntries(
      Object.entries(GOOD.branding).filter(([key]) => key !== "org_slug"),
    );
    expect(parseAuthConfig({ ...GOOD, branding }, PINS).orgSlug).toBeNull();
  });

  it.each([
    [
      "a pool id without a region",
      { ...GOOD, pool: { ...GOOD.pool, id: "TESTPOOL0" } },
    ],
    [
      "a region that differs from the pool id",
      { ...GOOD, pool: { ...GOOD.pool, region: "us-east-1" } },
    ],
    [
      "a client id with odd characters",
      { ...GOOD, pool: { ...GOOD.pool, client_id: "abc<script>" } },
    ],
    [
      "an http logo",
      withBranding({ logo_url: "http://static.example.test/a.png" }),
    ],
    ["a javascript: logo", withBranding({ logo_url: "javascript:alert(1)" })],
    ["a colour that is not #rrggbb", withBranding({ primary_color: "red" })],
    ["an unknown MFA mode", { ...GOOD, mfa: { ...GOOD.mfa, mode: "MAYBE" } }],
    [
      "a collector outside Cognito",
      {
        ...GOOD,
        collector: { enabled: true, url: "https://evil.example/c.js" },
      },
    ],
    ["not an object", "nope"],
  ])("refuses %s", (_label, value) => {
    expect(() => parseAuthConfig(value, PINS)).toThrow(ConfigError);
  });

  it("accepts the Cognito collector URL for the pool's region only", () => {
    const url =
      "https://amazon-cognito-assets.ap-south-1.amazoncognito.com/amazon-cognito-advanced-security-data.min.js";
    expect(
      parseAuthConfig({ ...GOOD, collector: { enabled: true, url } }, PINS)
        .collectorUrl,
    ).toBe(url);
    expect(() =>
      parseAuthConfig(
        {
          ...GOOD,
          collector: {
            enabled: true,
            url: url.replace("ap-south-1", "us-east-1"),
          },
        },
        PINS,
      ),
    ).toThrow(ConfigError);
  });

  it("keeps the display name as plain text, cut to 40 characters", () => {
    const cfg = parseAuthConfig(
      withBranding({ display_name: "<b>" + "x".repeat(60) }),
      PINS,
    );
    expect(cfg.branding.displayName).toHaveLength(40);
    expect(cfg.branding.displayName.startsWith("<b>")).toBe(true);
  });
});

describe("pinning (review M3, M4)", () => {
  it("fails closed when no pool is pinned", () => {
    expect(() => parseAuthConfig(GOOD, { ...PINS, poolIds: [] })).toThrow(
      ConfigError,
    );
  });

  it("refuses a pool that is not pinned, even a well-formed one", () => {
    const other = {
      ...GOOD,
      pool: { ...GOOD.pool, id: "ap-south-1_OTHERPOOL" },
    };
    expect(() => parseAuthConfig(other, PINS)).toThrow(ConfigError);
  });

  it("accepts a logo only on a pinned host, exactly", () => {
    expect(
      parseAuthConfig(
        withBranding({ logo_url: "https://static.example.test/a.png" }),
        PINS,
      ).branding.logoUrl,
    ).toBe("https://static.example.test/a.png");
    for (const bad of [
      "https://cdn.example.test/a.png",
      "https://static.example.test.evil.example/a.png",
      "https://u:p@static.example.test/a.png",
      "https://evil.example/a.png",
    ]) {
      expect(() =>
        parseAuthConfig(withBranding({ logo_url: bad }), PINS),
      ).toThrow(ConfigError);
    }
  });

  it.each([5, 100, 7.5, "8", -1])(
    "refuses a password min_length of %j",
    (min_length) => {
      expect(() =>
        parseAuthConfig(
          { ...GOOD, password_policy: { ...GOOD.password_policy, min_length } },
          PINS,
        ),
      ).toThrow(ConfigError);
    },
  );
});

describe("fetchAuthConfig", () => {
  it("reads GET /v1/auth/config same-origin, uncached, without following a redirect", async () => {
    const fetchImpl = vi.fn(async () => json(200, GOOD));
    await fetchAuthConfig(PINS, fetchImpl);
    expect(fetchImpl).toHaveBeenCalledWith(
      "/v1/auth/config",
      expect.objectContaining({
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
      }),
    );
  });

  it("refuses a non-200 answer", async () => {
    await expect(
      fetchAuthConfig(PINS, async () => json(503, { code: "unavailable" })),
    ).rejects.toThrow(ConfigError);
  });
});

describe("safeNextPath (review H1)", () => {
  it.each([
    "/\t/evil.example",
    "/\n/evil.example",
    "/\r/evil.example",
    "/\\evil.example",
    "/x\\y",
    "https://evil.example/",
    "//evil.example",
    "/.//evil.example",
    "/a/..//evil.example",
    "/%2e//evil.example",
    "/%2E%2E//evil.example",
    "/a/./b",
    "/a/../b",
    "",
  ])("refuses %j", (value) => {
    expect(safeNextPath(value)).toBeNull();
  });

  it("keeps a real path, query and hash unchanged", () => {
    expect(safeNextPath("/v1/oidc/authorize/continue?request=r1#x")).toBe(
      "/v1/oidc/authorize/continue?request=r1#x",
    );
  });
});

describe("httpSessionClient (spec A2)", () => {
  const tokens = { id_token: "i", access_token: "a", refresh_token: "r" };
  const client = (fetchImpl: Parameters<typeof httpSessionClient>[1]) =>
    httpSessionClient({ doorZone: "example.test" }, fetchImpl);

  it("POSTs the tokens as JSON, same origin, never following a redirect", async () => {
    const fetchImpl = vi.fn(async () =>
      json(200, { next: "/v1/oidc/authorize/continue?request=r1", user: {} }),
    );
    await expect(client(fetchImpl).postSession(tokens)).resolves.toEqual({
      next: "/v1/oidc/authorize/continue?request=r1",
    });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("/v1/auth/session");
    expect(init).toMatchObject({
      method: "POST",
      credentials: "same-origin",
      redirect: "error",
    });
    expect(JSON.parse(String(init.body))).toEqual(tokens);
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it.each([
    "https://evil.example/",
    "//evil.example/x",
    "/\\evil.example",
    "/.//evil.example",
    "javascript:alert(1)",
    "",
  ])(
    "refuses a next value that is not a same-origin path: %j",
    async (next) => {
      await expect(
        client(async () => json(200, { next })).postSession(tokens),
      ).rejects.toMatchObject({
        code: "unavailable",
      });
    },
  );

  it("keeps only org doors on the pinned zone, https and without userinfo", async () => {
    const orgs = [
      { slug: "beta", display_name: "Beta", door: "https://beta.example.test" },
      { slug: "evil", display_name: "Evil", door: "https://beta.evil.example" },
      {
        slug: "look",
        display_name: "Look",
        door: "https://beta.example.test.evil.example",
      },
      {
        slug: "user",
        display_name: "User",
        door: "https://u:p@beta.example.test",
      },
      { slug: "js", display_name: "Js", door: "javascript:alert(1)" },
    ];
    const err = await client(async () =>
      json(403, { code: "not_org_member", orgs }),
    )
      .postSession(tokens)
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(SessionError);
    expect(err).toMatchObject({
      code: "not_org_member",
      orgs: [
        {
          slug: "beta",
          display_name: "Beta",
          door: "https://beta.example.test/",
        },
      ],
    });
  });

  it("drops every org door when no door zone is pinned", async () => {
    const orgs = [
      { slug: "beta", display_name: "Beta", door: "https://beta.example.test" },
    ];
    await expect(
      httpSessionClient({ doorZone: null }, async () =>
        json(403, { code: "not_org_member", orgs }),
      ).postSession(tokens),
    ).rejects.toMatchObject({ orgs: [] });
  });

  it.each([
    [401, "token_invalid", "token_invalid"],
    [401, "auth_time_stale", "auth_time_stale"],
    [403, "MEMBERSHIP_SUSPENDED", "MEMBERSHIP_SUSPENDED"],
    [429, "rate_limited", "rate_limited"],
    [500, "anything", "unavailable"],
    [403, "made_up_code", "unavailable"],
  ])("maps %i %s to %s", async (status, code, expected) => {
    await expect(
      client(async () => json(status, { code })).postSession(tokens),
    ).rejects.toMatchObject({
      code: expected,
    });
  });

  it("maps a network failure to unavailable", async () => {
    await expect(
      client(async () => {
        throw new TypeError("Failed to fetch");
      }).postSession(tokens),
    ).rejects.toMatchObject({ code: "unavailable" });
  });
});

describe("apiBase (a host that routes its backend under a path, e.g. the portal's /api)", () => {
  it("reads the config and posts the session under the pinned base", async () => {
    const pins = { ...PINS, apiBase: "/api" };
    const cfgFetch = vi.fn(async () => json(200, GOOD));
    const cfg = await fetchAuthConfig(pins, cfgFetch);
    expect((cfgFetch.mock.calls[0] as unknown as [string])[0]).toBe(
      "/api/v1/auth/config",
    );
    expect(cfg.apiBase).toBe("/api");

    const sessionFetch = vi.fn(async () =>
      json(200, { next: "/api/v1/oidc/authorize/continue?request=r1" }),
    );
    await httpSessionClient(
      { doorZone: "example.test", apiBase: cfg.apiBase },
      sessionFetch,
    ).postSession({
      id_token: "i",
      access_token: "a",
      refresh_token: "r",
    });
    expect((sessionFetch.mock.calls[0] as unknown as [string])[0]).toBe(
      "/api/v1/auth/session",
    );
  });

  it("defaults to the site root", async () => {
    const cfgFetch = vi.fn(async () => json(200, GOOD));
    expect((await fetchAuthConfig(PINS, cfgFetch)).apiBase).toBe("");
    expect((cfgFetch.mock.calls[0] as unknown as [string])[0]).toBe(
      "/v1/auth/config",
    );
  });

  it.each([
    "api",
    "/api/",
    "//evil.example",
    "/a b",
    "https://x.example/api",
    "/api/../x",
  ])("refuses the base %j", (apiBase) => {
    expect(() => parseAuthConfig(GOOD, { ...PINS, apiBase })).toThrow(
      ConfigError,
    );
  });
});

describe("httpSessionClient apiBase", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "/api/",
    "api",
    "/a/../b",
    "/a?x",
  ])("refuses a bad apiBase %j when it is built", (apiBase) => {
    expect(() =>
      httpSessionClient({ doorZone: null, apiBase }, vi.fn()),
    ).toThrow();
  });

  it("accepts the root and a plain path", () => {
    expect(() => httpSessionClient({ doorZone: null }, vi.fn())).not.toThrow();
    expect(() =>
      httpSessionClient({ doorZone: null, apiBase: "/api" }, vi.fn()),
    ).not.toThrow();
  });
});
