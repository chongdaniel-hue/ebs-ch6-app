// Playwright settings for local testing only (not published).
const { defineConfig } = require("@playwright/test");
const crypto = require("crypto");
const os = require("os");
const path = require("path");

// A throwaway teacher code for this test run only, so no real code is ever written in the repo
// (the repo is public). It is in capitals so the tests can check that capitals and spaces do
// not matter. Test workers inherit it from this process.
process.env.TEST_TEACHER_CODE = process.env.TEST_TEACHER_CODE || "T" + crypto.randomBytes(5).toString("hex").toUpperCase();

process.env.TEST_RESET_CODE = process.env.TEST_RESET_CODE || "R" + crypto.randomBytes(5).toString("hex").toUpperCase();

module.exports = defineConfig({
  testDir: "tests",
  timeout: 60000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8788",
    browserName: "chromium"
  },
  webServer: {
    command: "node server/server.js",
    url: "http://localhost:8788",
    env: {
      PORT: "8788",
      TEACHER_CODE: process.env.TEST_TEACHER_CODE,
      RESET_CODE: process.env.TEST_RESET_CODE,
      DATA_DIR: path.join(os.tmpdir(), "ebs-ch6-playwright-data"),
      ALLOW_TEST_HOOKS: "1"
    },
    reuseExistingServer: false
  },
  projects: [
    { name: "laptop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true } }
  ]
});
