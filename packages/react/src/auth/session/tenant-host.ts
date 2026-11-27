/**
 * Which tenant, if any, the page host names. The ONE place that reads a tenant from the host:
 * the API client's `X-Tenant-ID` header and the tenant config lookup both use it.
 *
 * An app answers on two kinds of host:
 *   myapp.example.test        the bare app host (the app's own UI domain): NO tenant
 *   acme.myapp.example.test   a tenant door `<tenant>.<app host>`: tenant `acme`
 *
 * The old rule ("first label of any 3+ label host") read the bare app host as tenant `myapp`,
 * because the app host is itself three labels. The old login page then showed "Workspace not
 * found" (ajna-app-ui-template#24), and every call sent `X-Tenant-ID: myapp`, which the SDK
 * treats as selecting a tenant the user is not a member of (ajnacloud-ksj/ajna-app-infra#310).
 *
 * The app host comes from the build: the deploy injects `VITE_API_URL` as
 * `https://<ui domain>/api/v1` for a same-origin API. When the page is not served under that
 * host (an API on its own subdomain, a relative url), we fall back to the platform's zone
 * shape: zones are two labels, so a 3-label host is the app and a 4+ label host is a door.
 * Local dev keeps the same model on `*.localhost` (`acme.myapp.localhost` is a door).
 *
 * On the bare app host no `X-Tenant-ID` is sent, so the SDK uses the tenant the token proves.
 * For a user in ONE tenant of this app that is the right tenant. For a user in SEVERAL, the SDK
 * (ajna-cloud-sdk#295) answers 409 `choose_tenant`, and `workspace-choice.ts` turns that into
 * links to the tenant doors. Older SDKs pick the first tenant group in the token.
 *
 * The slug is returned exactly as the host spells it. The SDK parses the tenant out of the
 * Cognito group `{app_prefix}-{tenant}-{role}` unchanged, so rewriting `-` to `_` here made
 * every hyphenated tenant a permanent non-member.
 */

import { sessionConfig } from "./config";

export type HostKind =
  | { kind: "app"; appHost: string }
  | { kind: "door"; tenant: string; appHost: string }
  | { kind: "other" };

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
/** One DNS label: what a tenant slug must be to sit in front of the app host. */
const DNS_LABEL = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
/**
 * Labels that are never a tenant. `www` is a reserved org name: a `www.` host is an alias of
 * the host it prefixes, so it names no tenant and sends no `X-Tenant-ID`.
 */
const NOT_A_TENANT = new Set(["www"]);

function normaliseHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0].replace(/\.$/, "");
}

function isLocalOrIp(host: string): boolean {
  return host === "localhost" || IPV4.test(host) || host.includes("[");
}

/** The hostname of an absolute API url (`https://myapp.example.test/api/v1` → the app host). */
export function appHostFromApiUrl(apiUrl: string | undefined): string {
  const raw = (apiUrl ?? "").trim();
  if (!/^https?:\/\//i.test(raw)) return "";
  try {
    return normaliseHost(new URL(raw).hostname);
  } catch {
    return "";
  }
}

/**
 * Fallback when the page is not provably under the app host: the platform's zone shape.
 * When the API host is known (`myapp-api.example.test`), its zone (`example.test`) bounds the
 * door: exactly `<tenant>.<app>.<zone>`. A host outside that zone (a BYO domain such as
 * `app.acme.co.uk`) names no tenant.
 */
function classifyByShape(host: string, apiHost: string): HostKind {
  const labels = host.split(".");
  const isLocalDev = labels[labels.length - 1] === "localhost";
  if (!DNS_LABEL.test(labels[0])) return { kind: "other" };
  if (!isLocalDev && apiHost) {
    const zone = apiHost.split(".").slice(1).join(".");
    const zoneLabels = zone ? zone.split(".").length : 0;
    const inZone = zoneLabels >= 2 && host.endsWith(`.${zone}`);
    if (!inZone || labels.length !== zoneLabels + 2) return { kind: "other" };
  }
  const doorMin = isLocalDev ? 3 : 4;
  if (labels.length < doorMin) return { kind: "other" };
  return {
    kind: "door",
    tenant: labels[0],
    appHost: labels.slice(1).join("."),
  };
}

/**
 * Classify `hostname` against the app host. Only an exact match is the bare app host
 * (`kind: "app"`); a host the fallback cannot place is `other` and has no tenant.
 */
export function classifyHost(hostname: string, appHost: string): HostKind {
  const kind = classifyHostShape(hostname, appHost);
  return kind.kind === "door" && NOT_A_TENANT.has(kind.tenant)
    ? { kind: "other" }
    : kind;
}

function classifyHostShape(hostname: string, appHost: string): HostKind {
  const host = normaliseHost(hostname);
  if (!host || isLocalOrIp(host) || !host.includes("."))
    return { kind: "other" };
  const raw = normaliseHost(appHost);
  const app = raw && !isLocalOrIp(raw) ? raw : "";
  if (app) {
    if (host === app) return { kind: "app", appHost: app };
    if (host.endsWith(`.${app}`)) {
      const prefix = host.slice(0, -(app.length + 1));
      return DNS_LABEL.test(prefix)
        ? { kind: "door", tenant: prefix, appHost: app }
        : { kind: "other" };
    }
  }
  return classifyByShape(host, app);
}

/**
 * The bare app host the page is on, or "" when it is on a door or on no app host. The parent
 * of every tenant door. Uses the same rules as `classifyHost`: an exact match with the app
 * host, else the zone shape (an in-zone host one label longer than the zone), else
 * `<app>.localhost` in local dev.
 */
export function bareAppHost(hostname: string, appHost: string): string {
  const host = normaliseHost(hostname);
  const kind = classifyHost(host, appHost);
  if (kind.kind === "app") return kind.appHost;
  if (kind.kind === "door") return "";
  const labels = host.split(".");
  if (!DNS_LABEL.test(labels[0])) return "";
  if (labels.length === 2 && labels[1] === "localhost") return host;
  const api = normaliseHost(appHost);
  if (!api || isLocalOrIp(api)) return "";
  const zone = api.split(".").slice(1).join(".");
  const zoneLabels = zone ? zone.split(".").length : 0;
  const inZone = zoneLabels >= 2 && host.endsWith(`.${zone}`);
  return inZone && labels.length === zoneLabels + 1 ? host : "";
}

/** The tenant slug the host names, or "" when it names none (bare app host, localhost, IP). */
export function tenantFromHost(hostname: string, appHost: string): string {
  const kind = classifyHost(hostname, appHost);
  return kind.kind === "door" ? kind.tenant : "";
}

/** The app host this build was deployed for, read from the injected API url. */
export function configuredAppHost(): string {
  return appHostFromApiUrl(sessionConfig().apiUrl);
}

/** The tenant the current page's host names, or "" — the value for `X-Tenant-ID`. */
export function currentTenantSlug(): string {
  return tenantFromHost(window.location.hostname, configuredAppHost());
}

interface PageLocation {
  hostname: string;
  protocol: string;
  port: string;
  pathname: string;
  search: string;
}

/**
 * Where to send a visitor on the bare app host, or null to stay. Dev sets
 * `VITE_DEFAULT_TENANT` (e.g. `ajna`) and the bare host goes to that tenant's door, same path.
 * Prod has no default tenant by design, so it stays and the sign-in gate says to use the
 * organisation's address (the bare host cannot sign in).
 */
export function defaultTenantDoorUrl(
  here: PageLocation,
  appHost: string,
  defaultTenant: string,
): string | null {
  const tenant = defaultTenant.trim().toLowerCase();
  if (!tenant || !DNS_LABEL.test(tenant)) return null;
  const kind = classifyHost(here.hostname, appHost);
  if (kind.kind !== "app") return null;
  const port = here.port ? `:${here.port}` : "";
  return `${here.protocol}//${tenant}.${kind.appHost}${port}${here.pathname}${here.search}`;
}

/**
 * `defaultTenantDoorUrl` for the current page and build. A signed-in visitor stays: the session
 * cookie is host-only, so moving them to the door would force a new sign-in.
 */
export function currentDefaultTenantDoorUrl(
  isAuthenticated: boolean,
): string | null {
  if (isAuthenticated) return null;
  return defaultTenantDoorUrl(
    window.location,
    configuredAppHost(),
    sessionConfig().defaultTenant,
  );
}
