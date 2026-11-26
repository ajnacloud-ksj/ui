/**
 * The sign-in page's two calls to its own backend (spec v1.1): GET /v1/auth/config (A1) and
 * POST /v1/auth/session (A2). Both are same-origin; the answers are validated, never trusted.
 */
import {
  type OrgLink,
  type SessionClient,
  SessionError,
  type SessionTokens,
} from "./machine";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export type MfaMode = "OFF" | "OPTIONAL" | "ON";

export interface AuthConfig {
  poolId: string;
  region: string;
  clientId: string;
  forgotPassword: boolean;
  mfaMode: MfaMode;
  orgSlug: string | null;
  passwordPolicy: {
    minLength: number;
    requireUpper: boolean;
    requireLower: boolean;
    requireDigit: boolean;
    requireSymbol: boolean;
  };
  branding: {
    displayName: string;
    appDisplayName: string | null;
    logoUrl: string | null;
    primaryColor: string | null;
  };
  /** The Cognito advanced-security collector for the pool's region, when enabled (spike S1). */
  collectorUrl: string | null;
  bundleVersion: string;
}

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

const POOL_ID = /^([a-z]{2}(?:-[a-z]+)+-\d)_[A-Za-z0-9]+$/;
const CLIENT_ID = /^[a-z0-9]{1,128}$/;
const ORG_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const COLOUR = /^#[0-9a-f]{6}$/i;
const MFA_MODES: readonly MfaMode[] = ["OFF", "OPTIONAL", "ON"];
const MAX_NAME = 40;
const SESSION_CODES = new Set<SessionError["code"]>([
  "MEMBERSHIP_SUSPENDED",
  "not_org_member",
  "token_invalid",
  "token_expired",
  "auth_time_stale",
  "invalid_request",
  "rate_limited",
]);

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function collectorUrlFor(region: string): string {
  return `https://amazon-cognito-assets.${region}.amazoncognito.com/amazon-cognito-advanced-security-data.min.js`;
}

/** Validate GET /v1/auth/config. Anything unexpected is refused: the page must not run on a bad config. */
export function parseAuthConfig(value: unknown): AuthConfig {
  if (!isObject(value)) throw new ConfigError("config: not an object");
  const pool = isObject(value.pool) ? value.pool : {};
  const poolId = str(pool.id);
  const match = POOL_ID.exec(poolId);
  if (!match) throw new ConfigError("config: pool.id");
  const region = str(pool.region);
  if (region !== match[1])
    throw new ConfigError("config: pool.region does not match pool.id");
  const clientId = str(pool.client_id);
  if (!CLIENT_ID.test(clientId))
    throw new ConfigError("config: pool.client_id");

  const mfa = isObject(value.mfa) ? value.mfa : {};
  const mfaMode = str(mfa.mode) as MfaMode;
  if (!MFA_MODES.includes(mfaMode)) throw new ConfigError("config: mfa.mode");

  const branding = isObject(value.branding) ? value.branding : {};
  const org = branding.org_slug;
  if (org !== null && !(typeof org === "string" && ORG_SLUG.test(org)))
    throw new ConfigError("config: org_slug");
  const logoRaw = branding.logo_url;
  const logoUrl =
    logoRaw === null || logoRaw === undefined ? null : httpsUrl(logoRaw);
  if (logoRaw !== null && logoRaw !== undefined && logoUrl === null)
    throw new ConfigError("config: logo_url");
  const colourRaw = branding.primary_color;
  if (
    colourRaw !== null &&
    colourRaw !== undefined &&
    !(typeof colourRaw === "string" && COLOUR.test(colourRaw))
  ) {
    throw new ConfigError("config: primary_color");
  }
  const app = isObject(branding.app) ? branding.app : null;

  const collector = isObject(value.collector) ? value.collector : {};
  let collectorUrl: string | null = null;
  if (collector.enabled === true) {
    if (collector.url !== collectorUrlFor(region))
      throw new ConfigError("config: collector.url");
    collectorUrl = collectorUrlFor(region);
  }

  const flows = isObject(value.flows) ? value.flows : {};
  const policy = isObject(value.password_policy) ? value.password_policy : {};
  return {
    poolId,
    region,
    clientId,
    forgotPassword: flows.forgot_password === true,
    mfaMode,
    orgSlug: org === null ? null : (org as string),
    passwordPolicy: {
      minLength: typeof policy.min_length === "number" ? policy.min_length : 8,
      requireUpper: policy.require_upper === true,
      requireLower: policy.require_lower === true,
      requireDigit: policy.require_digit === true,
      requireSymbol: policy.require_symbol === true,
    },
    branding: {
      displayName: str(branding.display_name).slice(0, MAX_NAME) || "Ajna",
      appDisplayName: app
        ? str(app.display_name).slice(0, MAX_NAME) || null
        : null,
      logoUrl,
      primaryColor:
        typeof colourRaw === "string" ? colourRaw.toLowerCase() : null,
    },
    collectorUrl,
    bundleVersion: str(value.bundle_version),
  };
}

export async function fetchAuthConfig(
  fetchImpl: FetchLike = fetch,
): Promise<AuthConfig> {
  let response: Response;
  try {
    response = await fetchImpl("/v1/auth/config", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ConfigError("config: unreachable");
  }
  if (response.status !== 200)
    throw new ConfigError(`config: HTTP ${response.status}`);
  return parseAuthConfig(await response.json());
}

/** A same-origin path: one leading "/", never "//" or "/\" (no scheme, no host). */
function isSameOriginPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
  );
}

function orgLinks(value: unknown): OrgLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((o: unknown) => {
    if (!isObject(o)) return [];
    const door = httpsUrl(o.door);
    const slug = str(o.slug);
    return door && ORG_SLUG.test(slug)
      ? [{ slug, display_name: str(o.display_name).slice(0, MAX_NAME), door }]
      : [];
  });
}

export function httpSessionClient(fetchImpl: FetchLike = fetch): SessionClient {
  return {
    async postSession(tokens: SessionTokens) {
      let response: Response;
      try {
        response = await fetchImpl("/v1/auth/session", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(tokens),
        });
      } catch {
        throw new SessionError("unavailable");
      }
      const body: unknown = await response.json().catch(() => null);
      if (response.status === 200) {
        if (isObject(body) && isSameOriginPath(body.next))
          return { next: body.next };
        throw new SessionError("unavailable");
      }
      const code = isObject(body) ? str(body.code) : "";
      if (response.status === 429) throw new SessionError("rate_limited");
      if (SESSION_CODES.has(code as SessionError["code"])) {
        throw new SessionError(
          code as SessionError["code"],
          code === "not_org_member" && isObject(body)
            ? orgLinks(body.orgs)
            : [],
        );
      }
      throw new SessionError("unavailable");
    },
  };
}
