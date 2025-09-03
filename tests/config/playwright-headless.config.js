import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E - Versão Headless (Console)
 */
export default defineConfig({
  testDir: '../e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter apenas console para versão headless
  reporter: [['line']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    actionTimeout: 0,
    navigationTimeout: 0,
    headless: true, // Sempre headless para versão console
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },

  projects: [
    {
      name: 'chromium-headless',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
