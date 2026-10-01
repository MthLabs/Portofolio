const { defineConfig } = require("@playwright/test");
const base = process.env.BASE_URL || "http://127.0.0.1:4173/";
module.exports = defineConfig({
  testDir: "tests",
  use: { launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}, baseURL: base, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: process.env.BASE_URL ? undefined : { command: "npx http-server . -p 4173 -s", url: base, reuseExistingServer: true },
});
