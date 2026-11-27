/**
 * ./session: the app's whole sign-in and session. See README.md.
 *
 * Call configureAppSession() once in the app's entry point, before it renders.
 */

// The app's build settings (once, at start-up).
export {
  configureAppSession,
  type AppSessionConfig,
  type AppSessionSettings,
} from "./config";

// The platform host rules: the tenant a host names, and the same-origin API base.
export {
  appHostFromApiUrl,
  bareAppHost,
  classifyHost,
  configuredAppHost,
  currentDefaultTenantDoorUrl,
  currentTenantSlug,
  defaultTenantDoorUrl,
  tenantFromHost,
  type HostKind,
} from "./tenant-host";
export { appApiBase, resolveApiBase } from "./api-base";

// Boot, sign-in, refresh, sign-out (no React).
export {
  AUTH_ERROR_PARAM,
  beginBffLogin,
  bffStartUrl,
  bootSession,
  currentPath,
  isBareAppHost,
  isSafeReturnPath,
  lastBootResult,
  purgeBrowserTokens,
  refreshBffSession,
  signInDecision,
  signOutBffSession,
  type IBffStartOptions,
  type TBffRefreshResult,
  type TBootResult,
  type TSignInDecision,
  type TSignOutReason,
} from "./bff-signin";
export { onSignOut, signOut, watchSignOutInOtherTabs } from "./sign-out";

// The in-memory session store.
export {
  isLeaving,
  onSessionUser,
  sessionUser,
  type IAppSessionUser,
} from "./session-store";

// React: hooks, the provider, the route guard.
export {
  AppSessionProvider,
  useAppSession,
  useSessionUser,
  type IAppSession,
} from "./session-provider";
export { RequireSession, SignInGate } from "./sign-in-gate";

// The axios client's session part.
export { installSessionInterceptors } from "./api-interceptor";

// The portal (sign-in and sign-out destination).
export { portalSignOutUrl, resolvePortalUrl } from "./portal-url";

// The idle timeout's storage, for the app's tenant-config hook (it supplies idleMinutes).
export {
  IDLE_MINUTES_KEY,
  parseIdleMinutes,
  readStoredIdleMinutes,
  storeIdleMinutes,
} from "./idle-timeout";
