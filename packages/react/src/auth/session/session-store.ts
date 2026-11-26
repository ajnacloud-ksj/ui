/**
 * The signed-in user, in memory only.
 *
 * The backend (BFF) holds the session in HttpOnly cookies, and `GET /api/v1/auth/me` says who is
 * signed in. The page keeps that answer here for the life of the page and stores nothing about
 * the session in localStorage or sessionStorage. A reload asks `/auth/me` again
 * (bff-signin.ts bootSession).
 */
export interface IAppSessionUser {
  user_id: string;
  /** For display: the email when the backend's username is an id (a Cognito UUID). */
  username: string;
  email: string;
  /** The app role for THIS organisation, as `/auth/me` reports it. */
  role: string;
  tenant_id: string | null;
  company_name: string | null;
}

type TListener = (user: IAppSessionUser | null) => void;

let current: IAppSessionUser | null = null;
const listeners = new Set<TListener>();

/** The signed-in user, or null. */
export function sessionUser(): IAppSessionUser | null {
  return current;
}

/** Replace the signed-in user (null: signed out) and tell every subscriber. */
export function setSessionUser(user: IAppSessionUser | null): void {
  current = user ? Object.freeze({ ...user }) : null;
  for (const listener of listeners) listener(current);
}

/** Subscribe to sign-in changes; returns the unsubscribe. */
export function onSessionUser(listener: TListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let leaving = false;

/**
 * Mark the page as signing out. From here on nothing may start a sign-in (the route guard, a
 * 401): the page is about to leave for the portal. Only a new page load clears it.
 */
export function markLeaving(): void {
  leaving = true;
}

/** Is the page signing out (see markLeaving)? */
export function isLeaving(): boolean {
  return leaving;
}

/** The `/auth/me` body, unwrapped from a `{success, data}` envelope when the backend sends one. */
function unwrapEnvelope(body: unknown): unknown {
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return (body as { data: unknown }).data;
  }
  return body;
}

const text = (value: unknown): string =>
  typeof value === "string" ? value : "";

/**
 * The session user from a `GET /v1/auth/me` reply (SDK: user_id, username, email, role,
 * tenant_id), or null when the reply names no user. Display only: the backend authorizes every
 * request from the session cookie, never from this.
 */
export function userFromMe(body: unknown): IAppSessionUser | null {
  const me = unwrapEnvelope(body);
  if (!me || typeof me !== "object") return null;
  const v = me as Record<string, unknown>;
  const id = text(v.user_id);
  if (!id || typeof v.role !== "string" || !v.role) return null;
  const email = text(v.email);
  const username = text(v.username);
  return {
    user_id: id,
    username: username.includes("@") ? username : email || username,
    email,
    role: v.role,
    tenant_id: text(v.tenant_id) || null,
    company_name: text(v.company_name) || null,
  };
}
