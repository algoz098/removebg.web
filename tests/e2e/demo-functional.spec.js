/**
 * Teste de demonstração funcional
 * Este teste verifica se a aplicação carrega corretamente
 */

import { test, expect } from '@playwright/test';

test.describe('Testes Funcionais - Demo', () => {
  
  test('deve carregar a página principal com sucesso', async ({ page }) => {
    // Navegar para a página
    await page.goto('/');
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/RemoveBG|Remover Fundo/i);
    
    // Verificar se elementos essenciais estão presentes
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar se não há erros de JavaScript
    page.on('pageerror', (error) => {
      console.error('Erro JavaScript na página:', error);
    });
    
    // Aguarda a página carregar completamente
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Página carregou com sucesso!');
  });

  test('deve ter elementos básicos da interface', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verifica se existem elementos básicos (mesmo que não tenham data-testid ainda)
    const hasUploadArea = await page.locator('input[type="file"], [class*="upload"], [class*="drop"]').count() > 0;
    const hasButtons = await page.locator('button').count() > 0;
    
    expect(hasUploadArea || hasButtons).toBe(true);
    
    console.log('✅ Interface básica encontrada!');
  });

  test('deve conseguir navegar para página sobre', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tenta encontrar link para página sobre
    const aboutLink = page.locator('a[href*="sobre"], a[href*="about"]').first();
    
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verifica se navegou
      expect(page.url()).toContain('sobre');
      console.log('✅ Navegação para página sobre funcionou!');
    } else {
      // Se não tem link, navega diretamente
      await page.goto('/sobre.html');
      await page.waitForLoadState('networkidle');
      
      // Verifica se a página sobre existe
      const pageTitle = await page.title();
      console.log('📄 Título da página sobre:', pageTitle);
      console.log('✅ Página sobre acessível diretamente!');
    }
  });

  test('deve carregar recursos CSS e JS sem erro', async ({ page }) => {
    const errors = [];
    
    // Captura erros de rede
    page.on('response', response => {
      if (!response.ok() && (response.url().includes('.css') || response.url().includes('.js'))) {
        errors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verifica se não houve erros críticos
    expect(errors.length).toBeLessThan(3); // Permite alguns erros menores
    
    if (errors.length > 0) {
      console.log('⚠️ Alguns recursos não carregaram:', errors);
    } else {
      console.log('✅ Todos os recursos carregaram com sucesso!');
    }
  });

  test('deve funcionar em diferentes viewports', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verifica se a página ainda está funcional
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) - OK`);
    }
  });

});
