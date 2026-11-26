/**
 * One map from Cognito's errors to the sign-in page's codes (spec v1.1, section B).
 *
 * An unknown user and a wrong password give the same code, so the page never reveals whether an
 * account exists. Anything not listed becomes "unavailable".
 */

export const AUTH_ERROR_CODES = [
  "invalid_credentials",
  "SIGN_IN_BLOCKED",
  "password_reset_required",
  "code_mismatch",
  "code_expired",
  "password_policy",
  "rate_limited",
  "session_expired",
  "clock_skew",
  "unavailable",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

/** The text Cognito threat protection uses for a blocked sign-in (AWS docs; spike S2 confirms it in our pools). */
const BLOCKED_TEXT = "unable to login because of security reasons";
const SESSION_TEXT = "invalid session";
/** Cognito refuses a PASSWORD_VERIFIER TIMESTAMP too far from its clock (exact text: spike S2). */
const CLOCK_TEXT = "timestamp";

const BY_NAME: Readonly<Record<string, AuthErrorCode>> = {
  UserNotFoundException: "invalid_credentials",
  UserNotConfirmedException: "invalid_credentials",
  PasswordResetRequiredException: "password_reset_required",
  CodeMismatchException: "code_mismatch",
  ExpiredCodeException: "code_expired",
  InvalidPasswordException: "password_policy",
  TooManyRequestsException: "rate_limited",
  LimitExceededException: "rate_limited",
  TooManyFailedAttemptsException: "rate_limited",
};

export function toAuthErrorCode(error: unknown): AuthErrorCode {
  if (!(error instanceof Error)) return "unavailable";
  if (error instanceof TypeError) return "unavailable"; // fetch() network failure
  const message = error.message.toLowerCase();
  if (error.name === "NotAuthorizedException") {
    if (message.includes(BLOCKED_TEXT)) return "SIGN_IN_BLOCKED";
    if (message.includes(SESSION_TEXT)) return "session_expired";
    if (message.includes(CLOCK_TEXT)) return "clock_skew";
    return "invalid_credentials";
  }
  return BY_NAME[error.name] ?? "unavailable";
}
