import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
  },
  webServer: {
    command: "./node_modules/.bin/next dev --turbopack -p 3001",
    port: 3001,
    reuseExistingServer: true,
  },
});
