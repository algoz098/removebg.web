// RemoveBG WebApp - Arquivo principal (Produção)
import { UIManager } from './ui-manager.js';
import { FileUploadManager } from './file-upload.js';
import { BackgroundProcessor } from './background-processor.js';
import { ImageCropper } from './image-cropper.js';
import { modelPreloader } from './model-preloader.js';
import { cacheManager } from './cache-manager.js';
import { globalState } from './global-state.js';

class RemoveBGApp {
  constructor() {
    this.uiManager = null;
    this.fileUploadManager = null;
    this.backgroundProcessor = null;
    this.imageCropper = null;
    this.isReady = false;
    
    this.waitForAppReady();
  }

  async waitForAppReady() {
    // Se splash já foi completado, inicializar imediatamente
    if (globalState.isSplashCompleted()) {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    // Escutar evento de app pronto
    window.addEventListener('appReady', () => {
      this.init();
    });
    
    // Timeout de segurança
    setTimeout(() => {
      if (!this.isReady) {
        this.init();
      }
    }, 5000);
  }
  
  async init() {
    if (this.isReady) {
      return;
    }
    
    // Aguardar um pouco para garantir que DOM está pronto
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar elementos essenciais com retry
    await this.waitForEssentialElements();
    
    this.uiManager = new UIManager();
    this.fileUploadManager = new FileUploadManager(this.uiManager);
    this.backgroundProcessor = new BackgroundProcessor(this.uiManager);
    
    // Usar o cropper pré-carregado ou criar um novo se necessário
    this.imageCropper = window.preloadedImageCropper || new ImageCropper();
    
    this.setupNavigationListeners();
    this.setupCropListeners();
    this.setupCacheManagement();
    this.uiManager.updateStatus('✅ Pronto para processar imagens!');
    this.uiManager.showPage(1);
    
    this.isReady = true;
    
    // Aplicação inicializada com sucesso
  }

  async waitForEssentialElements() {
    const maxRetries = 10;
    let retries = 0;
    
    while (retries < maxRetries) {
      const fileInput = document.getElementById('file-input');
      const uploadArea = document.getElementById('upload-area');
      
      if (fileInput && uploadArea) {
        return;
      }
      
      retries++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.error('❌ Elementos essenciais não encontrados após', maxRetries, 'tentativas');
  }

  setupNavigationListeners() {
    const backToUpload = document.getElementById('back-to-upload');
    const proceedToProcess = document.getElementById('proceed-to-process');
    const processNew = document.getElementById('process-new');
    const backToPreview = document.getElementById('back-to-preview');
    const backToPreviewFromResult = document.getElementById('back-to-preview-from-result');

    if (backToUpload) {
      backToUpload.addEventListener('click', () => {
        this.uiManager.showPage(1);
        this.uiManager.clearPreview();
        this.fileUploadManager.clearSelectedFile();
      });
    }

    if (proceedToProcess) {
      proceedToProcess.addEventListener('click', async () => {
        const file = this.fileUploadManager.getSelectedFile();
        if (!file) {
          this.uiManager.updateStatus('❌ Nenhum arquivo selecionado', 'error');
          return;
        }

        if (!modelPreloader.isReady() && !modelPreloader.isPreloading) {
          modelPreloader.startPreloading();
        }

        this.uiManager.showPage(3);
        this.uiManager.toggleProcessingSections(true);
        
        try {
          await this.backgroundProcessor.processImage(file);
        } catch (error) {
          this.uiManager.showPage(2);
        }
      });
    }

    if (processNew) {
      processNew.addEventListener('click', () => {
        this.uiManager.showPage(1);
        this.uiManager.clearPreview();
        this.uiManager.clearResults();
        this.fileUploadManager.clearSelectedFile();
      });
    }

    if (backToPreview) {
      backToPreview.addEventListener('click', () => {
        this.uiManager.showPage(2);
        this.uiManager.clearResults();
      });
    }

    if (backToPreviewFromResult) {
      backToPreviewFromResult.addEventListener('click', () => {
        this.uiManager.showPage(2);
        this.uiManager.clearResults();
      });
    }
  }

  setupCropListeners() {
    const cropImageBtn = document.getElementById('crop-image');
    const resetCropBtn = document.getElementById('reset-crop');
    const fullCropBtn = document.getElementById('full-crop');
    const applyCropBtn = document.getElementById('apply-crop');
    
    if (cropImageBtn) {
      cropImageBtn.addEventListener('click', () => {
        this.handleCropImage();
      });
    }

    if (resetCropBtn) {
      resetCropBtn.addEventListener('click', () => {
        this.imageCropper.resetCropArea();
        this.uiManager.updateStatus('🔄 Área de corte resetada', 'info');
      });
    }

    if (fullCropBtn) {
      fullCropBtn.addEventListener('click', () => {
        this.imageCropper.setFullCropArea();
        this.uiManager.updateStatus('📐 Imagem completa selecionada', 'info');
      });
    }

    if (applyCropBtn) {
      applyCropBtn.addEventListener('click', () => {
        this.handleApplyCrop();
      });
    }
  }

  async handleCropImage() {
    try {
      const file = this.fileUploadManager.getSelectedFile();
      if (!file) {
        this.uiManager.updateStatus('❌ Nenhum arquivo selecionado para cortar', 'error');
        return;
      }

      // Mostrar página de crop imediatamente
      this.uiManager.showPage('crop');
      
      // Mostrar indicador de carregamento
      this.uiManager.updateStatus('✂️ Preparando interface de corte...', 'loading');
      
      // Usar requestAnimationFrame para não bloquear a UI
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Carregar imagem de forma assíncrona
      await this.loadImageToCropper(file);
      
      this.uiManager.updateStatus('✂️ Ajuste a área de corte e clique em "Aplicar Corte"', 'info');
      
    } catch (error) {
      console.error('Erro ao inicializar crop:', error);
      this.uiManager.updateStatus('❌ Erro ao preparar ferramenta de corte', 'error');
    }
  }

  async loadImageToCropper(file) {
    // Dividir o carregamento em etapas para não bloquear a UI
    try {
      // Etapa 1: Mostrar que está carregando
      this.uiManager.updateStatus('✂️ Carregando imagem...', 'loading');
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Etapa 2: Carregar a imagem
      await this.imageCropper.loadImageAsync(file);
      
    } catch (error) {
      throw new Error(`Falha ao carregar imagem no cropper: ${error.message}`);
    }
  }

  async handleApplyCrop() {
    try {
      const croppedFile = await this.imageCropper.getCroppedFile();
      if (croppedFile) {
        // Atualizar o arquivo selecionado com a versão cortada
        this.fileUploadManager.setSelectedFile(croppedFile);
        
        // Mostrar preview da imagem cortada
        await this.fileUploadManager.showPreview(croppedFile);
        
        // Voltar para a página de preview
        this.uiManager.showPage(2);
        
        this.uiManager.updateStatus('✅ Imagem cortada com sucesso!', 'success');
      } else {
        this.uiManager.updateStatus('❌ Erro ao aplicar corte', 'error');
      }
    } catch (error) {
      console.error('Erro ao aplicar crop:', error);
      this.uiManager.updateStatus('❌ Erro ao aplicar corte', 'error');
    }
  }

  setupCacheManagement() {
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
    this.addCacheControls();
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/src/js/sw-advanced.js', {
        scope: '/src/js/'
      });
      
      registration.addEventListener('updatefound', () => {
        // Nova versão disponível
      });
      
    } catch (error) {
      // Fallback para SW simples
      try {
        await navigator.serviceWorker.register('/src/js/sw.js', {
          scope: '/src/js/'
        });
      } catch (fallbackError) {
        // Service Worker não disponível
      }
    }
  }

  addCacheControls() {
    const footer = document.querySelector('footer') || document.body;
    
    const cacheControls = document.createElement('div');
    cacheControls.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 1000;
        display: none;
      " id="cache-stats">
        <div id="cache-info">Cache: Carregando...</div>
        <button onclick="window.removeBGApp.showCacheStats()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          margin-top: 5px;
          cursor: pointer;
        ">📊 Stats</button>
        <button onclick="window.removeBGApp.clearCache()" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          margin-top: 5px;
          margin-left: 5px;
          cursor: pointer;
        ">🗑️ Limpar</button>
      </div>
    `;
    
    footer.appendChild(cacheControls);
    
    setTimeout(() => {
      document.getElementById('cache-stats').style.display = 'block';
      this.updateCacheInfo();
    }, 5000);
  }

  async updateCacheInfo() {
    try {
      const stats = await cacheManager.getCacheStats();
      const cacheInfo = document.getElementById('cache-info');
      if (cacheInfo) {
        cacheInfo.textContent = `Cache: ${stats.count} recursos (${stats.formattedSize})`;
      }
    } catch (error) {
      // Falha silenciosa
    }
  }

  async showCacheStats() {
    const stats = await cacheManager.getCacheStats();
    const types = Object.entries(stats.types).map(([type, count]) => `${type}: ${count}`).join('\n');
    
    const message = `Estatísticas do Cache:\n\n` +
          `Total de recursos: ${stats.count}\n` +
          `Tamanho total: ${stats.formattedSize}\n\n` +
          `Tipos de recursos:\n${types || 'Nenhum recurso ainda'}`;
    
    // Usar toast ao invés de alert para melhor UX
    if (window.toast) {
      toast.show(message, 'info', 10000);
    } else {
      alert(message);
    }
  }

  async clearCache() {
    if (confirm('Tem certeza que deseja limpar o cache?\n\nIsso forçará o download dos recursos novamente.')) {
      const success = await cacheManager.clearCache();
      if (success) {
        this.updateCacheInfo();
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_AI_CACHE' });
        }
      }
    }
  }

  downloadProcessedImage() {
    const processedImageBlob = globalState.getProcessedImageBlob();
    if (processedImageBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(processedImageBlob);
      link.download = 'imagem_processada.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } else {
      console.error('Imagem processada não está disponível');
    }
  }
}

// Expose global functions for onclick handlers
window.downloadProcessedImage = function() {
  if (window.removeBGApp) {
    window.removeBGApp.downloadProcessedImage();
  } else {
    console.error('RemoveBG App not initialized');
  }
};

window.removeBGApp = null;

document.addEventListener('DOMContentLoaded', () => {
  window.removeBGApp = new RemoveBGApp();
});
