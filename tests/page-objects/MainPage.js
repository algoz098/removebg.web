/**
 * Page Object para a página principal da aplicação
 * Encapsula interações com elementos da UI
 */

export class MainPage {
  constructor(page) {
    this.page = page;
    
    // Seletores principais
    this.selectors = {
      // Upload
      uploadArea: '[data-testid="upload-area"]',
      fileInput: 'input[type="file"]',
      dropZone: '[data-testid="drop-zone"]',
      uploadButton: '[data-testid="upload-button"]',
      
      // Imagens
      uploadedImage: '[data-testid="uploaded-image"]',
      processedImage: '[data-testid="processed-image"]',
      beforeImage: '[data-testid="before-image"]',
      afterImage: '[data-testid="after-image"]',
      
      // Controles
      processButton: '[data-testid="process-button"]',
      downloadButton: '[data-testid="download-button"]',
      resetButton: '[data-testid="reset-button"]',
      cropButton: '[data-testid="crop-button"]',
      resizeButton: '[data-testid="resize-button"]',
      
      // Estados
      loadingSpinner: '[data-testid="loading-spinner"]',
      processingLoader: '[data-testid="processing-loader"]',
      errorMessage: '[data-testid="error-message"]',
      successMessage: '[data-testid="success-message"]',
      
      // Navegação
      homeLink: '[data-testid="home-link"]',
      aboutLink: '[data-testid="about-link"]',
      helpButton: '[data-testid="help-button"]',
      
      // Progress
      progressBar: '[data-testid="progress-bar"]',
      progressText: '[data-testid="progress-text"]',
      
      // Resize controls
      widthInput: '[data-testid="width-input"]',
      heightInput: '[data-testid="height-input"]',
      maintainAspectRatio: '[data-testid="maintain-aspect-ratio"]',
      presetButtons: '[data-testid^="preset-"]',
      
      // Crop controls
      cropCanvas: '[data-testid="crop-canvas"]',
      applyCropButton: '[data-testid="apply-crop"]',
      cancelCropButton: '[data-testid="cancel-crop"]'
    };
  }

  // Navegação
  async goto() {
    await this.page.goto('/');
  }

  async goToAbout() {
    await this.page.click(this.selectors.aboutLink);
  }

  // Upload de imagens
  async uploadImage(imagePath) {
    await this.page.setInputFiles(this.selectors.fileInput, imagePath);
    await this.waitForImageUpload();
  }

  async dragAndDropImage(imagePath) {
    // Implementar drag and drop
    const buffer = require('fs').readFileSync(imagePath);
    const dataTransfer = await this.page.evaluateHandle((data) => {
      const dt = new DataTransfer();
      const file = new File([new Uint8Array(data)], 'test-image.jpg', { type: 'image/jpeg' });
      dt.items.add(file);
      return dt;
    }, [...buffer]);

    await this.page.dispatchEvent(this.selectors.dropZone, 'drop', { dataTransfer });
    await this.waitForImageUpload();
  }

  // Processamento
  async processImage() {
    await this.page.click(this.selectors.processButton);
    await this.waitForProcessingComplete();
  }

  async waitForImageUpload() {
    await this.page.waitForSelector(this.selectors.uploadedImage, { 
      state: 'visible',
      timeout: 10000 
    });
  }

  async waitForProcessingComplete() {
    // Aguarda loader aparecer
    await this.page.waitForSelector(this.selectors.processingLoader, { 
      state: 'visible',
      timeout: 5000 
    });
    
    // Aguarda loader desaparecer
    await this.page.waitForSelector(this.selectors.processingLoader, { 
      state: 'hidden',
      timeout: 60000 
    });
    
    // Aguarda imagem processada
    await this.page.waitForSelector(this.selectors.processedImage, { 
      state: 'visible',
      timeout: 5000 
    });
  }

  // Download
  async downloadImage() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click(this.selectors.downloadButton);
    return await downloadPromise;
  }

  // Crop
  async startCrop() {
    await this.page.click(this.selectors.cropButton);
    await this.page.waitForSelector(this.selectors.cropCanvas, { state: 'visible' });
  }

  async applyCrop() {
    await this.page.click(this.selectors.applyCropButton);
    await this.page.waitForSelector(this.selectors.cropCanvas, { state: 'hidden' });
  }

  async cancelCrop() {
    await this.page.click(this.selectors.cancelCropButton);
    await this.page.waitForSelector(this.selectors.cropCanvas, { state: 'hidden' });
  }

  // Resize
  async startResize() {
    await this.page.click(this.selectors.resizeButton);
  }

  async setDimensions(width, height) {
    await this.page.fill(this.selectors.widthInput, width.toString());
    await this.page.fill(this.selectors.heightInput, height.toString());
  }

  async selectPreset(presetName) {
    await this.page.click(`[data-testid="preset-${presetName}"]`);
  }

  async toggleAspectRatio() {
    await this.page.click(this.selectors.maintainAspectRatio);
  }

  // Reset
  async resetApp() {
    await this.page.click(this.selectors.resetButton);
  }

  // Verificações
  async isImageUploaded() {
    return await this.page.isVisible(this.selectors.uploadedImage);
  }

  async isImageProcessed() {
    return await this.page.isVisible(this.selectors.processedImage);
  }

  async isProcessing() {
    return await this.page.isVisible(this.selectors.processingLoader);
  }

  async hasError() {
    return await this.page.isVisible(this.selectors.errorMessage);
  }

  async hasSuccess() {
    return await this.page.isVisible(this.selectors.successMessage);
  }

  async getProgressText() {
    return await this.page.textContent(this.selectors.progressText);
  }

  async getImageSrc(selector) {
    return await this.page.getAttribute(selector, 'src');
  }

  // Helpers
  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    });
  }

  async isElementVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async isElementEnabled(selector) {
    return await this.page.isEnabled(selector);
  }

  async clickElement(selector) {
    await this.page.click(selector);
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}
