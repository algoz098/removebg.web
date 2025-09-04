// Debug do problema de corte de imagem
const { chromium } = require('playwright');

async function debugCropIssue() {
  console.log('🔍 Iniciando debug do problema de corte...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Lento para podermos observar
  });
  
  const page = await browser.newPage();
  
  try {
    // Navegar para a página
    console.log('📍 Navegando para localhost:3000...');
    await page.goto('http://localhost:3000');
    
    // Aguardar a página carregar
    await page.waitForLoadState('networkidle');
    
    // Aguardar splash screen desaparecer
    console.log('⏳ Aguardando splash screen...');
    await page.waitForSelector('.main-content', { state: 'visible', timeout: 30000 });
    
    // Screenshot da página inicial
    await page.screenshot({ path: 'debug-initial.png' });
    console.log('📸 Screenshot da página inicial salva');
    
    // Verificar se área de upload está visível
    console.log('📁 Verificando área de upload...');
    await page.waitForSelector('#upload-area', { state: 'visible', timeout: 20000 });
    
    // Tornar input visível
    console.log('👁️ Tornando input de arquivo visível...');
    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.style.display = 'block';
        fileInput.style.position = 'relative';
        fileInput.style.opacity = '1';
        fileInput.style.zIndex = '9999';
      }
    });
    
    // Upload de imagem
    console.log('📤 Fazendo upload da imagem...');
    const testImagePath = process.cwd() + '/public/screenshots/test.jpeg';
    await page.setInputFiles('#file-input', testImagePath);
    
    // Aguardar navegação para página 2
    console.log('⏳ Aguardando página 2...');
    await page.waitForSelector('#page-2', { state: 'visible', timeout: 30000 });
    
    // Screenshot da página 2
    await page.screenshot({ path: 'debug-page2.png' });
    console.log('📸 Screenshot da página 2 salva');
    
    // Verificar botão de corte
    console.log('✂️ Verificando botão de corte...');
    const cropButton = page.locator('#crop-image');
    await cropButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Clicar no botão de corte
    console.log('👆 Clicando no botão de corte...');
    await cropButton.click();
    
    // Aguardar página de corte
    console.log('⏳ Aguardando página de corte...');
    await page.waitForSelector('#page-crop', { state: 'visible', timeout: 30000 });
    
    // Screenshot da página de corte
    await page.screenshot({ path: 'debug-crop-page.png' });
    console.log('📸 Screenshot da página de corte salva');
    
    // Aguardar canvas de corte
    console.log('🖼️ Aguardando canvas de corte...');
    await page.waitForSelector('#crop-preview canvas', { timeout: 10000 });
    
    // Verificar inputs de dimensão
    console.log('📏 Verificando inputs de dimensão...');
    const widthInput = page.locator('#crop-width');
    const heightInput = page.locator('#crop-height');
    
    await widthInput.waitFor({ state: 'visible' });
    await heightInput.waitFor({ state: 'visible' });
    
    // Verificar valores iniciais
    const initialWidth = await widthInput.inputValue();
    const initialHeight = await heightInput.inputValue();
    
    console.log(`📏 Dimensões iniciais: ${initialWidth}x${initialHeight}`);
    
    // Tentar preencher com 100x150
    console.log('✏️ Preenchendo com 100x150...');
    await widthInput.fill('100');
    await heightInput.fill('150');
    
    // Aguardar processamento
    await page.waitForTimeout(1000);
    
    // Verificar valores finais
    const finalWidth = await widthInput.inputValue();
    const finalHeight = await heightInput.inputValue();
    
    console.log(`📏 Dimensões finais: ${finalWidth}x${finalHeight}`);
    
    // Screenshot final
    await page.screenshot({ path: 'debug-final.png' });
    console.log('📸 Screenshot final salva');
    
    console.log('✅ Debug concluído com sucesso!');
    
    // Manter o navegador aberto por 10 segundos para observação
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Erro durante debug:', error);
    await page.screenshot({ path: 'debug-error.png' });
  } finally {
    await browser.close();
  }
}

debugCropIssue();
