/**
 * Login IDs for no-email accounts (spec v1.1, C-temp).
 *
 * Every shared pool signs in by email, and that setting cannot change without replacing the pool.
 * So a person with no email gets an email-shaped Login ID that can never receive mail:
 * `<handle>.<org>@users.invalid`. On the org's sign-in page the person types only the handle,
 * and this function adds the rest, with the org taken from the sign-in context.
 */

export const NO_EMAIL_DOMAIN = "users.invalid";

const HANDLE = /^[a-z0-9]+(\.[a-z0-9]+)*$/;
const ORG_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const MAX_HANDLE = 64;

export type LoginIdErrorCode = "login_id_invalid" | "login_id_needs_org";

export class LoginIdError extends Error {
  readonly code: LoginIdErrorCode;

  constructor(code: LoginIdErrorCode, message: string) {
    super(message);
    this.name = "LoginIdError";
    this.code = code;
  }
}

/** The value to send to Cognito as USERNAME: an email as typed, or an expanded Login ID. */
export function expandLoginId(typed: string, orgSlug: string | null): string {
  const value = typed.trim().toLowerCase();
  if (value.includes("@")) return value;
  if (!value || value.length > MAX_HANDLE || !HANDLE.test(value)) {
    throw new LoginIdError(
      "login_id_invalid",
      "Enter your email or your Login ID.",
    );
  }
  if (orgSlug === null) {
    throw new LoginIdError(
      "login_id_needs_org",
      "Open your organisation's address to sign in with a Login ID.",
    );
  }
  if (!ORG_SLUG.test(orgSlug)) {
    throw new LoginIdError(
      "login_id_invalid",
      "This organisation address is not valid.",
    );
  }
  return `${value}.${orgSlug}@${NO_EMAIL_DOMAIN}`;
}
