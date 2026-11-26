import { type ReactNode, useEffect, useSyncExternalStore } from "react";

import { startIdleTimeout } from "./idle-timeout";
import {
  type IAppSessionUser,
  onSessionUser,
  sessionUser,
} from "./session-store";
import { signOut, signOutAfterIdle, watchSignOutInOtherTabs } from "./sign-out";

/** The signed-in user (from `/auth/me` at boot), or null. Re-renders on a change. */
export function useSessionUser(): IAppSessionUser | null {
  return useSyncExternalStore(onSessionUser, sessionUser, sessionUser);
}

export interface IAppSession {
  user: IAppSessionUser | null;
  isAuthenticated: boolean;
  /** Sign out of this app and go to the portal (sign-out.ts). */
  logout: () => void;
}

function logout(): void {
  void signOut("user");
}

/**
 * Who is signed in, for the components. Sign-in is a platform feature: the user comes from
 * `GET /api/v1/auth/me` at boot (bff-signin.ts bootSession), held in memory (session-store.ts).
 * This hook only reads it, and offers the sign-out. It needs no provider.
 */
export function useAppSession(): IAppSession {
  const user = useSessionUser();
  return { user, isAuthenticated: user !== null, logout };
}

/**
 * The session's background work, mounted once near the root:
 * - a sign-out in another tab of this browser signs this tab out too;
 * - the idle timeout signs out after `idleMinutes` without input (0 or absent: off). The refresh
 *   path asks the enforcer first, so an idle-expired session is never refreshed.
 *
 * `idleMinutes` is the app's to supply (the tenant config), so this module reads no app data.
 */
export function AppSessionProvider({
  idleMinutes = 0,
  children,
}: {
  idleMinutes?: number;
  children: ReactNode;
}) {
  const signedIn = useSessionUser() !== null;
  useEffect(() => watchSignOutInOtherTabs(), []);
  useEffect(() => {
    if (!signedIn) return;
    return startIdleTimeout({
      minutes: idleMinutes,
      onExpire: signOutAfterIdle,
    });
  }, [signedIn, idleMinutes]);
  return <>{children}</>;
}
