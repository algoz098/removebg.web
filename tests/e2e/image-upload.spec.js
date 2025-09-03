/**
 * Teste E2E - Upload e Validação de Imagem
 * Testa o upload de uma imagem e valida se ela é exibida corretamente
 */

import { test, expect } from '@playwright/test';

test.describe('Upload de Imagem', () => {

  test('deve fazer upload de uma imagem e exibir na tela', async ({ page }) => {
    console.log('🚀 Iniciando teste de upload de imagem...');

    // Ir para a página inicial
    await page.goto('/');
    console.log('✅ Navegação para página inicial realizada');

    // Aguardar que a aplicação carregue completamente (splash screen)
    await page.waitForSelector('.main-content', { state: 'visible', timeout: 15000 });
    console.log('✅ Conteúdo principal carregado');

    // Aguardar que a página carregue completamente
    await page.waitForSelector('#upload-area', { timeout: 10000 });
    console.log('✅ Área de upload carregada');

    // Caminho para uma imagem de teste (absoluto)
    const testImagePath = process.cwd() + '/public/screenshots/test.jpeg';
    console.log('📁 Caminho da imagem de teste:', testImagePath);

    // Tornar o input file temporariamente visível para garantir que o evento funcione
    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.style.display = 'block';
      }
    });

    // Fazer upload da imagem
    await page.setInputFiles('#file-input', testImagePath);
    console.log('📤 Upload da imagem iniciado');

    // Aguardar a transição para a página de preview (page-2)
    await page.waitForFunction(() => {
      const page2 = document.getElementById('page-2');
      return page2 && window.getComputedStyle(page2).display === 'block';
    }, { timeout: 15000 });
    console.log('✅ Página de preview (page-2) está visível');

    // Aguardar um pouco para o processamento
    await page.waitForTimeout(2000);

    // Verificar se a imagem de preview existe
    const previewImg = page.locator('#preview');
    await expect(previewImg).toBeAttached();
    console.log('✅ Elemento #preview existe');

    console.log('🎉 Teste de upload de imagem concluído com sucesso!');
  });

  test('deve lidar com arquivos inválidos', async ({ page }) => {
    console.log('🚀 Iniciando teste de arquivo inválido...');

    // Ir para a página inicial
    await page.goto('/');

    // Aguardar que a página carregue
    await page.waitForSelector('#upload-area');

    // Tentar fazer upload de um arquivo não-imagem (usando um arquivo de texto como exemplo)
    const invalidFilePath = 'package.json';
    await page.setInputFiles('#file-input', invalidFilePath);

    // Aguardar um pouco para ver se há alguma reação
    await page.waitForTimeout(2000);

    // Verificar se ainda estamos na página 1 (não houve transição)
    const page1 = page.locator('#page-1');
    await expect(page1).toBeVisible();
    console.log('✅ Permaneceu na página de upload após arquivo inválido');

    // Verificar se não há imagem de preview
    const previewImg = page.locator('#preview');
    await expect(previewImg).not.toBeVisible();
    console.log('✅ Nenhuma imagem de preview exibida para arquivo inválido');

    console.log('🎉 Teste de arquivo inválido concluído com sucesso!');
  });

});
