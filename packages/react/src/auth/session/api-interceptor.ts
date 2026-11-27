import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import {
  beginBffLogin,
  currentPath,
  refreshBffSession,
  signedOutRecently,
  signInStopReason,
} from "./bff-signin";
import { cookieModeAvailable, cookieModeHeaders } from "./cookie-session";
import { enforceIdleTimeout } from "./idle-timeout";
import { isLeaving, setSessionUser } from "./session-store";

/**
 * The session part of the app's axios client. Install it ONCE, before the app's own response
 * interceptors (they run in the order they were added), so a 401 is handled here first:
 *
 * - request: on a call to the app's own API, `X-Ajna-Session: cookie` and, on a write, the
 *   `X-Ajna-CSRF` echo. The cookies go with it (`withCredentials`). No Authorization header,
 *   ever: the page holds no token.
 * - 401: ONE `refreshBffSession()` and a replay. A refused refresh, or a second 401, starts the
 *   BFF sign-in for this page (`beginBffLogin`), unless the loop guard holds. A refresh that
 *   could not reach the backend (5xx, network) only fails the call: the next one tries again.
 *
 * The rejected error is the original AxiosError, so the app's own error mapping still sees it.
 */

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Set by the session interceptor after its one refresh, so a request replays at most once. */
    _sessionRetried?: boolean;
  }
}

/** A 401 from these is an answer about the session itself; refreshing on it would loop. */
const NO_REFRESH_PATHS = [
  "/auth/me",
  "/auth/oidc/",
  "/auth/logout",
  "/auth/config",
  "/public/",
] as const;

function isNoRefreshPath(url: string): boolean {
  return NO_REFRESH_PATHS.some((p) => url.includes(p));
}

/** The origin a relative or absolute request url resolves to, or null. */
function requestOrigin(config: InternalAxiosRequestConfig): string | null {
  const url = config.url ?? "";
  const here = window.location.origin;
  try {
    const absolute = /^([a-z][a-z\d+.-]*:)?\/\//i.test(url);
    return (
      absolute ? new URL(url, here) : new URL(config.baseURL || "/", here)
    ).origin;
  } catch {
    return null;
  }
}

/**
 * Does this request go to the app's own API on this page's origin? A call to another origin
 * never gets the session headers, and the browser sends it no session cookie.
 */
function targetsOwnApi(config: InternalAxiosRequestConfig): boolean {
  const base = config.baseURL || "/";
  return (
    cookieModeAvailable(base) &&
    requestOrigin(config) === window.location.origin
  );
}

/**
 * The session is over (a 401 that one refresh could not fix): start the BFF sign-in for this
 * page. The page leaves, so the user is not cleared first. Not while signing out, after an idle
 * sign-out or a sign-out in another tab: those own the navigation.
 */
function startSignInAgain(): void {
  if (isLeaving() || enforceIdleTimeout() || signedOutRecently()) return;
  // The loop guard holds (for example: /auth/me accepts the session but data calls keep getting
  // a 401): drop the user, so the route guard shows why instead of starting again.
  if (signInStopReason()) {
    setSessionUser(null);
    return;
  }
  try {
    beginBffLogin({ returnTo: currentPath(), auto: true });
  } catch (err) {
    // No sign-in from this page (the bare app host, a cross-origin API): the route guard says so.
    console.error("Sign-in: could not start again:", err);
  }
}

/** Add the cookie-session request headers and the 401 handling to `instance`. */
export function installSessionInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    if (!targetsOwnApi(config)) return config;
    config.withCredentials = true;
    for (const [name, value] of Object.entries(
      cookieModeHeaders(config.method),
    )) {
      config.headers.set(name, value);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config;
      const url = config?.url ?? "";
      if (
        error.response?.status !== 401 ||
        !config ||
        !targetsOwnApi(config) ||
        isNoRefreshPath(url)
      ) {
        throw error;
      }
      // An idle-expired session is never refreshed (ajna-app-ui-template#21); neither is one
      // that is signing out.
      if (!config._sessionRetried && !isLeaving() && !enforceIdleTimeout()) {
        config._sessionRetried = true;
        const refreshed = await refreshBffSession();
        if (refreshed === "refreshed") return instance(config);
        if (refreshed === "refused") startSignInAgain();
      } else {
        startSignInAgain();
      }
      throw error;
    },
  );
}
