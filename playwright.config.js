// Playwright settings for local testing only (not published).
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 30000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8788",
    browserName: "chromium"
  },
  webServer: {
    command: "node server/server.js",
    url: "http://localhost:8788",
    env: { PORT: "8788" },
    reuseExistingServer: false
  },
  projects: [
    { name: "laptop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true } }
  ]
});
