/**
 * Sign the user out after `sessionIdleMinutes` of inactivity (ajna-app-ui-template#21).
 *
 * Tracking and enforcement are separate. Activity is recorded whenever someone is signed in,
 * even while the timeout is off, so turning it on (0 → N) measures from the last real input and
 * not from the sign-in time.
 *
 * Expiry is measured by the wall clock, not by a timer: `now() - lastActivityAt >= minutes`.
 * A backgrounded tab or an installed PWA does not run timers while suspended. So the check
 * also runs when the page becomes visible, gains focus, is restored from the back/forward
 * cache, or comes back online, and a device that slept past the limit is signed out on resume.
 *
 * The last activity time lives in localStorage (`ajna_last_activity`). Every tab writes it and
 * every tab reads it, so input in any tab keeps all of them alive. API calls, background polling
 * and session refreshes are not activity: only the input events below are.
 *
 * The last known limit is kept in localStorage too (`ajna_idle_minutes`), so a new tab or a
 * relaunched PWA enforces it from boot, before the tenant config has been fetched again.
 *
 * Order matters on resume and on boot. An expired session must not be refreshed first, so every
 * refresh path asks `enforceIdleTimeout()` before it spends a refresh token.
 */

export const LAST_ACTIVITY_KEY = "ajna_last_activity";

/** The last known `sessionIdleMinutes`, persisted for the next cold start. */
export const IDLE_MINUTES_KEY = "ajna_idle_minutes";

/** The cockpit's and the SDK's upper bound for `sessionIdleMinutes` (7 days). */
export const MAX_IDLE_MINUTES = 10080;

/** How often the wall-clock check runs while the page is awake. */
export const IDLE_CHECK_INTERVAL_MS = 30 * 1000;

/** At most one `ajna_last_activity` write per this long; the last input is written after it. */
export const ACTIVITY_WRITE_THROTTLE_MS = 15 * 1000;

/** Input that counts as activity. Mouse movement is deliberately excluded. */
export const ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
] as const;

const RESUME_EVENTS = ["focus", "pageshow", "online"] as const;

type ActivityStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface IdleTimeoutOptions {
  /** Minutes of inactivity before sign-out. 0 or less: activity is tracked, nothing expires. */
  minutes: number;
  /** Called once when the session has been idle too long. */
  onExpire: () => void;
  now?: () => number;
  storage?: ActivityStorage;
}

/**
 * `sessionIdleMinutes` from the tenant config as a whole number of minutes. Anything missing,
 * malformed or out of range is 0 (off): an older backend does not send the key at all.
 */
export function parseIdleMinutes(value: unknown): number {
  const minutes =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : NaN;
  if (!Number.isInteger(minutes)) return 0;
  return minutes > 0 && minutes <= MAX_IDLE_MINUTES ? minutes : 0;
}

function defaultStorage(): ActivityStorage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function readLastActivity(storage: ActivityStorage | null): number | null {
  try {
    const raw = storage?.getItem(LAST_ACTIVITY_KEY) ?? null;
    const value = raw === null ? NaN : Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeLastActivity(storage: ActivityStorage, at: number): void {
  try {
    storage.setItem(LAST_ACTIVITY_KEY, String(at));
  } catch {
    // Storage unavailable (private mode, quota): this tab still tracks activity in memory.
  }
}

/** The last known `sessionIdleMinutes`, or 0 when none is stored. */
export function readStoredIdleMinutes(
  storage: ActivityStorage | null = defaultStorage(),
): number {
  try {
    return parseIdleMinutes(storage?.getItem(IDLE_MINUTES_KEY) ?? undefined);
  } catch {
    return 0;
  }
}

/** Remember the tenant's limit for the next cold start. */
export function storeIdleMinutes(
  minutes: number,
  storage: ActivityStorage = localStorage,
): void {
  try {
    storage.setItem(IDLE_MINUTES_KEY, String(parseIdleMinutes(minutes)));
  } catch {
    // Storage unavailable: the next cold start waits for the config fetch.
  }
}

// Set when a session expired for inactivity, until the next sign-in or enforcer start. While
// set, every refresh path stays refused and the plain "go to login" paths leave the idle
// navigation alone.
let idleExpired = false;

/** True after an idle sign-out, until the next sign-in. */
export function isIdleExpired(): boolean {
  return idleExpired;
}

/** Record activity now. Call at sign-in so a stale value from an old session cannot expire it. */
export function markActivity(
  storage: ActivityStorage = localStorage,
  now: () => number = Date.now,
): void {
  idleExpired = false;
  writeLastActivity(storage, now());
}

/** Forget the activity time and the stored limit. Call on sign-out. */
export function clearIdleState(storage: ActivityStorage = localStorage): void {
  try {
    storage.removeItem(LAST_ACTIVITY_KEY);
    storage.removeItem(IDLE_MINUTES_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

// The running enforcer's check, so the refresh paths can run it first.
let activeCheck: (() => boolean) | null = null;

/** Before any enforcer runs (boot): judge from the stored limit and activity time alone. */
function storedStateExpired(): boolean {
  const storage = defaultStorage();
  const minutes = readStoredIdleMinutes(storage);
  const last = readLastActivity(storage);
  return minutes > 0 && last !== null && Date.now() - last >= minutes * 60_000;
}

/**
 * Run the idle check now. Returns true when the session is idle-expired, in which case the
 * caller must not refresh it. With an enforcer running, it has already signed the user out.
 * Before one starts (a refresh at boot), the stored limit decides and the enforcer signs out
 * as soon as it starts.
 */
export function enforceIdleTimeout(): boolean {
  if (idleExpired) return true;
  return activeCheck ? activeCheck() : storedStateExpired();
}

/**
 * Track activity, and enforce the timeout when `minutes > 0`. Start it whenever someone is
 * signed in. Returns a stop function; call it on logout, unmount, or before restarting with a
 * new limit.
 */
export function startIdleTimeout({
  minutes,
  onExpire,
  now = Date.now,
  storage = localStorage,
}: IdleTimeoutOptions): () => void {
  const enforcing = minutes > 0;
  const limitMs = minutes * 60 * 1000;
  let stopped = false;
  let expired = false;
  let lastActivity = Number.NEGATIVE_INFINITY;
  let lastWrite = Number.NEGATIVE_INFINITY;
  let trailing: ReturnType<typeof setTimeout> | null = null;
  let interval: ReturnType<typeof setInterval> | null = null;
  idleExpired = false;

  // A stored time in the future (a clock change) counts as now, and is rewritten as now so it
  // cannot keep the session alive until the clock catches up.
  const readClamped = (): number | null => {
    const stored = readLastActivity(storage);
    if (stored === null) return null;
    const at = now();
    if (stored <= at) return stored;
    writeLastActivity(storage, at);
    return at;
  };

  const lastActivityAt = (): number =>
    Math.min(Math.max(lastActivity, readClamped() ?? lastActivity), now());

  const flush = (): void => {
    if (trailing !== null) {
      clearTimeout(trailing);
      trailing = null;
    }
    lastWrite = now();
    writeLastActivity(storage, lastActivity);
  };

  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    // Hand the latest input to whoever starts next (a restart with a new limit).
    if (trailing !== null && !expired) flush();
    if (trailing !== null) clearTimeout(trailing);
    if (interval !== null) clearInterval(interval);
    document.removeEventListener("visibilitychange", onVisibility);
    for (const name of RESUME_EVENTS) window.removeEventListener(name, check);
    for (const name of ACTIVITY_EVENTS) {
      window.removeEventListener(name, onActivity, { capture: true });
    }
    window.removeEventListener("storage", onStorage);
    if (activeCheck === check) activeCheck = null;
  };

  function check(): boolean {
    if (expired) return true;
    if (stopped || !enforcing) return false;
    if (now() - lastActivityAt() < limitMs) return false;
    expired = true;
    idleExpired = true;
    stop();
    onExpire();
    return true;
  }

  function onActivity(): void {
    const at = now();
    // Input after the limit does not revive the session: the resume check may not have run yet.
    if (enforcing && at - lastActivity >= limitMs && check()) return;
    lastActivity = at;
    if (at - lastWrite >= ACTIVITY_WRITE_THROTTLE_MS) {
      flush();
    } else if (trailing === null) {
      trailing = setTimeout(
        () => {
          trailing = null;
          if (!stopped) flush();
        },
        lastWrite + ACTIVITY_WRITE_THROTTLE_MS - at,
      );
    }
  }

  function onStorage(event: StorageEvent): void {
    if (event.key !== LAST_ACTIVITY_KEY || event.newValue === null) return;
    const at = Number(event.newValue);
    if (Number.isFinite(at))
      lastActivity = Math.max(lastActivity, Math.min(at, now()));
  }

  function onVisibility(): void {
    if (document.visibilityState === "visible") check();
  }

  const seeded = readClamped();
  if (seeded === null) {
    // No record (first start after an upgrade, or storage unavailable): start counting now.
    lastActivity = now();
    lastWrite = lastActivity;
    writeLastActivity(storage, lastActivity);
  } else {
    lastActivity = seeded;
  }

  if (enforcing) interval = setInterval(check, IDLE_CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", onVisibility);
  for (const name of RESUME_EVENTS) window.addEventListener(name, check);
  for (const name of ACTIVITY_EVENTS) {
    window.addEventListener(name, onActivity, { capture: true, passive: true });
  }
  window.addEventListener("storage", onStorage);
  activeCheck = check;

  // A reload or cold start after a long idle is a resume too.
  check();

  return stop;
}
