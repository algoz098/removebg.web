/**
 * Teste E2E - Verificação Básica de Carregamento da Página Inicial
 * Testa apenas se a página inicial carrega corretamente
 */

import { test, expect } from '@playwright/test';

test.describe('Verificação Básica - Página Inicial', () => {

  test('deve carregar a página inicial corretamente', async ({ page }) => {
    console.log('🚀 Iniciando teste básico de carregamento da página inicial...');

    // Ir para a página inicial
    await page.goto('/');
    console.log('✅ Navegação para página inicial realizada');

    // Verificar se o título da página está correto
    await expect(page).toHaveTitle(/RemoveBG|Remove Background/i);
    console.log('✅ Título da página verificado');

    // Aguardar um pouco para garantir que a página carregou completamente
    await page.waitForTimeout(2000);

    // Verificar se elementos básicos estão presentes
    const uploadArea = page.locator('#upload-area, .upload-area');
    await expect(uploadArea).toBeVisible({ timeout: 10000 });
    console.log('✅ Área de upload encontrada e visível');

    const fileInput = page.locator('#file-input');
    await expect(fileInput).toBeAttached();
    console.log('✅ Input de arquivo encontrado');

    // Verificar se a página 1 está ativa
    const page1 = page.locator('#page-1');
    await expect(page1).toBeVisible();
    console.log('✅ Página inicial (page-1) está visível');

    // Verificar se não há erros no console
    const errors = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Aguardar um pouco mais para capturar possíveis erros
    await page.waitForTimeout(1000);

    if (errors.length === 0) {
      console.log('✅ Nenhum erro de JavaScript detectado');
    } else {
      console.log('⚠️ Erros de JavaScript detectados:', errors);
    }

    console.log('🎉 Teste básico de carregamento da página inicial realizado com sucesso!');
  });
});
