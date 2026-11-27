/**
 * The org portal: where people sign in, and where the app sends them after a sign-out.
 *
 * - The app's portalOrgHost setting (configureAppSession) wins when set.
 * - Otherwise derived from the current host. Platform zones have 2 labels:
 *   {tenant}.{app}.{zone} (4 labels) → the ORG door {tenant}.{zone}
 *   {app}.{zone}          (3 labels) → the central portal portal.{zone}
 * - localhost / bare hosts have no zone: the fallbackPortalHost setting.
 *
 * Moved from components/app-switcher.tsx so the sign-out can use it too.
 */
import { sessionConfig } from "./config";

export function resolvePortalUrl(
  hostname: string = window.location.hostname,
): string {
  const { portalOrgHost: configured, fallbackPortalHost } = sessionConfig();
  // Validated by configureAppSession: a plain host in the platform zone.
  if (configured) return `https://${configured}`;
  const labels = hostname.toLowerCase().split(":")[0].split(".");
  if (labels.length < 3) return `https://${fallbackPortalHost}`;
  const zone = labels.slice(-2).join(".");
  if (labels.length >= 4) return `https://${labels[0]}.${zone}`;
  return `https://portal.${zone}`;
}

/**
 * Where a sign-out goes: the portal, still signed in there. This app is not the identity
 * surface, so its sign-out ends only this app's session; a full sign-out is one click away at
 * the portal. `signed_out` names this app's host, and `reason=idle` says the idle timeout ended
 * the session (the portal does not read either yet; both are harmless until it does).
 */
export function portalSignOutUrl(
  reason: "user" | "idle" = "user",
  location: Pick<Location, "hostname" | "host"> = window.location,
): string {
  const url = new URL(resolvePortalUrl(location.hostname));
  url.searchParams.set("signed_out", location.host);
  if (reason === "idle") url.searchParams.set("reason", "idle");
  return url.toString();
}
