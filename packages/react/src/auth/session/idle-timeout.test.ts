/**
 * Sign out after `sessionIdleMinutes` of inactivity (ajna-app-ui-template#21).
 *
 * Runs in node (no jsdom), like the rest of the suite: window and document are EventTargets,
 * storage is a Map, and `now` is a fake wall clock that moves independently of the timers, the
 * way a sleeping device's clock does.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ACTIVITY_EVENTS,
  ACTIVITY_WRITE_THROTTLE_MS,
  clearIdleState,
  enforceIdleTimeout,
  IDLE_CHECK_INTERVAL_MS,
  IDLE_MINUTES_KEY,
  isIdleExpired,
  LAST_ACTIVITY_KEY,
  markActivity,
  parseIdleMinutes,
  readStoredIdleMinutes,
  startIdleTimeout,
  storeIdleMinutes,
} from "./idle-timeout";

const MINUTE = 60 * 1000;
const T0 = Date.UTC(2026, 8, 30, 9, 0, 0);

let store: Map<string, string>;
let storage: Pick<Storage, "getItem" | "setItem" | "removeItem">;
let clock: number;
const now = () => clock;
let win: EventTarget;
let doc: EventTarget & { visibilityState: string };
let onExpire: ReturnType<typeof vi.fn>;
let stops: Array<() => void>;

beforeEach(() => {
  store = new Map();
  storage = {
    getItem: vi.fn((k: string) => store.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => void store.set(k, String(v))),
    removeItem: vi.fn((k: string) => void store.delete(k)),
  };
  clock = T0;
  win = new EventTarget();
  vi.stubGlobal("window", win);
  doc = Object.assign(new EventTarget(), { visibilityState: "visible" });
  vi.stubGlobal("document", doc);
  onExpire = vi.fn();
  stops = [];
  vi.useFakeTimers();
});

afterEach(() => {
  for (const stop of stops) stop();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function start(minutes: number): () => void {
  const stop = startIdleTimeout({ minutes, onExpire, now, storage });
  stops.push(stop);
  return stop;
}

/** The device sleeps: the wall clock moves, timers do not run. */
function sleep(ms: number): void {
  clock += ms;
}

/** The page is awake: the wall clock and the timers move together. */
function stayAwake(ms: number): void {
  clock += ms;
  vi.advanceTimersByTime(ms);
}

function storageEvent(key: string, newValue: string | null): Event {
  return Object.assign(new Event("storage"), { key, newValue });
}

describe("parseIdleMinutes", () => {
  it.each([
    [undefined, 0],
    [null, 0],
    [0, 0],
    [-5, 0],
    [1.5, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
    [10081, 0],
    ["abc", 0],
    ["", 0],
    [{}, 0],
    [true, 0],
    [2, 2],
    [10080, 10080],
    ["15", 15],
  ])("%j -> %i", (value, expected) => {
    expect(parseIdleMinutes(value)).toBe(expected);
  });
});

describe("off: sessionIdleMinutes 0 or absent", () => {
  it.each([0, parseIdleMinutes(undefined), -1])(
    "minutes=%i never signs out",
    (minutes) => {
      start(minutes);
      sleep(365 * 24 * 60 * MINUTE);
      doc.dispatchEvent(new Event("visibilitychange"));
      win.dispatchEvent(new Event("pageshow"));
      win.dispatchEvent(new Event("keydown"));
      vi.advanceTimersByTime(10 * IDLE_CHECK_INTERVAL_MS);

      expect(onExpire).not.toHaveBeenCalled();
      expect(enforceIdleTimeout()).toBe(false);
    },
  );

  it("still records activity, so turning it on later measures from the last input", () => {
    start(0);
    sleep(60 * MINUTE);
    win.dispatchEvent(new Event("pointerdown"));
    expect(store.get(LAST_ACTIVITY_KEY)).toBe(String(clock));
  });

  it("0 -> N in the same page with recent input does not expire", () => {
    markActivity(storage, now); // sign-in while the timeout is off
    const off = start(0);
    for (let i = 0; i < 120; i++) {
      // two hours of a click a minute
      sleep(MINUTE);
      win.dispatchEvent(new Event("pointerdown"));
    }
    off(); // the config re-read turned it on: restart with the new limit
    start(30);
    expect(onExpire).not.toHaveBeenCalled();

    sleep(30 * MINUTE);
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("0 -> N hands over input still inside the write throttle", () => {
    markActivity(storage, now);
    const off = start(0);
    sleep(20 * MINUTE);
    win.dispatchEvent(new Event("keydown")); // written
    sleep(5 * 1000);
    win.dispatchEvent(new Event("keydown")); // throttled: only a trailing write is pending
    off(); // stop() flushes it
    expect(store.get(LAST_ACTIVITY_KEY)).toBe(String(clock));
    start(20);
    sleep(20 * MINUTE - 1);
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).not.toHaveBeenCalled();
  });
});

describe("activity resets the timer", () => {
  it("seeds ajna_last_activity at start when there is none", () => {
    start(2);
    expect(store.get(LAST_ACTIVITY_KEY)).toBe(String(T0));
  });

  it.each(ACTIVITY_EVENTS)("%s resets it", (eventName) => {
    start(2);
    stayAwake(90 * 1000);
    win.dispatchEvent(new Event(eventName));
    expect(store.get(LAST_ACTIVITY_KEY)).toBe(String(T0 + 90 * 1000));

    stayAwake(90 * 1000); // 3 minutes since start, 90 s since the input
    expect(onExpire).not.toHaveBeenCalled();

    stayAwake(30 * 1000); // 2 minutes since the input
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("mouse movement is not activity", () => {
    start(2);
    stayAwake(90 * 1000);
    win.dispatchEvent(new Event("mousemove"));
    win.dispatchEvent(new Event("pointermove"));
    stayAwake(30 * 1000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("writes ajna_last_activity at most once per 15 s", () => {
    start(2);
    vi.mocked(storage.setItem).mockClear();
    sleep(20 * 1000);
    win.dispatchEvent(new Event("scroll"));
    for (let i = 0; i < 10; i++) {
      sleep(1000);
      win.dispatchEvent(new Event("scroll"));
    }
    expect(storage.setItem).toHaveBeenCalledTimes(1);

    sleep(ACTIVITY_WRITE_THROTTLE_MS);
    win.dispatchEvent(new Event("scroll"));
    expect(storage.setItem).toHaveBeenCalledTimes(2);
  });

  it("writes the last throttled input once the throttle window ends", () => {
    start(2);
    stayAwake(20 * 1000);
    win.dispatchEvent(new Event("keydown")); // written at T0+20s
    stayAwake(5 * 1000);
    win.dispatchEvent(new Event("keydown")); // throttled
    expect(store.get(LAST_ACTIVITY_KEY)).toBe(String(T0 + 20 * 1000));
    stayAwake(10 * 1000); // the 15 s window from the last write ends
    expect(store.get(LAST_ACTIVITY_KEY)).toBe(String(T0 + 25 * 1000));
  });

  it("throttled input still counts in this tab", () => {
    start(2);
    sleep(60 * 1000);
    win.dispatchEvent(new Event("keydown")); // written
    sleep(10 * 1000);
    win.dispatchEvent(new Event("keydown")); // inside the throttle: memory only
    sleep(115 * 1000); // 125 s since the write, 115 s since the last input
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("input after the limit does not revive the session", () => {
    start(2);
    sleep(3 * MINUTE);
    win.dispatchEvent(new Event("pointerdown"));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe("activity in another tab", () => {
  it("a storage event resets the timer", () => {
    start(2);
    sleep(90 * 1000);
    win.dispatchEvent(storageEvent(LAST_ACTIVITY_KEY, String(clock)));
    sleep(90 * 1000);
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("the shared value is read on every check", () => {
    start(2);
    sleep(90 * 1000);
    store.set(LAST_ACTIVITY_KEY, String(clock)); // another tab wrote it
    sleep(90 * 1000);
    win.dispatchEvent(new Event("focus"));
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("ignores storage events for other keys", () => {
    start(2);
    sleep(90 * 1000);
    win.dispatchEvent(storageEvent("vite-ui-theme", String(clock)));
    sleep(30 * 1000);
    win.dispatchEvent(new Event("focus"));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe("wall clock, not timers", () => {
  it("signs out on the 30 s check while awake", () => {
    start(2);
    stayAwake(2 * MINUTE - IDLE_CHECK_INTERVAL_MS);
    expect(onExpire).not.toHaveBeenCalled();
    stayAwake(IDLE_CHECK_INTERVAL_MS);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("signs out on visibilitychange after sleeping past the limit", () => {
    start(2);
    sleep(2 * MINUTE + 1);
    expect(onExpire).not.toHaveBeenCalled(); // no timer ran while asleep
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("ignores visibilitychange to hidden", () => {
    start(2);
    sleep(3 * MINUTE);
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).not.toHaveBeenCalled();
  });

  it.each(["pageshow", "focus", "online"])(
    "signs out on %s after sleeping past the limit",
    (eventName) => {
      start(2);
      sleep(3 * MINUTE);
      win.dispatchEvent(new Event(eventName));
      expect(onExpire).toHaveBeenCalledTimes(1);
    },
  );

  it("does not sign out on resume inside the limit", () => {
    start(2);
    sleep(2 * MINUTE - 1);
    doc.dispatchEvent(new Event("visibilitychange"));
    win.dispatchEvent(new Event("pageshow"));
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("signs out at start when the stored activity is already too old (reload)", () => {
    store.set(LAST_ACTIVITY_KEY, String(T0 - 10 * MINUTE));
    start(2);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("clamps a stored activity time in the future to now", () => {
    store.set(LAST_ACTIVITY_KEY, String(T0 + 60 * MINUTE));
    start(2);
    sleep(2 * MINUTE);
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("enforceIdleTimeout() runs the check on demand", () => {
    start(2);
    expect(enforceIdleTimeout()).toBe(false);
    sleep(3 * MINUTE);
    expect(enforceIdleTimeout()).toBe(true);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("enforceIdleTimeout() keeps answering true after the expiry, until the next sign-in", () => {
    markActivity(storage, now);
    start(5);
    sleep(6 * MINUTE);
    expect(enforceIdleTimeout()).toBe(true);
    expect(enforceIdleTimeout()).toBe(true); // a second concurrent 401
    expect(isIdleExpired()).toBe(true);
    markActivity(storage, now);
    expect(isIdleExpired()).toBe(false);
    expect(enforceIdleTimeout()).toBe(false);
  });

  it("expires once and then stops listening", () => {
    start(2);
    sleep(3 * MINUTE);
    doc.dispatchEvent(new Event("visibilitychange"));
    win.dispatchEvent(new Event("pageshow"));
    win.dispatchEvent(new Event("keydown"));
    stayAwake(5 * IDLE_CHECK_INTERVAL_MS);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe("stop()", () => {
  it("stops all checks and unregisters from enforceIdleTimeout", () => {
    const stop = start(2);
    stop();
    sleep(3 * MINUTE);
    doc.dispatchEvent(new Event("visibilitychange"));
    win.dispatchEvent(new Event("pageshow"));
    stayAwake(5 * IDLE_CHECK_INTERVAL_MS);
    expect(enforceIdleTimeout()).toBe(false);
    expect(onExpire).not.toHaveBeenCalled();
  });
});

describe("before an enforcer runs (cold start)", () => {
  function withGlobalStorage(): void {
    vi.stubGlobal("localStorage", storage);
    vi.setSystemTime(T0);
  }

  it("judges from the stored limit and activity time", () => {
    withGlobalStorage();
    storeIdleMinutes(2, storage);
    store.set(LAST_ACTIVITY_KEY, String(T0 - 3 * MINUTE));
    expect(enforceIdleTimeout()).toBe(true);
    expect(onExpire).not.toHaveBeenCalled(); // the enforcer signs out when it starts
  });

  it("is not expired inside the stored limit, or with no stored limit", () => {
    withGlobalStorage();
    store.set(LAST_ACTIVITY_KEY, String(T0 - 3 * MINUTE));
    expect(enforceIdleTimeout()).toBe(false);
    storeIdleMinutes(5, storage);
    expect(enforceIdleTimeout()).toBe(false);
  });
});

describe("stored limit", () => {
  it("round-trips, and invalid values read as 0", () => {
    expect(readStoredIdleMinutes(storage)).toBe(0);
    storeIdleMinutes(15, storage);
    expect(store.get(IDLE_MINUTES_KEY)).toBe("15");
    expect(readStoredIdleMinutes(storage)).toBe(15);
    store.set(IDLE_MINUTES_KEY, "garbage");
    expect(readStoredIdleMinutes(storage)).toBe(0);
  });
});

describe("markActivity / clearIdleState", () => {
  it("sign-in seeds the clock so a stale value cannot expire the new session", () => {
    store.set(LAST_ACTIVITY_KEY, String(T0 - 60 * MINUTE));
    markActivity(storage, now);
    start(2);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("sign-out clears the activity time and the stored limit", () => {
    markActivity(storage, now);
    storeIdleMinutes(15, storage);
    clearIdleState(storage);
    expect(store.has(LAST_ACTIVITY_KEY)).toBe(false);
    expect(store.has(IDLE_MINUTES_KEY)).toBe(false);
  });

  it("survives storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(() => markActivity(broken, now)).not.toThrow();
    expect(() => clearIdleState(broken)).not.toThrow();
    stops.push(
      startIdleTimeout({ minutes: 2, onExpire, now, storage: broken }),
    );
    sleep(90 * 1000);
    win.dispatchEvent(new Event("keydown"));
    sleep(90 * 1000);
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).not.toHaveBeenCalled();
    sleep(60 * 1000);
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
