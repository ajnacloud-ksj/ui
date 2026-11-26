import { describe, expect, it, vi } from "vitest";

import {
  MEMBERS_ERROR_CODES,
  membersApi,
  MembersError,
  membersErrorMessage,
} from "./members-api";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function call(fetchImpl: ReturnType<typeof vi.fn>, index = 0) {
  const [url, init] = fetchImpl.mock.calls[index] as [string, RequestInit];
  return { url, init, headers: (init.headers ?? {}) as Record<string, string> };
}

describe("membersApi: reads", () => {
  it("lists members with the query, same-origin, without a CSRF header", async () => {
    const fetchImpl = vi.fn(async () =>
      json(200, { members: [], next_cursor: null }),
    );
    const api = membersApi("/v1/users", fetchImpl);
    await api.list({ q: "ravi", status: "invited", cursor: "c1", limit: 50 });
    const { url, init, headers } = call(fetchImpl);
    expect(url).toBe("/v1/users?q=ravi&status=invited&cursor=c1&limit=50");
    expect(init).toMatchObject({
      method: "GET",
      credentials: "same-origin",
      redirect: "error",
    });
    expect(headers["X-Ajna-CSRF"]).toBeUndefined();
  });

  it("reads the caller's capabilities", async () => {
    const caps = {
      can_manage: true,
      can_invite: true,
      invites_enabled: true,
      is_org_admin: false,
      roles: [],
    };
    const fetchImpl = vi.fn(async () => json(200, caps));
    await expect(
      membersApi("/v1/users", fetchImpl).capabilities(),
    ).resolves.toEqual(caps);
    expect(call(fetchImpl).url).toBe("/v1/users/me/capabilities");
  });
});

describe("membersApi: writes", () => {
  it("sends the CSRF double-submit value and the given Idempotency-Key", async () => {
    // jsdom runs on http://, where a browser refuses __Host- cookies, so the reader is injected.
    const fetchImpl = vi.fn(async () =>
      json(200, { result: "invited", email: "sent" }),
    );
    await membersApi("/v1/users", fetchImpl, { csrf: () => "csrf-123" }).invite(
      { email: "ravi@example.com", role: "user" },
      { idempotencyKey: "key-1" },
    );
    const { url, init, headers } = call(fetchImpl);
    expect(url).toBe("/v1/users/invite");
    expect(init.method).toBe("POST");
    expect(headers["X-Ajna-CSRF"]).toBe("csrf-123");
    expect(headers["Idempotency-Key"]).toBe("key-1");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(String(init.body))).toEqual({
      email: "ravi@example.com",
      role: "user",
    });
  });

  it("makes a fresh Idempotency-Key when none is given", async () => {
    const fetchImpl = vi.fn(async () => json(200, { removed: true }));
    await membersApi("/v1/users", fetchImpl).remove("sub-1");
    expect(call(fetchImpl).headers["Idempotency-Key"]).toMatch(
      /^[0-9a-f-]{36}$/,
    );
  });

  it.each([
    [
      "changeRole",
      ["s 1", "admin"],
      "PUT",
      "/v1/users/s%201/role",
      { role: "admin" },
    ],
    [
      "suspend",
      ["s1", "left the team"],
      "POST",
      "/v1/users/s1/suspend",
      { reason: "left the team" },
    ],
    ["restore", ["s1"], "POST", "/v1/users/s1/restore", undefined],
    [
      "restore",
      ["s1", "user"],
      "POST",
      "/v1/users/s1/restore",
      { role: "user" },
    ],
    ["remove", ["s1"], "DELETE", "/v1/users/s1", undefined],
    ["resend", ["s1"], "POST", "/v1/users/s1/resend-invitation", undefined],
    ["cancelInvite", ["s1"], "POST", "/v1/users/s1/cancel-invite", undefined],
    ["resetPassword", ["s1"], "POST", "/v1/users/s1/reset-password", undefined],
    [
      "temporaryPassword",
      ["s1"],
      "POST",
      "/v1/users/s1/temporary-password",
      undefined,
    ],
  ] as const)("%s(%j) → %s %s", async (method, args, verb, url, body) => {
    const fetchImpl = vi.fn(async () => json(200, {}));
    const api = membersApi("/v1/users", fetchImpl) as unknown as Record<
      string,
      (...a: unknown[]) => Promise<unknown>
    >;
    await api[method](...args);
    const sent = call(fetchImpl);
    expect(sent.init.method).toBe(verb);
    expect(sent.url).toBe(url);
    expect(
      sent.init.body === undefined
        ? undefined
        : JSON.parse(String(sent.init.body)),
    ).toEqual(body);
  });
});

describe("membersApi: errors (the ONE H3 map, codes unchanged)", () => {
  it("passes the H3 code through with the retry time", async () => {
    const fetchImpl = vi.fn(async () =>
      json(429, { code: "org_invite_cap", message: "x", retry_after: 120 }),
    );
    const err = await membersApi("/v1/users", fetchImpl)
      .invite({ email: "a@example.com", role: "user" })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(MembersError);
    expect(err).toMatchObject({
      code: "org_invite_cap",
      status: 429,
      retryAfter: 120,
    });
  });

  it("treats 202 outcome_unknown as an error the screen must explain", async () => {
    const fetchImpl = vi.fn(async () => json(202, { code: "outcome_unknown" }));
    await expect(
      membersApi("/v1/users", fetchImpl).remove("s1"),
    ).rejects.toMatchObject({
      code: "outcome_unknown",
    });
  });

  it("maps an unknown code, a bad body or a network failure to unavailable", async () => {
    await expect(
      membersApi(
        "/v1/users",
        vi.fn(async () => json(500, { code: "made_up" })),
      ).remove("s1"),
    ).rejects.toMatchObject({ code: "unavailable" });
    await expect(
      membersApi(
        "/v1/users",
        vi.fn(async () => new Response("<html>", { status: 502 })),
      ).remove("s1"),
    ).rejects.toMatchObject({ code: "unavailable" });
    await expect(
      membersApi(
        "/v1/users",
        vi.fn(async () => {
          throw new TypeError("Failed to fetch");
        }),
      ).remove("s1"),
    ).rejects.toMatchObject({ code: "unavailable" });
  });

  it("has a plain message for every code it can return", () => {
    for (const code of [
      "invites_disabled",
      "org_admin_required",
      "org_invite_cap",
      "last_admin",
      "last_org_admin",
      "self_action",
      "target_outranks_caller",
      "shared_account",
      "invalid_role",
      "role_not_declared",
      "user_not_found",
      "already_member",
      "already_signed_in",
      "already_confirmed",
      "reason_required",
      "not_suspended",
      "password_not_accepted",
      "invite_pending",
      "temporary_password_not_allowed",
      "login_handle_taken",
      "other_app",
      "rate_limited",
      "outcome_unknown",
      "change_applied",
      "unavailable",
      "not_admin",
      "members_not_enabled",
    ] as const) {
      expect(membersErrorMessage(code)).not.toBe("");
    }
  });
});

// Spec v1.6 section C, "The ONE error map": the codes the platform can return, unchanged.
const SPEC_C_ERROR_MAP = [
  "invites_disabled",
  "org_admin_required",
  "org_invite_cap",
  "last_admin",
  "last_org_admin",
  "reason_required",
  "not_suspended",
  "password_not_accepted",
  "invite_pending",
  "not_admin",
  "members_not_enabled",
  "tenant_without_org",
  "self_action",
  "target_outranks_caller",
  "shared_account",
  "invalid_role",
  "user_not_found",
  "already_member",
  "invite_domain_not_allowed",
  "other_app",
  "role_not_declared",
  "idempotency_key_reused",
  "temporary_password_not_allowed",
  "login_handle_taken",
  "already_signed_in",
  "already_confirmed",
  "rate_limited",
  "outcome_unknown",
  "change_applied",
  "unavailable",
  "managed_by_cockpit",
  "not_org_admin",
];

describe("the error map", () => {
  it("is exactly spec C's list", () => {
    expect([...MEMBERS_ERROR_CODES].sort()).toEqual(
      [...SPEC_C_ERROR_MAP].sort(),
    );
  });

  it("passes a spec code through and has a message for every code", () => {
    for (const code of MEMBERS_ERROR_CODES) {
      expect(membersErrorMessage(code)).toMatch(/\S/);
    }
  });
});
