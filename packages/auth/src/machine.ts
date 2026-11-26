/**
 * The headless sign-in state machine (spec v1.1, section B).
 *
 * It talks to Cognito through a CognitoTransport and to our backend through a SessionClient. The
 * password stays in this browser: only SRP values reach Cognito, and nothing reaches our backend
 * but the final tokens, which are handed over once and never kept in the returned state.
 */
import { type AuthErrorCode, toAuthErrorCode } from "./cognito/errors";
import type { CognitoOperation, CognitoTransport } from "./cognito/transport";
import { expandLoginId, LoginIdError, type LoginIdErrorCode } from "./login-id";
import {
  calculateA,
  formatTimestamp,
  generateSmallA,
  passwordAuthenticationKey,
  passwordClaimSignature,
  poolNameOf,
  type RandomBytes,
} from "./srp/srp";

export interface OrgLink {
  slug: string;
  display_name: string;
  door: string;
}

export type SignInState =
  | { step: "password"; notice?: "password_reset" }
  | { step: "totp" }
  | { step: "mfa_setup"; otpauthUri: string; secret: string }
  | { step: "new_password" }
  | { step: "forgot_code" }
  | { step: "not_member"; orgs: OrgLink[] }
  | { step: "done"; next: string };

export type SessionErrorCode =
  | "MEMBERSHIP_SUSPENDED"
  | "not_org_member"
  | "token_invalid"
  | "token_expired"
  | "auth_time_stale"
  | "invalid_request";

export type FlowErrorCode = AuthErrorCode | LoginIdErrorCode | SessionErrorCode;

export interface StepResult {
  state: SignInState;
  error?: FlowErrorCode;
}

export interface SessionTokens {
  id_token: string;
  access_token: string;
  refresh_token: string;
}

/** POST /v1/auth/session on the sign-in host (spec A2). */
export interface SessionClient {
  postSession(tokens: SessionTokens): Promise<{ next: string }>;
}

export class SessionError extends Error {
  readonly code: SessionErrorCode | "rate_limited" | "unavailable";
  readonly orgs: OrgLink[];

  constructor(code: SessionError["code"], orgs: OrgLink[] = []) {
    super(code);
    this.name = "SessionError";
    this.code = code;
    this.orgs = orgs;
  }
}

export interface SignInConfig {
  poolId: string;
  clientId: string;
  /** The org of this sign-in page, or null on a page with no org context. */
  orgSlug: string | null;
  /** The name an authenticator app shows for the new TOTP entry. */
  issuer: string;
}

export interface SignInDeps {
  config: SignInConfig;
  transport: CognitoTransport;
  session: SessionClient;
  now?: () => Date;
  random?: RandomBytes;
  /** The advanced-security collector's EncodedData for this username, if the page loads it. */
  userContextData?: (username: string) => string | undefined;
}

export interface SignInMachine {
  readonly state: SignInState;
  submitPassword(loginId: string, password: string): Promise<StepResult>;
  submitTotp(code: string): Promise<StepResult>;
  submitMfaSetupCode(code: string): Promise<StepResult>;
  submitNewPassword(password: string): Promise<StepResult>;
  startForgot(loginId: string): Promise<StepResult>;
  confirmForgot(code: string, newPassword: string): Promise<StepResult>;
  backToPassword(): StepResult;
}

const SIX_DIGITS = /^\d{6}$/;
/** The calls that accept UserContextData (Associate/VerifySoftwareToken do not). */
const CONTEXT_OPERATIONS: ReadonlySet<CognitoOperation> = new Set([
  "InitiateAuth",
  "RespondToAuthChallenge",
  "ForgotPassword",
  "ConfirmForgotPassword",
]);

interface Pending {
  username: string;
  userId: string;
  session: string;
}

export function createSignIn(deps: SignInDeps): SignInMachine {
  const { config, transport, session } = deps;
  const now = deps.now ?? (() => new Date());
  const poolName = poolNameOf(config.poolId);

  let state: SignInState = { step: "password" };
  let pending: Pending | undefined;
  let forgotUsername: string | undefined;

  const set = (next: SignInState, error?: FlowErrorCode): StepResult => {
    state = next;
    if (
      next.step === "password" ||
      next.step === "done" ||
      next.step === "not_member"
    )
      pending = undefined;
    return error === undefined ? { state } : { state, error };
  };
  const stay = (error: FlowErrorCode): StepResult => ({ state, error });

  async function call(
    operation: CognitoOperation,
    input: Record<string, unknown>,
    username: string,
  ) {
    const context = deps.userContextData?.(username);
    const body =
      context && CONTEXT_OPERATIONS.has(operation)
        ? { ...input, UserContextData: { EncodedData: context } }
        : input;
    return transport.send(operation, body);
  }

  /** Map a thrown Cognito error; an expired challenge session restarts at the password step. */
  function fromCognito(err: unknown): StepResult {
    const code = toAuthErrorCode(err);
    return code === "session_expired"
      ? set({ step: "password" }, code)
      : stay(code);
  }

  async function finish(result: Record<string, unknown>): Promise<StepResult> {
    const auth = result.AuthenticationResult as
      Record<string, string> | undefined;
    if (!auth?.IdToken || !auth.AccessToken || !auth.RefreshToken)
      return stay("unavailable");
    try {
      const { next } = await session.postSession({
        id_token: auth.IdToken,
        access_token: auth.AccessToken,
        refresh_token: auth.RefreshToken,
      });
      return set({ step: "done", next });
    } catch (err: unknown) {
      if (err instanceof SessionError) {
        if (err.code === "not_org_member")
          return set({ step: "not_member", orgs: err.orgs });
        return set({ step: "password" }, err.code);
      }
      return set({ step: "password" }, "unavailable");
    }
  }

  async function mfaSetup(
    username: string,
    userId: string,
    challengeSession: string,
  ): Promise<StepResult> {
    const associated = await call(
      "AssociateSoftwareToken",
      { Session: challengeSession },
      username,
    );
    const secret = String(associated.SecretCode ?? "");
    if (!secret) return stay("unavailable");
    pending = { username, userId, session: String(associated.Session ?? "") };
    const label = encodeURIComponent(`${config.issuer}:${username}`);
    const otpauthUri = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(config.issuer)}`;
    return set({ step: "mfa_setup", otpauthUri, secret });
  }

  /** Route Cognito's answer: tokens, or the next challenge. */
  async function next(
    result: Record<string, unknown>,
    username: string,
    userId: string,
  ): Promise<StepResult> {
    if (result.AuthenticationResult) return finish(result);
    const challengeSession = String(result.Session ?? "");
    switch (result.ChallengeName) {
      case "SOFTWARE_TOKEN_MFA":
        pending = { username, userId, session: challengeSession };
        return set({ step: "totp" });
      case "NEW_PASSWORD_REQUIRED":
        pending = { username, userId, session: challengeSession };
        return set({ step: "new_password" });
      case "MFA_SETUP":
        return mfaSetup(username, userId, challengeSession);
      case "SELECT_MFA_TYPE": {
        const answered = await call(
          "RespondToAuthChallenge",
          {
            ChallengeName: "SELECT_MFA_TYPE",
            ClientId: config.clientId,
            Session: challengeSession,
            ChallengeResponses: {
              USERNAME: userId,
              ANSWER: "SOFTWARE_TOKEN_MFA",
            },
          },
          username,
        );
        return next(answered, username, userId);
      }
      default:
        return stay("unavailable");
    }
  }

  async function submitPassword(
    loginId: string,
    password: string,
  ): Promise<StepResult> {
    let username: string;
    try {
      username = expandLoginId(loginId, config.orgSlug);
    } catch (err: unknown) {
      return stay(err instanceof LoginIdError ? err.code : "login_id_invalid");
    }
    try {
      const smallA = generateSmallA(deps.random);
      const init = await call(
        "InitiateAuth",
        {
          AuthFlow: "USER_SRP_AUTH",
          ClientId: config.clientId,
          AuthParameters: {
            USERNAME: username,
            SRP_A: calculateA(smallA).toString(16),
          },
        },
        username,
      );
      if (init.ChallengeName !== "PASSWORD_VERIFIER")
        return next(init, username, username);
      const params = init.ChallengeParameters as Record<string, string>;
      const userId = params.USER_ID_FOR_SRP ?? username;
      const key = await passwordAuthenticationKey({
        poolName,
        userId,
        password,
        serverB: BigInt("0x" + params.SRP_B),
        salt: BigInt("0x" + params.SALT),
        smallA,
      });
      const timestamp = formatTimestamp(now());
      const signature = await passwordClaimSignature({
        key,
        poolName,
        userId,
        secretBlock: params.SECRET_BLOCK ?? "",
        timestamp,
      });
      const verified = await call(
        "RespondToAuthChallenge",
        {
          ChallengeName: "PASSWORD_VERIFIER",
          ClientId: config.clientId,
          ChallengeResponses: {
            USERNAME: userId,
            PASSWORD_CLAIM_SECRET_BLOCK: params.SECRET_BLOCK,
            PASSWORD_CLAIM_SIGNATURE: signature,
            TIMESTAMP: timestamp,
          },
        },
        username,
      );
      return await next(verified, username, userId);
    } catch (err: unknown) {
      return set({ step: "password" }, toAuthErrorCode(err));
    }
  }

  async function respond(
    challenge: "SOFTWARE_TOKEN_MFA" | "NEW_PASSWORD_REQUIRED" | "MFA_SETUP",
    responses: Record<string, string>,
    sessionOverride?: string,
  ): Promise<StepResult> {
    if (!pending) return set({ step: "password" }, "session_expired");
    const { username, userId } = pending;
    try {
      const result = await call(
        "RespondToAuthChallenge",
        {
          ChallengeName: challenge,
          ClientId: config.clientId,
          Session: sessionOverride ?? pending.session,
          ChallengeResponses: { USERNAME: userId, ...responses },
        },
        username,
      );
      return await next(result, username, userId);
    } catch (err: unknown) {
      return fromCognito(err);
    }
  }

  return {
    get state() {
      return state;
    },
    submitPassword,
    submitTotp(code) {
      if (state.step !== "totp")
        return Promise.resolve(stay("session_expired"));
      if (!SIX_DIGITS.test(code.trim()))
        return Promise.resolve(stay("code_mismatch"));
      return respond("SOFTWARE_TOKEN_MFA", {
        SOFTWARE_TOKEN_MFA_CODE: code.trim(),
      });
    },
    async submitMfaSetupCode(code) {
      if (state.step !== "mfa_setup" || !pending)
        return stay("session_expired");
      if (!SIX_DIGITS.test(code.trim())) return stay("code_mismatch");
      try {
        const verified = await call(
          "VerifySoftwareToken",
          { Session: pending.session, UserCode: code.trim() },
          pending.username,
        );
        if (verified.Status !== "SUCCESS") return stay("code_mismatch");
        return await respond("MFA_SETUP", {}, String(verified.Session ?? ""));
      } catch (err: unknown) {
        return fromCognito(err);
      }
    },
    submitNewPassword(password) {
      if (state.step !== "new_password")
        return Promise.resolve(stay("session_expired"));
      return respond("NEW_PASSWORD_REQUIRED", { NEW_PASSWORD: password });
    },
    async startForgot(loginId) {
      let username: string;
      try {
        username = expandLoginId(loginId, config.orgSlug);
      } catch (err: unknown) {
        return stay(
          err instanceof LoginIdError ? err.code : "login_id_invalid",
        );
      }
      try {
        await call(
          "ForgotPassword",
          { ClientId: config.clientId, Username: username },
          username,
        );
      } catch (err: unknown) {
        const code = toAuthErrorCode(err);
        // Never reveal whether the account exists: only a real throttle or outage is shown.
        if (code === "rate_limited" || code === "unavailable")
          return stay(code);
      }
      forgotUsername = username;
      return set({ step: "forgot_code" });
    },
    async confirmForgot(code, newPassword) {
      if (state.step !== "forgot_code" || !forgotUsername)
        return stay("session_expired");
      try {
        await call(
          "ConfirmForgotPassword",
          {
            ClientId: config.clientId,
            Username: forgotUsername,
            ConfirmationCode: code.trim(),
            Password: newPassword,
          },
          forgotUsername,
        );
      } catch (err: unknown) {
        return stay(toAuthErrorCode(err));
      }
      forgotUsername = undefined;
      return set({ step: "password", notice: "password_reset" });
    },
    backToPassword() {
      forgotUsername = undefined;
      return set({ step: "password" });
    },
  };
}
