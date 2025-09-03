import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E - Versão Headless (Console)
 */
export default defineConfig({
  testDir: '../e2e',
  timeout: 60 * 1000, // Aumentado para 60s
  expect: {
    timeout: 10000, // Aumentado para 10s
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry uma vez mesmo localmente
  workers: process.env.CI ? 1 : undefined,

  // Reporter apenas console para versão headless
  reporter: [['line']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    actionTimeout: 30000, // Reduzido para 30s mas ainda generoso
    navigationTimeout: 30000, // Aumentado para 30s
    headless: true, // Sempre headless para versão console
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // Reutilizar servidor local se já estiver rodando
    timeout: 30000, // Timeout para iniciar o servidor
  },

  projects: [
    {
      name: 'chromium-headless',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global teardown para garantir que vídeos sejam salvos
  globalTeardown: '../global-teardown.js',
});
