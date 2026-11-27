/**
 * The sign-in page's two calls to its own backend (spec v1.1): GET /v1/auth/config (A1) and
 * POST /v1/auth/session (A2). Both are same-origin; the answers are validated, never trusted.
 *
 * Trust is PINNED by the host page from its build constants (review M3, M4): the pool ids it may
 * use, the exact hosts a logo may come from, and the zone the org doors must be on. Nothing is
 * derived from the page's own host name.
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

/** What the sign-in bundle trusts, from its build constants. Fails closed when empty. */
export interface ConfigPins {
  /** The Cognito pool ids this sign-in page may use (the region is part of each id). */
  poolIds: readonly string[];
  /** The exact hosts a logo may come from (the platform static host). */
  logoHosts: readonly string[];
  /** Org doors must be on this zone or one of its subdomains; null = show no door links. */
  doorZone: string | null;
  /** Where the host routes its backend, e.g. "/api" on the portal's doors. Default "" (root). */
  apiBase?: string;
}

/** "" or one or more plain path segments with one leading "/" and no trailing "/". */
const API_BASE = /^(?:\/[A-Za-z0-9_-]+)*$/;

function checkedApiBase(base: string): string {
  if (!API_BASE.test(base))
    throw new ConfigError('config: apiBase must be "" or a path like /api');
  return base;
}

function apiBaseOf(pins: ConfigPins): string {
  return checkedApiBase(pins.apiBase ?? "");
}

export interface AuthConfig {
  poolId: string;
  region: string;
  clientId: string;
  forgotPassword: boolean;
  mfaMode: MfaMode;
  orgSlug: string | null;
  /** From the pins: the zone the not-a-member page's org doors must be on. */
  doorZone: string | null;
  /** From the pins: the path the host's backend is under ("" or e.g. "/api"). */
  apiBase: string;
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
/** Cognito's own bounds for a pool's minimum password length. */
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 99;
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

/** An https URL with no userinfo, or null. */
function httpsUrl(value: unknown): URL | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

/** The host is the zone itself or one of its subdomains (never "zone.evil.example"). */
function onZone(hostname: string, zone: string): boolean {
  const host = hostname.toLowerCase();
  return host === zone || host.endsWith(`.${zone}`);
}

function collectorUrlFor(region: string): string {
  return `https://amazon-cognito-assets.${region}.amazoncognito.com/amazon-cognito-advanced-security-data.min.js`;
}

function minLength(value: unknown): number {
  if (value === undefined) return 8;
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < MIN_PASSWORD_LENGTH ||
    value > MAX_PASSWORD_LENGTH
  ) {
    throw new ConfigError("config: password_policy.min_length");
  }
  return value;
}

/** Validate GET /v1/auth/config against the pins. Anything unexpected is refused. */
export function parseAuthConfig(value: unknown, pins: ConfigPins): AuthConfig {
  if (pins.poolIds.length === 0)
    throw new ConfigError("config: no pool is pinned");
  const apiBase = apiBaseOf(pins);
  if (!isObject(value)) throw new ConfigError("config: not an object");
  const pool = isObject(value.pool) ? value.pool : {};
  const poolId = str(pool.id);
  const match = POOL_ID.exec(poolId);
  if (!match) throw new ConfigError("config: pool.id");
  if (!pins.poolIds.includes(poolId))
    throw new ConfigError("config: pool.id is not pinned");
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
  const org = branding.org_slug ?? null;
  if (org !== null && !(typeof org === "string" && ORG_SLUG.test(org)))
    throw new ConfigError("config: org_slug");

  let logoUrl: string | null = null;
  if (branding.logo_url !== null && branding.logo_url !== undefined) {
    const url = httpsUrl(branding.logo_url);
    if (!url || !pins.logoHosts.includes(url.hostname.toLowerCase())) {
      throw new ConfigError("config: logo_url is not on a pinned host");
    }
    logoUrl = url.toString();
  }

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
    doorZone: pins.doorZone,
    apiBase,
    passwordPolicy: {
      minLength: minLength(policy.min_length),
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
  pins: ConfigPins,
  fetchImpl: FetchLike = fetch,
): Promise<AuthConfig> {
  let response: Response;
  try {
    response = await fetchImpl(`${apiBaseOf(pins)}/v1/auth/config`, {
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ConfigError("config: unreachable");
  }
  if (response.status !== 200)
    throw new ConfigError(`config: HTTP ${response.status}`);
  return parseAuthConfig(await response.json(), pins);
}

/** A control character (U+0000-U+001F, U+007F) or a backslash anywhere in the value. */
function hasControlOrBackslash(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f || code === 0x5c) return true;
  }
  return false;
}

/** A "." or ".." path segment, also percent-encoded ("%2e"), which a URL parser collapses. */
function hasDotSegment(path: string): boolean {
  return path.split("/").some((segment) => /^(?:\.|%2e){1,2}$/i.test(segment));
}

/**
 * The value itself when it is a plain same-origin path, else null (review H1).
 *
 * Browsers drop tab/CR/LF, read "\" as "/" and collapse dot segments, so "/\t/evil", "/.//evil"
 * and "/%2e//evil" would all reach "//evil", which is protocol-relative (off-site). So: one leading
 * "/" and never "//"; no control character or backslash; no dot segment; and the parsed URL must
 * keep the base origin and must not start with "//". The ORIGINAL string is returned, never a
 * re-serialised one.
 */
export function safeNextPath(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  )
    return null;
  if (hasControlOrBackslash(value)) return null;
  const pathPart = value.split(/[?#]/, 1)[0] ?? "";
  if (hasDotSegment(pathPart)) return null;
  const base = "https://base.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base || url.pathname.startsWith("//")) return null;
    return value;
  } catch {
    return null;
  }
}

function orgLinks(value: unknown, zone: string | null): OrgLink[] {
  if (!Array.isArray(value) || zone === null) return [];
  return value.flatMap((o: unknown) => {
    if (!isObject(o)) return [];
    const url = httpsUrl(o.door);
    const slug = str(o.slug);
    return url && onZone(url.hostname, zone) && ORG_SLUG.test(slug)
      ? [
          {
            slug,
            display_name: str(o.display_name).slice(0, MAX_NAME),
            door: url.toString(),
          },
        ]
      : [];
  });
}

export interface SessionClientOptions {
  /** The zone org doors must be on (from the pins); null = no door links. */
  doorZone: string | null;
  /** The backend's path on this host, from AuthConfig.apiBase. Default "" (root). */
  apiBase?: string;
}

export function httpSessionClient(
  options: SessionClientOptions,
  fetchImpl: FetchLike = fetch,
): SessionClient {
  // Validated here too, not only in parseAuthConfig: a host can build this client itself.
  const apiBase = checkedApiBase(options.apiBase ?? "");
  return {
    async postSession(tokens: SessionTokens) {
      let response: Response;
      try {
        response = await fetchImpl(`${apiBase}/v1/auth/session`, {
          method: "POST",
          credentials: "same-origin",
          // Never re-send the tokens to wherever a redirect points.
          redirect: "error",
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
        const next = isObject(body) ? safeNextPath(body.next) : null;
        if (next) return { next };
        throw new SessionError("unavailable");
      }
      const code = isObject(body) ? str(body.code) : "";
      if (response.status === 429) throw new SessionError("rate_limited");
      if (SESSION_CODES.has(code as SessionError["code"])) {
        throw new SessionError(
          code as SessionError["code"],
          code === "not_org_member" && isObject(body)
            ? orgLinks(body.orgs, options.doorZone)
            : [],
        );
      }
      throw new SessionError("unavailable");
    },
  };
}
