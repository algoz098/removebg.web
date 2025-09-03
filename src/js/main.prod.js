// RemoveBG WebApp - Arquivo principal (Produção)
import { UIManager } from './ui-manager.js';
import { FileUploadManager } from './file-upload.js';
import { BackgroundProcessor } from './background-processor.js';
import { modelPreloader } from './model-preloader.js';
import { cacheManager } from './cache-manager.js';
import { toast } from './toast.js';
import { globalState } from './global-state.js';

class RemoveBGApp {
  constructor() {
    this.uiManager = null;
    this.fileUploadManager = null;
    this.backgroundProcessor = null;
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
    
    this.setupNavigationListeners();
    this.setupCacheManagement();
    this.uiManager.updateStatus('✅ Pronto para processar imagens!');
    this.uiManager.showPage(1);
    
    this.isReady = true;
    
    // Toast de boas-vindas
    setTimeout(() => {
      toast.success('🎉 RemoveBG pronto! Modelo de IA carregado e funcional.', 4000);
    }, 500);
  }

  async waitForEssentialElements() {
    const maxRetries = 10;
    let retries = 0;
    
    while (retries < maxRetries) {
      const fileInput = document.getElementById('file-input');
      const uploadArea = document.getElementById('upload-area');
      
      console.log(`🔍 Tentativa ${retries + 1}: Verificando elementos essenciais...`, {
        fileInput: !!fileInput,
        uploadArea: !!uploadArea
      });
      
      if (fileInput && uploadArea) {
        console.log('✅ Elementos essenciais encontrados!');
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
          toast.info('🚀 Iniciando carregamento do modelo...');
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
    
    alert(`📊 Estatísticas do Cache:\n\n` +
          `Total de recursos: ${stats.count}\n` +
          `Tamanho total: ${stats.formattedSize}\n\n` +
          `Tipos de recursos:\n${types || 'Nenhum recurso ainda'}`);
  }

  async clearCache() {
    if (confirm('🗑️ Tem certeza que deseja limpar o cache?\n\nIsso forçará o download dos recursos novamente.')) {
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
      toast.show('❌ Imagem processada não está disponível', 'error');
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
