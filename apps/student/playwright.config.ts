import { defineConfig, devices } from "@playwright/test";

// Smoke tests assume the dev server (5173) and the API (8080) are already running.
// See e2e/smoke.spec.ts. For CI, add a `webServer` block to boot both.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: { baseURL: "http://localhost:5173", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
