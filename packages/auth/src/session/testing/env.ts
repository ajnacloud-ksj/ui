// Tests only (not built): the old VITE_* names mapped onto configureAppSession.
//
// Several suites call vi.resetModules() and re-import, which gives them a FRESH config module.
// The helper keeps the settings and every config module it has seen on globalThis, so a stub
// reaches the module the code under test actually uses.
import type { AppSessionSettings } from "../config";
import * as staticConfig from "../config";

type ConfigModule = typeof staticConfig;

const KEYS = {
  VITE_API_URL: "apiUrl",
  VITE_API_BASE: "apiUrl",
  VITE_DEFAULT_TENANT: "defaultTenant",
  VITE_PORTAL_ORG_HOST: "portalOrgHost",
} as const;

export const TEST_FALLBACK_PORTAL_HOST = "portal.example.test";

interface TestState {
  draft: AppSessionSettings;
  modules: Set<ConfigModule>;
}

const KEY = "__ajnaSessionTestState";
const holder = globalThis as unknown as Record<string, TestState | undefined>;
const state: TestState = (holder[KEY] ??= {
  draft: { fallbackPortalHost: TEST_FALLBACK_PORTAL_HOST },
  modules: new Set(),
});
state.modules.add(staticConfig);

function applyAll(): void {
  for (const m of state.modules) m.configureAppSession(state.draft);
}

export function stubSessionEnv(name: keyof typeof KEYS, value: string): void {
  state.draft = { ...state.draft, [KEYS[name]]: value };
  applyAll();
}

export function resetSessionEnv(): void {
  state.draft = { fallbackPortalHost: TEST_FALLBACK_PORTAL_HOST };
  applyAll();
}

/** After vi.resetModules(): configure the fresh config module the re-imported code will use. */
export async function configureFreshSession(): Promise<void> {
  const fresh = (await import("../config")) as ConfigModule;
  state.modules.add(fresh);
  fresh.configureAppSession(state.draft);
}
