/**
 * The client for an app's user-management routes (contract spec v1.5, section C): the SDK's
 * `/v1/users…`, which call the platform membership service. Every rule lives on the server; this
 * client only sends requests and passes the server's error codes through unchanged.
 */

export type MemberStatus =
  "invited" | "invite_expired" | "active" | "suspended";

export interface Member {
  sub: string;
  email: string;
  display_name: string;
  role: string;
  status: MemberStatus;
  invited_by?: string | null;
  invited_at?: string | null;
  /** A Login ID account with no email (the admin can issue a temporary password). */
  no_email?: boolean;
}

export interface MemberPage {
  members: Member[];
  next_cursor: string | null;
}

export interface RoleOption {
  id: string;
  label: string;
}

export interface MembersCapabilities {
  can_manage: boolean;
  can_invite: boolean;
  invites_enabled: boolean;
  is_org_admin: boolean;
  roles: RoleOption[];
}

export type InviteBody =
  | { email: string; display_name?: string; role: string }
  | {
      no_email: true;
      login_handle: string;
      display_name?: string;
      role: string;
    };

export interface InviteResult {
  result: "invited" | "added_existing" | "already_member";
  email?: "sent" | "failed";
  /** For a no-email invite only: shown once, never stored. */
  login_id?: string;
  temporary_password?: string;
}

export interface TemporaryPassword {
  temporary_password: string;
  expires_in_days: number;
}

export interface ListQuery {
  q?: string;
  status?: MemberStatus;
  cursor?: string | null;
  limit?: number;
}

export interface WriteOptions {
  /** One key per user action; the same key on a retry makes the server replay its first answer. */
  idempotencyKey?: string;
}

export const MEMBERS_ERROR_CODES = [
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
  "invite_domain_not_allowed",
  "idempotency_key_reused",
  "not_admin",
  "members_not_enabled",
  "managed_by_cockpit",
  "not_org_admin",
  "tenant_without_org",
  "rate_limited",
  "outcome_unknown",
  "change_applied",
  "unavailable",
] as const;

export type MembersErrorCode = (typeof MEMBERS_ERROR_CODES)[number];

const KNOWN = new Set<string>(MEMBERS_ERROR_CODES);

export class MembersError extends Error {
  readonly code: MembersErrorCode;
  readonly status: number;
  readonly retryAfter: number | null;

  constructor(
    code: MembersErrorCode,
    status = 0,
    retryAfter: number | null = null,
  ) {
    super(code);
    this.name = "MembersError";
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const MESSAGES: Readonly<Record<MembersErrorCode, string>> = {
  invites_disabled:
    "Your organisation does not allow app admins to invite people.",
  org_admin_required: "Only an organisation admin can give that role.",
  org_invite_cap:
    "Your organisation has sent its daily number of invitations. Try again later.",
  last_admin: "The app must keep at least one admin.",
  last_org_admin: "The organisation must keep at least one admin.",
  self_action: "You cannot do this to your own account.",
  target_outranks_caller: "This person has a higher role than you.",
  shared_account:
    "This person also uses other apps, so only an organisation admin can do this.",
  invalid_role: "That role is not available in this app.",
  role_not_declared:
    "That role no longer exists in this app. Choose a current role.",
  user_not_found: "This person is not a member of this app.",
  already_member: "This person is already a member.",
  already_signed_in:
    "This person has already signed in, so the invitation cannot be cancelled. Remove them instead.",
  already_confirmed: "This person has already accepted the invitation.",
  reason_required: "Give a reason.",
  not_suspended: "This person is not suspended.",
  password_not_accepted: "Admins cannot set a password.",
  invite_pending: "The invitation is not accepted yet. Resend it instead.",
  temporary_password_not_allowed:
    "A temporary password is only for people with no email who are not admins.",
  login_handle_taken: "That Login ID is already used in your organisation.",
  other_app: "You can only invite people to this app.",
  invite_domain_not_allowed:
    "Your organisation does not allow invitations to that email domain.",
  idempotency_key_reused: "Refresh the page and try again.",
  not_admin: "Only an admin of this app can manage its members.",
  members_not_enabled: "Member management is not switched on for this app yet.",
  managed_by_cockpit: "Members of this app are managed by the platform team.",
  not_org_admin: "Only an organisation admin can do this.",
  tenant_without_org:
    "This app is not linked to an organisation yet. Contact the platform team.",
  rate_limited: "Too many changes. Wait a moment, then try again.",
  outcome_unknown:
    "The change may have been made. Refresh the list to see the current state.",
  change_applied:
    "The change was made, but it could not be confirmed. Refresh the list.",
  unavailable:
    "Member management is not available right now. Try again in a few minutes.",
};

export function membersErrorMessage(code: MembersErrorCode): string {
  return MESSAGES[code];
}

export interface MembersApi {
  list(query?: ListQuery): Promise<MemberPage>;
  capabilities(): Promise<MembersCapabilities>;
  invite(body: InviteBody, options?: WriteOptions): Promise<InviteResult>;
  changeRole(
    sub: string,
    role: string,
    options?: WriteOptions,
  ): Promise<{ changed: boolean }>;
  suspend(
    sub: string,
    reason: string,
    options?: WriteOptions,
  ): Promise<{ status: MemberStatus }>;
  restore(
    sub: string,
    role?: string,
    options?: WriteOptions,
  ): Promise<{ status: MemberStatus; role?: string }>;
  remove(sub: string, options?: WriteOptions): Promise<{ removed: boolean }>;
  resend(sub: string, options?: WriteOptions): Promise<{ sent: boolean }>;
  cancelInvite(
    sub: string,
    options?: WriteOptions,
  ): Promise<{ cancelled: boolean; account_deleted?: boolean }>;
  resetPassword(
    sub: string,
    options?: WriteOptions,
  ): Promise<{ sent: boolean }>;
  temporaryPassword(
    sub: string,
    options?: WriteOptions,
  ): Promise<TemporaryPassword>;
}

export type MembersFetch = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;

const CSRF_COOKIE = "__Host-ajna_csrf";

function csrfToken(): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === CSRF_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function newKey(): string {
  return crypto.randomUUID();
}

async function errorFrom(response: Response): Promise<MembersError> {
  const body: unknown = await response.json().catch(() => null);
  const record =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const code =
    typeof record.code === "string" && KNOWN.has(record.code)
      ? (record.code as MembersErrorCode)
      : "unavailable";
  const retry =
    typeof record.retry_after === "number" ? record.retry_after : null;
  return new MembersError(code, response.status, retry);
}

export interface MembersApiOptions {
  /** Reads the CSRF double-submit value; default: the `__Host-ajna_csrf` cookie. */
  csrf?: () => string | null;
}

/** The default client over fetch, for the app's own same-origin `/v1/users` routes. */
export function membersApi(
  base = "/v1/users",
  fetchImpl: MembersFetch = (url, init) => fetch(url, init),
  options: MembersApiOptions = {},
): MembersApi {
  const readCsrf = options.csrf ?? csrfToken;
  const path = (sub: string, rest = "") =>
    `${base}/${encodeURIComponent(sub)}${rest}`;

  async function send<T>(
    method: string,
    url: string,
    body?: unknown,
    write?: WriteOptions,
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (method !== "GET") {
      headers["Idempotency-Key"] = write?.idempotencyKey ?? newKey();
      const csrf = readCsrf();
      if (csrf) headers["X-Ajna-CSRF"] = csrf;
    }
    if (body !== undefined) headers["Content-Type"] = "application/json";
    let response: Response;
    try {
      response = await fetchImpl(url, {
        method,
        credentials: "same-origin",
        redirect: "error",
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new MembersError("unavailable");
    }
    if (response.status === 202 || !response.ok)
      throw await errorFrom(response);
    return (await response.json().catch(() => ({}))) as T;
  }

  return {
    list(query = {}) {
      const params = new URLSearchParams();
      if (query.q) params.set("q", query.q);
      if (query.status) params.set("status", query.status);
      if (query.cursor) params.set("cursor", query.cursor);
      if (query.limit) params.set("limit", String(query.limit));
      const qs = params.toString();
      return send<MemberPage>("GET", qs ? `${base}?${qs}` : base);
    },
    capabilities: () =>
      send<MembersCapabilities>("GET", `${base}/me/capabilities`),
    invite: (body, options) =>
      send<InviteResult>("POST", `${base}/invite`, body, options),
    changeRole: (sub, role, options) =>
      send("PUT", path(sub, "/role"), { role }, options),
    suspend: (sub, reason, options) =>
      send("POST", path(sub, "/suspend"), { reason }, options),
    restore: (sub, role, options) =>
      send(
        "POST",
        path(sub, "/restore"),
        role === undefined ? undefined : { role },
        options,
      ),
    remove: (sub, options) => send("DELETE", path(sub), undefined, options),
    resend: (sub, options) =>
      send("POST", path(sub, "/resend-invitation"), undefined, options),
    cancelInvite: (sub, options) =>
      send("POST", path(sub, "/cancel-invite"), undefined, options),
    resetPassword: (sub, options) =>
      send("POST", path(sub, "/reset-password"), undefined, options),
    temporaryPassword: (sub, options) =>
      send<TemporaryPassword>(
        "POST",
        path(sub, "/temporary-password"),
        undefined,
        options,
      ),
  };
}
