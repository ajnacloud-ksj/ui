import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./packages/react/src/components",
  testMatch: "**/*.browser.spec.ts",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.AJNA_CHROME_PATH
          ? { launchOptions: { executablePath: process.env.AJNA_CHROME_PATH } }
          : {}),
      },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command:
      "pnpm --filter @ajnacloud/ui exec vite --config ../../tests/consumer/vite.config.ts",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
