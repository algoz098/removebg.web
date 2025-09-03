import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E - Versão Headed (Interface Gráfica)
 */
export default defineConfig({
  testDir: '../e2e',
  timeout: 60 * 1000, // Aumentado para 60s
  expect: {
    timeout: 10000, // Aumentado para 10s
  },
  fullyParallel: false, // Desabilitado para versão headed para melhor visualização
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry uma vez mesmo localmente
  workers: 1, // Apenas 1 worker para versão headed

  // Reporter mais detalhado para versão headed
  reporter: [['line'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000, // Timeout razoável para ações
    navigationTimeout: 30000, // Timeout razoável para navegação
    headless: false, // Sempre headed para versão com interface
    slowMo: 500, // Adiciona delay para melhor visualização
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // Reutilizar servidor local se já estiver rodando
    timeout: 30000, // Timeout para iniciar o servidor
  },

  projects: [
    {
      name: 'chromium-headed',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global teardown para garantir que vídeos sejam salvos
  globalTeardown: '../global-teardown.js',
});
