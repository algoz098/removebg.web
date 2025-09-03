import { test, expect } from '@playwright/test';

test.describe('Upload de Imagem', () => {

  test('deve fazer upload de uma imagem e exibir na tela', async ({ page }) => {
    console.log('🚀 Iniciando teste de upload de imagem...');

    await page.goto('/');
    await page.waitForSelector('.main-content', { state: 'visible', timeout: 20000 });

    const testImagePath = process.cwd() + '/public/screenshots/test.jpeg';

    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.style.display = 'block';
      }
    });

    await page.setInputFiles('#file-input', testImagePath);

    // Usa actionTimeout global de 60s
    await page.waitForFunction(() => {
      const page2 = document.getElementById('page-2');
      return page2 && window.getComputedStyle(page2).display === 'block';
    });

    await page.waitForTimeout(3000);

    const previewImg = page.locator('#preview');
    await expect(previewImg).toBeAttached();

    console.log('🎉 Teste de upload de imagem concluído com sucesso!');
  });

  test('deve cortar a imagem após upload', async ({ page }) => {
    console.log('🚀 Iniciando teste de corte de imagem...');

    await page.goto('/');
    await page.waitForSelector('.main-content', { state: 'visible', timeout: 20000 });

    const testImagePath = process.cwd() + '/public/screenshots/test.jpeg';

    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.style.display = 'block';
      }
    });

    await page.setInputFiles('#file-input', testImagePath);

    // Usa actionTimeout global de 60s
    await page.waitForFunction(() => {
      const page2 = document.getElementById('page-2');
      return page2 && window.getComputedStyle(page2).display === 'block';
    });

    await page.waitForTimeout(3000);

    const cropButton = page.locator('#crop-image, .crop-button, button:has-text("Cortar")');
    await expect(cropButton).toBeVisible({ timeout: 5000 });

    console.log('✅ Botão de corte encontrado, clicando...');
    await cropButton.click();

    await page.waitForFunction(() => {
      const pageCrop = document.getElementById('page-crop');
      return pageCrop && window.getComputedStyle(pageCrop).display === 'block';
    }, { timeout: 20000 });

    await page.waitForTimeout(2000);

    const cropContainer = page.locator('.crop-container, #crop-container');
    await expect(cropContainer).toBeVisible({ timeout: 5000 });

    console.log('🎉 Teste de corte de imagem concluído com sucesso!');
  });

});
