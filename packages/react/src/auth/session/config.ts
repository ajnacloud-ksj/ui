/**
 * The host app's build settings, passed in ONCE at start-up.
 *
 * A prebuilt package cannot read the app's `import.meta.env`: Vite replaces it only in the app's
 * own source. So the app calls `configureAppSession()` from its entry point with its own values,
 * before it renders, and every part of `./session` reads them from here.
 *
 *   configureAppSession({
 *     apiUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "",
 *     defaultTenant: import.meta.env.VITE_DEFAULT_TENANT,
 *     portalOrgHost: import.meta.env.VITE_PORTAL_ORG_HOST,
 *     fallbackPortalHost: "portal.<zone>",
 *   })
 */
export interface AppSessionConfig {
  /** The injected API url (`https://<ui host>/api/v1`), or "" when none is configured. */
  apiUrl: string;
  /** Dev only: the bare app host goes to this tenant's door. "" = none (prod). */
  defaultTenant: string;
  /**
   * The org portal host, when the build pins it: a plain host name in the same zone as
   * fallbackPortalHost (an optional leading "https://" and trailing "/" are stripped; anything
   * else throws). It is the post-sign-out redirect target. "" = derived from the page host.
   */
  portalOrgHost: string;
  /** The portal for a host with no zone (localhost, a bare host): a plain host name. */
  fallbackPortalHost: string;
}

export type AppSessionSettings = Pick<AppSessionConfig, "fallbackPortalHost"> &
  Partial<Omit<AppSessionConfig, "fallbackPortalHost">>;

const HOST =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

let current: Readonly<AppSessionConfig> | null = null;

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const zoneOf = (host: string): string => host.split(".").slice(-2).join(".");

/** The pinned portal host, or "" when none: same zone as the fallback portal, or it throws. */
function checkedPortalOrgHost(
  value: unknown,
  fallbackPortalHost: string,
): string {
  const raw = text(value);
  if (!raw) return "";
  const host = raw
    .replace(/^https:\/\//i, "")
    .replace(/\/$/, "")
    .toLowerCase();
  const zone = zoneOf(fallbackPortalHost);
  if (!HOST.test(host) || host === zone || !host.endsWith(`.${zone}`)) {
    throw new Error(
      `configureAppSession: portalOrgHost must be a host name in ${zone}, got ${JSON.stringify(value)}`,
    );
  }
  return host;
}

/** Set the settings. Call it once, before the app renders; a later call replaces them. */
export function configureAppSession(settings: AppSessionSettings): void {
  const fallbackPortalHost = text(settings.fallbackPortalHost).toLowerCase();
  if (!HOST.test(fallbackPortalHost)) {
    throw new Error(
      `configureAppSession: fallbackPortalHost must be a plain host name, got ${JSON.stringify(
        settings.fallbackPortalHost,
      )}`,
    );
  }
  current = Object.freeze({
    apiUrl: text(settings.apiUrl),
    defaultTenant: text(settings.defaultTenant),
    portalOrgHost: checkedPortalOrgHost(
      settings.portalOrgHost,
      fallbackPortalHost,
    ),
    fallbackPortalHost,
  });
}

/** The settings. Throws when the app never called configureAppSession (a wiring fault). */
export function sessionConfig(): Readonly<AppSessionConfig> {
  if (!current) {
    throw new Error(
      "configureAppSession() must be called before the app session is used",
    );
  }
  return current;
}

/** Tests only: forget the settings. */
export function resetAppSessionConfig(): void {
  current = null;
}
