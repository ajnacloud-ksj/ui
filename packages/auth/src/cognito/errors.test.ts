import { describe, expect, it } from "vitest";

import { AUTH_ERROR_CODES, toAuthErrorCode } from "./errors";

function cognitoError(name: string, message = ""): Error {
  const err = new Error(message);
  err.name = name;
  return err;
}

describe("toAuthErrorCode (spec v1.1, section B)", () => {
  it.each([
    [
      "NotAuthorizedException",
      "Incorrect username or password.",
      "invalid_credentials",
    ],
    ["UserNotFoundException", "User does not exist.", "invalid_credentials"],
    [
      "NotAuthorizedException",
      "Unable to login because of security reasons.",
      "SIGN_IN_BLOCKED",
    ],
    [
      "NotAuthorizedException",
      "Invalid session for the user, session is expired.",
      "session_expired",
    ],
    [
      "PasswordResetRequiredException",
      "Password reset required for the user",
      "password_reset_required",
    ],
    [
      "CodeMismatchException",
      "Invalid code received for user",
      "code_mismatch",
    ],
    [
      "ExpiredCodeException",
      "Invalid code provided, please request a code again.",
      "code_expired",
    ],
    [
      "InvalidPasswordException",
      "Password does not conform to policy",
      "password_policy",
    ],
    ["TooManyRequestsException", "Rate exceeded", "rate_limited"],
    ["LimitExceededException", "Attempt limit exceeded", "rate_limited"],
    ["TooManyFailedAttemptsException", "", "rate_limited"],
  ])("%s %j -> %s", (name, message, expected) => {
    expect(toAuthErrorCode(cognitoError(name, message))).toBe(expected);
  });

  it("never reveals whether an account exists: unknown user == wrong password", () => {
    expect(toAuthErrorCode(cognitoError("UserNotFoundException"))).toBe(
      toAuthErrorCode(
        cognitoError(
          "NotAuthorizedException",
          "Incorrect username or password.",
        ),
      ),
    );
  });

  it("treats an unconfirmed user like a failed sign-in (no enumeration)", () => {
    expect(toAuthErrorCode(cognitoError("UserNotConfirmedException"))).toBe(
      "invalid_credentials",
    );
  });

  it("maps SIGN_IN_BLOCKED only on the exact block text, not on any 'security' word", () => {
    expect(
      toAuthErrorCode(
        cognitoError(
          "NotAuthorizedException",
          "Password attempts exceeded for security",
        ),
      ),
    ).toBe("invalid_credentials");
  });

  it("tells a wrong device clock apart from a wrong password", () => {
    expect(
      toAuthErrorCode(
        cognitoError(
          "NotAuthorizedException",
          "Timestamp is not within the allowed time window",
        ),
      ),
    ).toBe("clock_skew");
  });

  it("maps a network failure to unavailable", () => {
    expect(toAuthErrorCode(new TypeError("Failed to fetch"))).toBe(
      "unavailable",
    );
  });

  it.each([
    null,
    undefined,
    "boom",
    42,
    {},
    cognitoError("InternalErrorException"),
  ])("maps anything unknown (%j) to unavailable", (value) => {
    expect(toAuthErrorCode(value)).toBe("unavailable");
  });

  it("only ever returns a listed code", () => {
    const samples = [
      cognitoError("NotAuthorizedException", "x"),
      cognitoError("Whatever"),
      new TypeError("x"),
    ];
    for (const s of samples)
      expect(AUTH_ERROR_CODES).toContain(toAuthErrorCode(s));
  });
});
