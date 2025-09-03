import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E - Versão Headed (Interface Gráfica)
 */
export default defineConfig({
  testDir: '../e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false, // Desabilitado para versão headed para melhor visualização
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Apenas 1 worker para versão headed

  // Reporter mais detalhado para versão headed
  reporter: [['line'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 0,
    navigationTimeout: 0,
    headless: false, // Sempre headed para versão com interface
    slowMo: 500, // Adiciona delay para melhor visualização
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },

  projects: [
    {
      name: 'chromium-headed',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
