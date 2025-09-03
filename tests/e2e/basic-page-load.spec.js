/**
 * Teste E2E - Verificação Básica de Carregamento da Página Inicial
 * Testa apenas se a página inicial carrega corretamente
 */

import { test, expect } from '@playwright/test';

test.describe('Verificação Básica - Página Inicial', () => {

  test('deve carregar a página inicial corretamente', async ({ page }) => {
    // Array para capturar erros de console
    const errors = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Ir para a página inicial
    await page.goto('/');

    // Verificar se o título da página está correto
    await expect(page).toHaveTitle(/RemoveBG|Remove Background/i);

    // Aguardar que a aplicação carregue completamente (splash screen desapareça)
    await page.waitForSelector('.main-content', { state: 'visible', timeout: 30000 });

    // Aguardar um pouco mais para garantir que tudo está pronto
    await page.waitForTimeout(2000);

    // Verificar se elementos básicos estão presentes
    const uploadArea = page.locator('#upload-area, .upload-area');
    await expect(uploadArea).toBeVisible({ timeout: 10000 });

    const fileInput = page.locator('#file-input');
    await expect(fileInput).toBeAttached();

    // Verificar se a página 1 está ativa
    const page1 = page.locator('#page-1');
    await expect(page1).toBeVisible();

    // Aguardar um pouco mais para capturar possíveis erros
    await page.waitForTimeout(1000);

    // Verificar se não há erros críticos no console
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load resource') && 
      !error.includes('favicon.ico') &&
      !error.includes('sw.js')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
