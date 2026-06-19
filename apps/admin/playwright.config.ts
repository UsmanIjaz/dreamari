import { defineConfig, devices } from "@playwright/test";

// Assumes the admin dev server (5174) and the API (8080) are already running.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: { baseURL: "http://localhost:5174" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
