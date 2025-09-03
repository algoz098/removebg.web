import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Diretório onde estão os testes
  testDir: './tests/e2e',
  
  // Timeout para cada teste
  timeout: 30 * 1000,
  
  // Timeout para expects
  expect: {
    timeout: 5000,
  },
  
  // Executar testes em paralelo
  fullyParallel: true,
  
  // Falhar o build se houver testes passando acidentalmente
  forbidOnly: !!process.env.CI,
  
  // Retry nos testes que falharam apenas no CI
  retries: process.env.CI ? 2 : 0,
  
  // Número de workers paralelos
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter para usar localmente
  reporter: [
    ['html'],
    ['line'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Configurações globais para todos os testes
  use: {
    // URL base para os testes
    baseURL: 'http://localhost:3001',
    
    // Capturar trace em caso de falha
    trace: 'on-first-retry',
    
    // Capturar screenshot em caso de falha
    screenshot: 'only-on-failure',
    
    // Capturar vídeo em caso de falha
    video: 'retain-on-failure',
    
    // Timeout para ações
    actionTimeout: 0,
    
    // Timeout para navegação
    navigationTimeout: 0,
  },

  // Configuração de projetos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Testes em dispositivos móveis
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Testes específicos para PWA
    {
      name: 'pwa-chrome',
      use: {
        ...devices['Desktop Chrome'],
        // Simular comportamento de PWA
        viewport: { width: 1280, height: 720 },
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },
  ],

  // Configuração do servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Configurações globais
  globalSetup: './tests/config/global-setup.js',
  globalTeardown: './tests/config/global-teardown.js',
});
