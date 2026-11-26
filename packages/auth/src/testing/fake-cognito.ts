/**
 * TEST ONLY: an in-memory Cognito user pool that runs the SERVER side of SRP.
 *
 * It verifies PASSWORD_CLAIM_SIGNATURE against the user's verifier (v = g^x), so a sign-in passes
 * only if the client's SRP is right. It is never part of the published package (build excludes
 * src/testing).
 */
import type { CognitoOperation, CognitoTransport } from "../cognito/transport";
import {
  computeK,
  G,
  modPow,
  N,
  padHex,
  passwordClaimSignature,
} from "../srp/srp";

export interface FakeUser {
  password: string;
  status?: "CONFIRMED" | "FORCE_CHANGE_PASSWORD";
  totp?: boolean;
  blocked?: boolean;
  /** RESET_REQUIRED: Cognito refuses the sign-in before checking the password. */
  resetRequired?: boolean;
  /** No verified email (a Login ID account): ForgotPassword is refused. */
  noEmail?: boolean;
}

export interface FakePoolOptions {
  poolId: string;
  clientId: string;
  mfa?: "OFF" | "OPTIONAL" | "ON";
  users: Record<string, FakeUser>;
  /** The only TOTP code the fake accepts. */
  totpCode?: string;
}

export interface FakeCall {
  operation: CognitoOperation;
  input: Record<string, unknown>;
}

interface PendingSrp {
  username: string;
  userId: string;
  A: bigint;
  b: bigint;
  B: bigint;
  salt: bigint;
  secretBlock: string;
}

interface PendingChallenge {
  username: string;
  name: "SOFTWARE_TOKEN_MFA" | "NEW_PASSWORD_REQUIRED" | "MFA_SETUP";
  associated?: boolean;
  verified?: boolean;
}

function fail(name: string, message: string): never {
  const err = new Error(message);
  err.name = name;
  throw err;
}

const hexBytes = (hex: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(hex.match(/../g) ?? [], (h) => Number.parseInt(h, 16));
const toHex = (b: Uint8Array): string =>
  Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
async function sha256Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
}
async function hmac(
  key: Uint8Array<ArrayBuffer>,
  data: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const k = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

export class FakeCognito implements CognitoTransport {
  readonly calls: FakeCall[] = [];
  readonly revoked: string[] = [];
  private readonly opts: Required<Omit<FakePoolOptions, "users">> & {
    users: Record<string, FakeUser>;
  };
  private readonly srp = new Map<string, PendingSrp>();
  private readonly challenges = new Map<string, PendingChallenge>();
  private readonly resetCodes = new Map<string, string>();
  private counter = 0;

  constructor(options: FakePoolOptions) {
    this.opts = {
      mfa: "OPTIONAL",
      totpCode: "123456",
      ...options,
      users: { ...options.users },
    };
  }

  get poolName(): string {
    return this.opts.poolId.split("_")[1] ?? "";
  }

  user(username: string): FakeUser | undefined {
    return this.opts.users[username];
  }

  private nextSession(): string {
    this.counter += 1;
    return `session-${this.counter}`;
  }

  private userId(username: string): string {
    return `uid-${username}`;
  }

  private async verifier(username: string, salt: bigint): Promise<bigint> {
    const user = this.opts.users[username];
    if (!user) return 0n;
    const inner = await sha256Hex(
      new TextEncoder().encode(
        `${this.poolName}${this.userId(username)}:${user.password}`,
      ),
    );
    const x = BigInt("0x" + (await sha256Hex(hexBytes(padHex(salt) + inner))));
    return modPow(G, x, N);
  }

  async send(
    operation: CognitoOperation,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    this.calls.push({ operation, input });
    if (input.ClientId !== undefined && input.ClientId !== this.opts.clientId) {
      fail("ResourceNotFoundException", "User pool client does not exist.");
    }
    switch (operation) {
      case "InitiateAuth":
        return this.initiateAuth(input);
      case "RespondToAuthChallenge":
        return this.respond(input);
      case "AssociateSoftwareToken":
        return this.associate(input);
      case "VerifySoftwareToken":
        return this.verify(input);
      case "ForgotPassword":
        return this.forgot(input);
      case "ConfirmForgotPassword":
        return this.confirmForgot(input);
      case "RevokeToken":
        this.revoked.push(String(input.Token ?? ""));
        return {};
      default:
        return fail(
          "InvalidParameterException",
          `unsupported ${String(operation)}`,
        );
    }
  }

  private async initiateAuth(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    if (input.AuthFlow !== "USER_SRP_AUTH")
      fail("InvalidParameterException", "USER_SRP_AUTH only");
    const params = input.AuthParameters as Record<string, string>;
    const username = params.USERNAME ?? "";
    if (this.opts.users[username]?.resetRequired) {
      fail(
        "PasswordResetRequiredException",
        "Password reset required for the user",
      );
    }
    const A = BigInt("0x" + (params.SRP_A ?? "0"));
    if (A % N === 0n) fail("InvalidParameterException", "SRP_A");
    // PreventUserExistenceErrors: an unknown user still gets a challenge; it fails later.
    const salt = BigInt("0x" + "ab".repeat(16));
    const b = BigInt("0x" + "3d".repeat(32));
    const v = await this.verifier(username, salt);
    const B = ((await computeK()) * v + modPow(G, b, N)) % N;
    const secretBlock = btoa(`secret-block-${username}`);
    const userId = this.userId(username);
    this.srp.set(userId, { username, userId, A, b, B, salt, secretBlock });
    return {
      ChallengeName: "PASSWORD_VERIFIER",
      ChallengeParameters: {
        USER_ID_FOR_SRP: userId,
        SRP_B: B.toString(16),
        SALT: salt.toString(16),
        SECRET_BLOCK: secretBlock,
      },
    };
  }

  private async serverKey(p: PendingSrp, v: bigint): Promise<Uint8Array> {
    const u = BigInt(
      "0x" + (await sha256Hex(hexBytes(padHex(p.A) + padHex(p.B)))),
    );
    const S = modPow((p.A * modPow(v, u, N)) % N, p.b, N);
    const prk = await hmac(hexBytes(padHex(u)), hexBytes(padHex(S)));
    return (
      await hmac(prk, new TextEncoder().encode("Caldera Derived Key\u0001"))
    ).slice(0, 16);
  }

  private async respond(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const name = input.ChallengeName as string;
    const responses = (input.ChallengeResponses ?? {}) as Record<
      string,
      string
    >;
    if (name === "PASSWORD_VERIFIER") return this.passwordVerifier(responses);
    const session = input.Session as string;
    const pending = this.challenges.get(session);
    if (!pending || pending.name !== name)
      fail(
        "NotAuthorizedException",
        "Invalid session for the user, session is expired.",
      );
    this.challenges.delete(session);
    const user = this.opts.users[pending.username];
    if (!user)
      return fail("NotAuthorizedException", "Incorrect username or password.");
    if (name === "SOFTWARE_TOKEN_MFA") {
      if (responses.SOFTWARE_TOKEN_MFA_CODE !== this.opts.totpCode) {
        fail("CodeMismatchException", "Invalid code received for user");
      }
      return this.tokens(pending.username);
    }
    if (name === "NEW_PASSWORD_REQUIRED") {
      const next = responses.NEW_PASSWORD ?? "";
      if (next.length < 8)
        fail("InvalidPasswordException", "Password does not conform to policy");
      user.password = next;
      user.status = "CONFIRMED";
      return this.afterPassword(pending.username);
    }
    // MFA_SETUP
    if (!pending.verified)
      fail(
        "NotAuthorizedException",
        "Invalid session for the user, session is expired.",
      );
    user.totp = true;
    return this.tokens(pending.username);
  }

  private async passwordVerifier(
    responses: Record<string, string>,
  ): Promise<Record<string, unknown>> {
    const p = this.srp.get(responses.USERNAME ?? "");
    if (!p)
      return fail("NotAuthorizedException", "Incorrect username or password.");
    this.srp.delete(p.userId);
    const user = this.opts.users[p.username];
    if (!user)
      return fail("NotAuthorizedException", "Incorrect username or password.");
    if (responses.PASSWORD_CLAIM_SECRET_BLOCK !== p.secretBlock)
      fail("NotAuthorizedException", "Incorrect username or password.");
    const key = await this.serverKey(
      p,
      await this.verifier(p.username, p.salt),
    );
    const expected = await passwordClaimSignature({
      key,
      poolName: this.poolName,
      userId: p.userId,
      secretBlock: p.secretBlock,
      timestamp: responses.TIMESTAMP ?? "",
    });
    if (expected !== responses.PASSWORD_CLAIM_SIGNATURE)
      fail("NotAuthorizedException", "Incorrect username or password.");
    if (user.blocked)
      fail(
        "NotAuthorizedException",
        "Unable to login because of security reasons.",
      );
    if (user.status === "FORCE_CHANGE_PASSWORD")
      return this.challenge(p.username, "NEW_PASSWORD_REQUIRED");
    return this.afterPassword(p.username);
  }

  private afterPassword(username: string): Record<string, unknown> {
    const user = this.opts.users[username];
    if (user?.totp && this.opts.mfa !== "OFF")
      return this.challenge(username, "SOFTWARE_TOKEN_MFA");
    if (this.opts.mfa === "ON") return this.challenge(username, "MFA_SETUP");
    return this.tokens(username);
  }

  private challenge(
    username: string,
    name: PendingChallenge["name"],
  ): Record<string, unknown> {
    const session = this.nextSession();
    this.challenges.set(session, { username, name });
    return {
      ChallengeName: name,
      Session: session,
      ChallengeParameters: { USER_ID_FOR_SRP: this.userId(username) },
    };
  }

  private associate(input: Record<string, unknown>): Record<string, unknown> {
    const old = this.challenges.get(input.Session as string);
    if (!old || old.name !== "MFA_SETUP")
      return fail(
        "NotAuthorizedException",
        "Invalid session for the user, session is expired.",
      );
    this.challenges.delete(input.Session as string);
    const session = this.nextSession();
    this.challenges.set(session, { ...old, associated: true });
    return { SecretCode: "JBSWY3DPEHPK3PXP", Session: session };
  }

  private verify(input: Record<string, unknown>): Record<string, unknown> {
    const old = this.challenges.get(input.Session as string);
    if (!old?.associated)
      return fail(
        "NotAuthorizedException",
        "Invalid session for the user, session is expired.",
      );
    if (input.UserCode !== this.opts.totpCode)
      fail("CodeMismatchException", "Invalid code received for user");
    this.challenges.delete(input.Session as string);
    const session = this.nextSession();
    this.challenges.set(session, { ...old, verified: true });
    return { Status: "SUCCESS", Session: session };
  }

  private forgot(input: Record<string, unknown>): Record<string, unknown> {
    const username = input.Username as string;
    if (this.opts.users[username]?.noEmail) {
      fail(
        "InvalidParameterException",
        "Cannot reset password for the user as there is no registered/verified email or phone_number",
      );
    }
    if (this.opts.users[username]) this.resetCodes.set(username, "654321");
    // PreventUserExistenceErrors: the same answer for an unknown user.
    return {
      CodeDeliveryDetails: {
        DeliveryMedium: "EMAIL",
        Destination: "x***@e***",
      },
    };
  }

  private confirmForgot(
    input: Record<string, unknown>,
  ): Record<string, unknown> {
    const username = input.Username as string;
    const user = this.opts.users[username];
    if (!user || this.resetCodes.get(username) !== input.ConfirmationCode) {
      fail(
        "CodeMismatchException",
        "Invalid code provided, please request a code again.",
      );
    }
    const next = (input.Password as string) ?? "";
    if (next.length < 8)
      fail("InvalidPasswordException", "Password does not conform to policy");
    user.password = next;
    this.resetCodes.delete(username);
    return {};
  }

  private tokens(username: string): Record<string, unknown> {
    return {
      AuthenticationResult: {
        IdToken: `id.${username}`,
        AccessToken: `access.${username}`,
        RefreshToken: `refresh.${username}`,
        ExpiresIn: 3600,
        TokenType: "Bearer",
      },
    };
  }
}
