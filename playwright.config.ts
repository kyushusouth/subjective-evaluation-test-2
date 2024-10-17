/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import "dotenv/config";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",

  timeout: 100000000,

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    // Emulates `'prefers-colors-scheme'` media feature.
    colorScheme: "light",

    // Context geolocation.
    geolocation: { longitude: 136.4664008, latitude: 37.4900318 },

    // Emulates the user locale.
    locale: "ja-JP",

    // Grants specified permissions to the browser context.
    permissions: ["geolocation"],

    // Emulates the user timezone.
    timezoneId: "Asia/Tokyo",

    // Viewport used for all pages in the context.
    // viewport: { width: 1280, height: 720 },

    // Capture screenshot after each test failure.
    screenshot: "off",

    // Record trace only when retrying a test for the first time.
    trace: "on-first-retry",

    // Record video only when retrying a test for the first time.
    video: "off",

    testIdAttribute: "data-test-id",

    launchOptions: {
      slowMo: 500,
    },

    baseURL: "https://subjective-evaluation-test-2.vercel.app",
    // baseURL: "http://localhost:3000",
  },

  expect: {
    timeout: 100000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    /* Test against branded browsers. */
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
    {
      name: "Google Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: "npm run start",
  //   url: "http://127.0.0.1:3000",
  //   reuseExistingServer: !process.env.CI,
  // },
});
