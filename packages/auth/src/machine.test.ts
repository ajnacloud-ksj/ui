// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { createSignIn, SessionError, type SessionClient, type SignInConfig } from "./machine";
import { NO_EMAIL_DOMAIN } from "./login-id";
import { FakeCognito, type FakePoolOptions } from "./testing/fake-cognito";

const POOL_ID = "ap-south-1_FakePool9";
const CLIENT_ID = "fakeclient123";
const NOW = new Date(Date.UTC(2026, 10, 26, 5, 4, 3));

function setup(opts: Partial<FakePoolOptions> = {}, extra: Partial<SignInConfig> = {}) {
  const cognito = new FakeCognito({
    poolId: POOL_ID,
    clientId: CLIENT_ID,
    users: {
      "ravi@example.com": { password: "Correct-Horse-9" },
      "totp@example.com": { password: "Correct-Horse-9", totp: true },
      "invited@example.com": { password: "Temp-Pass-123", status: "FORCE_CHANGE_PASSWORD" },
      "blocked@example.com": { password: "Correct-Horse-9", blocked: true },
      [`picker07.acme@${NO_EMAIL_DOMAIN}`]: { password: "Correct-Horse-9" },
    },
    ...opts,
  });
  const posted: unknown[] = [];
  const session: SessionClient = {
    postSession: vi.fn(async (tokens) => {
      posted.push(tokens);
      return { next: "/v1/oidc/authorize/continue?request=r1" };
    }),
  };
  const machine = createSignIn({
    config: { poolId: POOL_ID, clientId: CLIENT_ID, orgSlug: "acme", issuer: "Acme", ...extra },
    transport: cognito,
    session,
    now: () => NOW,
  });
  return { cognito, machine, session, posted };
}

describe("password step", () => {
  it("signs in with SRP and hands the tokens to the backend once", async () => {
    const { machine, posted, cognito } = setup();
    const result = await machine.submitPassword("ravi@example.com", "Correct-Horse-9");
    expect(result.error).toBeUndefined();
    expect(result.state).toEqual({ step: "done", next: "/v1/oidc/authorize/continue?request=r1" });
    expect(posted).toEqual([
      { id_token: "id.ravi@example.com", access_token: "access.ravi@example.com", refresh_token: "refresh.ravi@example.com" },
    ]);
    // The password itself is never sent to Cognito, only SRP values.
    expect(JSON.stringify(cognito.calls)).not.toContain("Correct-Horse-9");
  });

  it("keeps no token in the state it returns", async () => {
    const { machine } = setup();
    const result = await machine.submitPassword("ravi@example.com", "Correct-Horse-9");
    expect(JSON.stringify(result.state)).not.toMatch(/access\.|refresh\.|id\./);
  });

  it("sends SRP_A as A in hex, the USER_ID_FOR_SRP and the clock's TIMESTAMP", async () => {
    const { machine, cognito } = setup();
    await machine.submitPassword("ravi@example.com", "Correct-Horse-9");
    const init = cognito.calls[0]!;
    expect(init.operation).toBe("InitiateAuth");
    expect(init.input).toMatchObject({ AuthFlow: "USER_SRP_AUTH", ClientId: CLIENT_ID });
    expect((init.input.AuthParameters as Record<string, string>).SRP_A).toMatch(/^[0-9a-f]+$/);
    const verifier = cognito.calls[1]!;
    expect(verifier.input).toMatchObject({
      ChallengeName: "PASSWORD_VERIFIER",
      ClientId: CLIENT_ID,
      ChallengeResponses: { USERNAME: "uid-ravi@example.com", TIMESTAMP: "Thu Nov 26 05:04:03 UTC 2026" },
    });
  });

  it("gives one code for a wrong password and an unknown user, and stays on the step", async () => {
    const { machine } = setup();
    const wrong = await machine.submitPassword("ravi@example.com", "nope-nope-1");
    const unknown = await machine.submitPassword("nobody@example.com", "nope-nope-1");
    expect(wrong).toEqual({ state: { step: "password" }, error: "invalid_credentials" });
    expect(unknown).toEqual(wrong);
  });

  it("shows SIGN_IN_BLOCKED for a threat-protection block", async () => {
    const { machine, session } = setup();
    const result = await machine.submitPassword("blocked@example.com", "Correct-Horse-9");
    expect(result.error).toBe("SIGN_IN_BLOCKED");
    expect(session.postSession).not.toHaveBeenCalled();
  });

  it("expands a bare Login ID with the page's org", async () => {
    const { machine, cognito } = setup();
    const result = await machine.submitPassword("picker07", "Correct-Horse-9");
    expect(result.state.step).toBe("done");
    expect((cognito.calls[0]!.input.AuthParameters as Record<string, string>).USERNAME).toBe(
      `picker07.acme@${NO_EMAIL_DOMAIN}`,
    );
  });

  it("refuses a bare Login ID without an org context, before any Cognito call", async () => {
    const { machine, cognito } = setup({}, { orgSlug: null });
    const result = await machine.submitPassword("picker07", "Correct-Horse-9");
    expect(result.error).toBe("login_id_needs_org");
    expect(cognito.calls).toHaveLength(0);
  });
});

describe("TOTP step", () => {
  it("asks for the code, refuses a wrong one, accepts the right one", async () => {
    const { machine } = setup();
    expect((await machine.submitPassword("totp@example.com", "Correct-Horse-9")).state.step).toBe("totp");
    expect(await machine.submitTotp("000000")).toEqual({ state: { step: "totp" }, error: "code_mismatch" });
  });

  it("finishes the sign-in with the right code", async () => {
    const { machine, cognito } = setup();
    await machine.submitPassword("totp@example.com", "Correct-Horse-9");
    const result = await machine.submitTotp("123456");
    expect(result.state.step).toBe("done");
    expect(cognito.calls.at(-1)!.input).toMatchObject({
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      ChallengeResponses: { USERNAME: "uid-totp@example.com", SOFTWARE_TOKEN_MFA_CODE: "123456" },
    });
  });

  it("goes back to the password step when the challenge session has expired", async () => {
    const { machine, cognito } = setup();
    await machine.submitPassword("totp@example.com", "Correct-Horse-9");
    await machine.submitTotp("000000"); // the fake drops a used session
    const result = await machine.submitTotp("123456");
    expect(result).toEqual({ state: { step: "password" }, error: "session_expired" });
    expect(cognito.calls.length).toBeGreaterThan(0);
  });

  it("refuses a code that is not 6 digits without calling Cognito", async () => {
    const { machine, cognito } = setup();
    await machine.submitPassword("totp@example.com", "Correct-Horse-9");
    const before = cognito.calls.length;
    expect((await machine.submitTotp("12ab")).error).toBe("code_mismatch");
    expect(cognito.calls.length).toBe(before);
  });
});

describe("MFA setup at sign-in (pool MFA ON)", () => {
  it("shows an otpauth URI with the secret and the issuer, then finishes after a right code", async () => {
    const { machine, cognito } = setup({ mfa: "ON" });
    const shown = await machine.submitPassword("ravi@example.com", "Correct-Horse-9");
    expect(shown.state).toMatchObject({ step: "mfa_setup", secret: "JBSWY3DPEHPK3PXP" });
    const uri = new URL((shown.state as { otpauthUri: string }).otpauthUri);
    expect(uri.protocol).toBe("otpauth:");
    expect(uri.searchParams.get("secret")).toBe("JBSWY3DPEHPK3PXP");
    expect(uri.searchParams.get("issuer")).toBe("Acme");
    expect(uri.host).toBe("totp");
    expect(decodeURIComponent(uri.pathname)).toBe("/Acme:ravi@example.com");

    expect((await machine.submitMfaSetupCode("000000")).error).toBe("code_mismatch");
    const done = await machine.submitMfaSetupCode("123456");
    expect(done.state.step).toBe("done");
    expect(cognito.user("ravi@example.com")?.totp).toBe(true);
  });
});

describe("first sign-in from an invite (NEW_PASSWORD_REQUIRED)", () => {
  it("asks for a new password and refuses a weak one", async () => {
    const { machine } = setup();
    expect((await machine.submitPassword("invited@example.com", "Temp-Pass-123")).state.step).toBe("new_password");
    expect(await machine.submitNewPassword("short")).toEqual({
      state: { step: "new_password" },
      error: "password_policy",
    });
  });

  it("finishes, or continues to MFA setup when the pool requires it", async () => {
    const optional = setup();
    await optional.machine.submitPassword("invited@example.com", "Temp-Pass-123");
    expect((await optional.machine.submitNewPassword("A-Strong-Pass-1")).state.step).toBe("done");

    const required = setup({ mfa: "ON" });
    await required.machine.submitPassword("invited@example.com", "Temp-Pass-123");
    expect((await required.machine.submitNewPassword("A-Strong-Pass-1")).state.step).toBe("mfa_setup");
  });
});

describe("forgot password", () => {
  it("answers the same way for a known and an unknown account", async () => {
    const known = await setup().machine.startForgot("ravi@example.com");
    const unknown = await setup().machine.startForgot("nobody@example.com");
    expect(known).toEqual({ state: { step: "forgot_code" } });
    expect(unknown).toEqual(known);
  });

  it("sets the new password with the emailed code, then returns to the password step", async () => {
    const { machine, cognito } = setup();
    await machine.startForgot("ravi@example.com");
    expect((await machine.confirmForgot("111111", "A-New-Pass-123")).error).toBe("code_mismatch");
    const result = await machine.confirmForgot("654321", "A-New-Pass-123");
    expect(result).toEqual({ state: { step: "password", notice: "password_reset" } });
    expect(cognito.user("ravi@example.com")?.password).toBe("A-New-Pass-123");
  });
});

describe("the hand-over to the backend", () => {
  it("shows the person's own orgs when they are not a member of this one", async () => {
    const { machine, session } = setup();
    vi.mocked(session.postSession).mockRejectedValueOnce(
      new SessionError("not_org_member", [{ slug: "beta", display_name: "Beta", door: "https://beta.example.test" }]),
    );
    const result = await machine.submitPassword("ravi@example.com", "Correct-Horse-9");
    expect(result.state).toEqual({
      step: "not_member",
      orgs: [{ slug: "beta", display_name: "Beta", door: "https://beta.example.test" }],
    });
  });

  it("passes a suspended account's code through and stays on the password step", async () => {
    const { machine, session } = setup();
    vi.mocked(session.postSession).mockRejectedValueOnce(new SessionError("MEMBERSHIP_SUSPENDED"));
    expect(await machine.submitPassword("ravi@example.com", "Correct-Horse-9")).toEqual({
      state: { step: "password" },
      error: "MEMBERSHIP_SUSPENDED",
    });
  });

  it("maps an unexpected backend failure to unavailable", async () => {
    const { machine, session } = setup();
    vi.mocked(session.postSession).mockRejectedValueOnce(new Error("boom"));
    expect((await machine.submitPassword("ravi@example.com", "Correct-Horse-9")).error).toBe("unavailable");
  });
});

describe("UserContextData (threat protection)", () => {
  it("is added to every Cognito call when a collector gives one", async () => {
    const cognito = new FakeCognito({
      poolId: POOL_ID,
      clientId: CLIENT_ID,
      users: { "totp@example.com": { password: "Correct-Horse-9", totp: true } },
    });
    const machine = createSignIn({
      config: { poolId: POOL_ID, clientId: CLIENT_ID, orgSlug: "acme", issuer: "Acme" },
      transport: cognito,
      session: { postSession: async () => ({ next: "/" }) },
      now: () => NOW,
      userContextData: (username) => `encoded-for-${username}`,
    });
    await machine.submitPassword("totp@example.com", "Correct-Horse-9");
    await machine.submitTotp("123456");
    for (const call of cognito.calls) {
      expect(call.input.UserContextData).toEqual({ EncodedData: "encoded-for-totp@example.com" });
    }
  });

  it("is left out when there is no collector (sign-in still works)", async () => {
    const { machine, cognito } = setup();
    await machine.submitPassword("ravi@example.com", "Correct-Horse-9");
    for (const call of cognito.calls) expect(call.input).not.toHaveProperty("UserContextData");
  });
});
