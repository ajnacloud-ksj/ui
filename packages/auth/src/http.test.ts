import { describe, expect, it, vi } from "vitest";

import {
  ConfigError,
  fetchAuthConfig,
  httpSessionClient,
  parseAuthConfig,
  safeNextPath,
  trustedZoneOf,
} from "./http";
import { SessionError } from "./machine";

const GOOD = {
  pool: {
    id: "ap-south-1_TESTPOOL0",
    region: "ap-south-1",
    client_id: "testclient0",
  },
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

describe("parseAuthConfig (spec A1)", () => {
  it("accepts the spec shape and keeps what the page needs", () => {
    const cfg = parseAuthConfig(GOOD);
    expect(cfg).toMatchObject({
      poolId: "ap-south-1_TESTPOOL0",
      region: "ap-south-1",
      clientId: "testclient0",
      forgotPassword: true,
      mfaMode: "OPTIONAL",
      orgSlug: "acme",
      branding: {
        displayName: "Acme",
        appDisplayName: "Plant Manager",
        primaryColor: "#1a73e8",
      },
      collectorUrl: null,
    });
  });

  it("accepts a page with no org context", () => {
    expect(
      parseAuthConfig({
        ...GOOD,
        branding: { ...GOOD.branding, org_slug: null },
      }).orgSlug,
    ).toBeNull();
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
      {
        ...GOOD,
        branding: { ...GOOD.branding, logo_url: "http://x.test/a.png" },
      },
    ],
    [
      "a javascript: logo",
      {
        ...GOOD,
        branding: { ...GOOD.branding, logo_url: "javascript:alert(1)" },
      },
    ],
    [
      "a colour that is not #rrggbb",
      { ...GOOD, branding: { ...GOOD.branding, primary_color: "red" } },
    ],
    ["an unknown MFA mode", { ...GOOD, mfa: { ...GOOD.mfa, mode: "MAYBE" } }],
    [
      "a collector outside Cognito",
      { ...GOOD, collector: { enabled: true, url: "https://evil.test/c.js" } },
    ],
    ["not an object", "nope"],
  ])("refuses %s", (_label, value) => {
    expect(() => parseAuthConfig(value)).toThrow(ConfigError);
  });

  it("accepts the Cognito collector URL for the pool's region only", () => {
    const url =
      "https://amazon-cognito-assets.ap-south-1.amazoncognito.com/amazon-cognito-advanced-security-data.min.js";
    expect(
      parseAuthConfig({ ...GOOD, collector: { enabled: true, url } })
        .collectorUrl,
    ).toBe(url);
    expect(() =>
      parseAuthConfig({
        ...GOOD,
        collector: {
          enabled: true,
          url: url.replace("ap-south-1", "us-east-1"),
        },
      }),
    ).toThrow(ConfigError);
  });

  it("keeps the display name as plain text, cut to 40 characters", () => {
    const cfg = parseAuthConfig({
      ...GOOD,
      branding: { ...GOOD.branding, display_name: "<b>" + "x".repeat(60) },
    });
    expect(cfg.branding.displayName).toHaveLength(40);
    expect(cfg.branding.displayName.startsWith("<b>")).toBe(true); // rendered as text, never as HTML
  });
});

describe("fetchAuthConfig", () => {
  it("reads GET /v1/auth/config on the same origin", async () => {
    const fetchImpl = vi.fn(async () => json(200, GOOD));
    await fetchAuthConfig(fetchImpl);
    expect(fetchImpl).toHaveBeenCalledWith(
      "/v1/auth/config",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("refuses a non-200 answer", async () => {
    await expect(
      fetchAuthConfig(async () => json(503, { code: "unavailable" })),
    ).rejects.toThrow(ConfigError);
  });
});

describe("httpSessionClient (spec A2)", () => {
  const tokens = { id_token: "i", access_token: "a", refresh_token: "r" };

  it("POSTs the tokens to /v1/auth/session, same origin, as JSON", async () => {
    const fetchImpl = vi.fn(async () =>
      json(200, { next: "/v1/oidc/authorize/continue?request=r1", user: {} }),
    );
    const client = httpSessionClient(fetchImpl);
    await expect(client.postSession(tokens)).resolves.toEqual({
      next: "/v1/oidc/authorize/continue?request=r1",
    });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("/v1/auth/session");
    expect(init).toMatchObject({ method: "POST", credentials: "same-origin" });
    expect(JSON.parse(String(init.body))).toEqual(tokens);
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it.each([
    "https://evil.test/",
    "//evil.test/x",
    "/\\evil.test",
    "javascript:alert(1)",
    "",
  ])(
    "refuses a next value that is not a same-origin path: %j",
    async (next) => {
      const client = httpSessionClient(async () => json(200, { next }));
      await expect(client.postSession(tokens)).rejects.toMatchObject({
        code: "unavailable",
      });
    },
  );

  it("passes not_org_member through with the person's orgs", async () => {
    const orgs = [
      { slug: "beta", display_name: "Beta", door: "https://beta.example.test" },
    ];
    const client = httpSessionClient(async () =>
      json(403, { code: "not_org_member", orgs }),
    );
    const err = await client.postSession(tokens).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(SessionError);
    // The door is normalised by the URL parser (a trailing "/").
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

  it("drops an org door that is not https", async () => {
    const orgs = [
      { slug: "beta", display_name: "Beta", door: "javascript:alert(1)" },
    ];
    const client = httpSessionClient(async () =>
      json(403, { code: "not_org_member", orgs }),
    );
    await expect(client.postSession(tokens)).rejects.toMatchObject({
      orgs: [],
    });
  });

  it.each([
    [401, "token_invalid", "token_invalid"],
    [401, "auth_time_stale", "auth_time_stale"],
    [403, "MEMBERSHIP_SUSPENDED", "MEMBERSHIP_SUSPENDED"],
    [429, "rate_limited", "rate_limited"],
    [500, "anything", "unavailable"],
    [403, "made_up_code", "unavailable"],
  ])("maps %i %s to %s", async (status, code, expected) => {
    const client = httpSessionClient(async () => json(status, { code }));
    await expect(client.postSession(tokens)).rejects.toMatchObject({
      code: expected,
    });
  });

  it("maps a network failure to unavailable", async () => {
    const client = httpSessionClient(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(client.postSession(tokens)).rejects.toMatchObject({
      code: "unavailable",
    });
  });
});

describe("review fixes (security review, 2026-11-26)", () => {
  const ZONE = "example.test";
  const tokens = { id_token: "i", access_token: "a", refresh_token: "r" };

  it.each([
    "/\t/evil.example",
    "/\n/evil.example",
    "/\r/evil.example",
    "/\\evil.example",
    "/x\\y",
    "/%09/evil.example".replace("%09", "\t"),
    "https://evil.example/",
  ])("safeNextPath refuses %j", (value) => {
    expect(safeNextPath(value)).toBeNull();
  });

  it("safeNextPath keeps a real path and re-serialises it", () => {
    expect(safeNextPath("/v1/oidc/authorize/continue?request=r1#x")).toBe(
      "/v1/oidc/authorize/continue?request=r1#x",
    );
  });

  it("trustedZoneOf drops the first label of the sign-in host", () => {
    expect(trustedZoneOf("signin.example.test")).toBe(ZONE);
    expect(trustedZoneOf("acme.example.test")).toBe(ZONE);
    expect(trustedZoneOf("localhost")).toBeNull();
  });

  it("accepts a logo only on the trusted zone, never with userinfo", () => {
    const withLogo = (logo_url: string) => ({
      ...GOOD,
      branding: { ...GOOD.branding, logo_url },
    });
    expect(
      parseAuthConfig(withLogo("https://static.example.test/a.png"), {
        trustedZone: ZONE,
      }).branding.logoUrl,
    ).toBe("https://static.example.test/a.png");
    expect(() =>
      parseAuthConfig(withLogo("https://cdn.evil.example/a.png"), {
        trustedZone: ZONE,
      }),
    ).toThrow(ConfigError);
    expect(() =>
      parseAuthConfig(withLogo("https://example.test.evil.example/a.png"), {
        trustedZone: ZONE,
      }),
    ).toThrow(ConfigError);
    expect(() =>
      parseAuthConfig(withLogo("https://u:p@static.example.test/a.png"), {
        trustedZone: ZONE,
      }),
    ).toThrow(ConfigError);
  });

  it("treats a missing org_slug as no org context", () => {
    const branding = Object.fromEntries(
      Object.entries(GOOD.branding).filter(([key]) => key !== "org_slug"),
    );
    expect(parseAuthConfig({ ...GOOD, branding }).orgSlug).toBeNull();
  });

  it("keeps only org doors on the trusted zone", async () => {
    const orgs = [
      { slug: "beta", display_name: "Beta", door: "https://beta.example.test" },
      { slug: "evil", display_name: "Evil", door: "https://beta.evil.example" },
      {
        slug: "user",
        display_name: "User",
        door: "https://u:p@beta.example.test",
      },
    ];
    const client = httpSessionClient(
      async () => json(403, { code: "not_org_member", orgs }),
      { trustedZone: ZONE },
    );
    await expect(client.postSession(tokens)).rejects.toMatchObject({
      orgs: [
        {
          slug: "beta",
          display_name: "Beta",
          door: "https://beta.example.test/",
        },
      ],
    });
  });

  it("never follows a redirect with the tokens or the config", async () => {
    const fetchImpl = vi.fn(async () => json(200, { next: "/x" }));
    await httpSessionClient(fetchImpl).postSession(tokens);
    expect(fetchImpl).toHaveBeenCalledWith(
      "/v1/auth/session",
      expect.objectContaining({ redirect: "error" }),
    );
    const cfgFetch = vi.fn(async () => json(200, GOOD));
    await fetchAuthConfig(cfgFetch);
    expect(cfgFetch).toHaveBeenCalledWith(
      "/v1/auth/config",
      expect.objectContaining({ redirect: "error" }),
    );
  });
});
