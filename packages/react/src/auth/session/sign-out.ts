import {
  SIGNED_OUT_AT_KEY,
  signOutBffSession,
  type TSignOutReason,
} from "./bff-signin";
import { portalSignOutUrl } from "./portal-url";
import {
  isLeaving,
  markLeaving,
  sessionUser,
  setSessionUser,
} from "./session-store";

type TCleanup = () => void;

const cleanups = new Set<TCleanup>();

/**
 * Run `cleanup` on every sign-out of this tab (the Logout button, the idle timeout, a sign-out
 * in another tab), before the page leaves. Returns the unsubscribe. This is how the app drops
 * data the module does not know about, without the module importing app code.
 */
export function onSignOut(cleanup: TCleanup): () => void {
  cleanups.add(cleanup);
  return () => {
    cleanups.delete(cleanup);
  };
}

function runCleanups(): void {
  for (const cleanup of cleanups) {
    try {
      cleanup();
    } catch (err) {
      console.error("Sign-out: a cleanup failed:", err);
    }
  }
}

/**
 * Sign out of this app, and go to the portal (still signed in there).
 *
 * The Logout button and the idle timeout both come here. The order matters: the app's own
 * caches go first (onSignOut listeners, for example the query cache), so the next person on this
 * browser never sees this tenant's data, then the backend session (bff-signin.ts
 * signOutBffSession), then the navigation. A second call while the first is still leaving does
 * nothing, and nothing starts a new sign-in meanwhile (markLeaving).
 */
export async function signOut(reason: TSignOutReason = "user"): Promise<void> {
  if (isLeaving()) return;
  markLeaving();
  runCleanups();
  const destination = await signOutBffSession({ reason });
  window.location.assign(destination);
}

/** The idle timeout expired: the same sign-out, with the reason passed to the portal. */
export function signOutAfterIdle(): void {
  void signOut("idle");
}

interface IStorageEventTarget {
  addEventListener(
    type: "storage",
    listener: (event: StorageEvent) => void,
  ): void;
  removeEventListener(
    type: "storage",
    listener: (event: StorageEvent) => void,
  ): void;
}

/**
 * A sign-out in one tab signs out every tab of this app in this browser. Without it, another
 * open tab keeps its user in memory, its next call gets a 401, and its automatic sign-in goes
 * straight back in through the portal, which undoes the sign-out. The other tab only follows:
 * the backend cookies are already cleared, so it drops its data and goes to the portal too.
 * Returns the unsubscribe.
 */
export function watchSignOutInOtherTabs(
  target: IStorageEventTarget = window,
): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SIGNED_OUT_AT_KEY || !event.newValue) return;
    if (isLeaving() || !sessionUser()) return;
    markLeaving();
    runCleanups();
    setSessionUser(null);
    window.location.assign(portalSignOutUrl("user"));
  };
  target.addEventListener("storage", onStorage);
  return () => target.removeEventListener("storage", onStorage);
}
