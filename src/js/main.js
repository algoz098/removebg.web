// RemoveBG WebApp - Arquivo principal (Produção)
import { UIManager } from './ui-manager.js';
import { FileUploadManager } from './file-upload.js';
import { BackgroundProcessor } from './background-processor.js';
import { ImageCropper } from './image-cropper.js';
import { modelPreloader } from './model-preloader.js';
import { cacheManager } from './cache-manager.js';
import { toast } from './toast.js';
import { globalState } from './global-state.js';

class RemoveBGApp {
  constructor() {
    this.uiManager = null;
    this.fileUploadManager = null;
    this.backgroundProcessor = null;
    this.imageCropper = null;
    this.croppedFile = null;
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
    
    // Verificar elementos essenciais
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    if (!fileInput || !uploadArea) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.uiManager = new UIManager();
    this.fileUploadManager = new FileUploadManager(this.uiManager);
    this.backgroundProcessor = new BackgroundProcessor(this.uiManager);
    
    this.setupNavigationListeners();
    this.setupDebugListeners();
    this.setupCacheManagement();
    this.uiManager.updateStatus('✅ Pronto para processar imagens!');
    this.uiManager.showPage(1);
    
    this.isReady = true;
    
    // Toast de boas-vindas
    setTimeout(() => {
      toast.success('🎉 RemoveBG pronto! Modelo de IA carregado e funcional.', 4000);
    }, 500);
  }

  setupNavigationListeners() {
    const backToUpload = document.getElementById('back-to-upload');
    const cropImage = document.getElementById('crop-image');
    const proceedToProcess = document.getElementById('proceed-to-process');
    const processNew = document.getElementById('process-new');
    const backToPreview = document.getElementById('back-to-preview');
    
    // Botões da página de cropping
    const backToPreviewFromCrop = document.getElementById('back-to-preview');
    const resetCrop = document.getElementById('reset-crop');
    const fullCrop = document.getElementById('full-crop');
    const applyCrop = document.getElementById('apply-crop');

    if (backToUpload) {
      backToUpload.addEventListener('click', () => {
        this.uiManager.showPage(1);
        this.uiManager.clearPreview();
        this.fileUploadManager.clearSelectedFile();
        this.clearCropCompletely();
      });
    }

    if (cropImage) {
      cropImage.addEventListener('click', () => {
        // Limpar arquivo cortado anterior se existir
        if (this.croppedFile) {
          this.croppedFile = null;
          this.removeCroppedIndicator();
        }
        this.initCropping();
      });
    }

    if (proceedToProcess) {
      proceedToProcess.addEventListener('click', async () => {
        // Usar arquivo cortado se disponível, senão usar arquivo original
        const file = this.croppedFile || this.fileUploadManager.getSelectedFile();
        if (!file) {
          this.uiManager.updateStatus('❌ Nenhum arquivo selecionado', 'error');
          return;
        }

        // Log para debug
        console.log('🎯 Processando arquivo:', {
          fileName: file.name,
          fileSize: file.size,
          isFromCrop: !!this.croppedFile,
          originalFile: this.fileUploadManager.getSelectedFile()?.name,
          croppedFileExists: !!this.croppedFile,
          usingCroppedVersion: !!this.croppedFile
        });

        if (!modelPreloader.isReady() && !modelPreloader.isPreloading) {
          toast.info('🚀 Iniciando carregamento do modelo...');
          modelPreloader.startPreloading();
        }

        this.uiManager.showPage(3);
        this.uiManager.toggleProcessingSections(true);
        
        try {
          // Passar label apropriado para o resultado
          const displayLabel = this.croppedFile ? '✂️ Cortada' : '📸 Original';
          console.log('📊 Processando com label:', displayLabel);
          await this.backgroundProcessor.processImage(file, displayLabel);
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
        this.clearCropCompletely();
        this.removeCroppedIndicator();
      });
    }

    if (backToPreview) {
      backToPreview.addEventListener('click', () => {
        this.uiManager.showPage(2);
        this.uiManager.clearResults();
      });
    }

    // Event listeners específicos do cropping
    if (resetCrop) {
      resetCrop.addEventListener('click', () => {
        if (this.imageCropper) {
          this.imageCropper.resetCropArea();
          this.imageCropper.draw();
          this.updateCropInfo();
        }
      });
    }

    if (fullCrop) {
      fullCrop.addEventListener('click', () => {
        if (this.imageCropper) {
          this.imageCropper.setFullCropArea();
          this.imageCropper.draw();
          this.updateCropInfo();
        }
      });
    }

    if (applyCrop) {
      applyCrop.addEventListener('click', async () => {
        await this.applyCropping();
      });
    }

    // Event listener específico para "voltar" da página de crop
    const backFromCropBtn = document.querySelector('#page-crop #back-to-preview');
    if (backFromCropBtn) {
      backFromCropBtn.addEventListener('click', () => {
        this.uiManager.showPage(2);
        this.clearCrop();
      });
    }
  }

  /**
   * Configura event listeners para debugging
   */
  setupDebugListeners() {
    const debugCropBtn = document.getElementById('debug-crop-btn');
    if (debugCropBtn) {
      debugCropBtn.addEventListener('click', () => {
        this.debugCropping();
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

  /**
   * Inicializa o sistema de cropping
   */
  async initCropping() {
    const preview = document.getElementById('preview');
    const cropPreview = document.getElementById('crop-preview');
    
    if (!preview || !preview.src) {
      toast.error('❌ Nenhuma imagem para cortar');
      return;
    }

    try {
      // Mostrar página de cropping
      this.uiManager.showPage('crop');
      
      // Criar nova instância do cropper
      this.imageCropper = new ImageCropper();
      
      // Aguardar imagem carregar completamente
      await this.ensureImageLoaded(preview);
      
      // Inicializar cropper
      this.imageCropper.init(preview, cropPreview);
      
      // Configurar atualização das dimensões em tempo real
      this.setupCropDimensionsUpdate();
      
      toast.success('✂️ Ferramenta de corte ativada! Arraste para selecionar a área');
      
    } catch (error) {
      console.error('Erro ao inicializar cropping:', error);
      toast.error('❌ Erro ao inicializar ferramenta de corte');
      this.uiManager.showPage(2);
    }
  }

  /**
   * Garante que a imagem está completamente carregada
   */
  ensureImageLoaded(img) {
    return new Promise((resolve, reject) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = reject;
      }
    });
  }

  /**
   * Configura atualização das dimensões do crop em tempo real
   */
  setupCropDimensionsUpdate() {
    if (!this.imageCropper) return;
    
    // Interceptar o método draw do cropper para atualizar dimensões
    const originalDraw = this.imageCropper.draw.bind(this.imageCropper);
    this.imageCropper.draw = () => {
      originalDraw();
      this.updateCropInfo();
    };
    
    // Atualização inicial
    this.updateCropInfo();
  }

  /**
   * Atualiza informações do crop na interface
   */
  updateCropInfo() {
    if (!this.imageCropper) return;
    
    const { width, height } = this.imageCropper.cropArea;
    
    // Converter de coordenadas da tela para coordenadas da imagem original
    const realWidth = width / this.imageCropper.scale;
    const realHeight = height / this.imageCropper.scale;
    
    this.uiManager.updateCropDimensions(realWidth, realHeight);
  }

  /**
   * Aplica o cropping e volta para a página de preview
   */
  async applyCropping() {
    if (!this.imageCropper) {
      toast.error('❌ Ferramenta de corte não inicializada');
      return;
    }

    try {
      toast.info('✂️ Aplicando corte...');
      
      console.log('🔄 Aplicando crop - Estado antes:', {
        cropArea: this.imageCropper.cropArea,
        imageSize: this.imageCropper.imageSize,
        originalImageDimensions: {
          width: this.imageCropper.originalImage.naturalWidth,
          height: this.imageCropper.originalImage.naturalHeight
        }
      });
      
      // Obter arquivo cortado
      this.croppedFile = await this.imageCropper.getCroppedFile('cropped-image.png');
      
      console.log('✂️ Arquivo cortado criado e salvo:', {
        name: this.croppedFile.name,
        size: this.croppedFile.size,
        type: this.croppedFile.type,
        originalFile: {
          name: this.fileUploadManager.getSelectedFile()?.name,
          size: this.fileUploadManager.getSelectedFile()?.size
        },
        timestamp: new Date().toISOString()
      });
      
      // Verificar se o arquivo cortado é diferente do original
      const originalFile = this.fileUploadManager.getSelectedFile();
      if (originalFile && this.croppedFile.size === originalFile.size) {
        console.warn('⚠️ ATENÇÃO: Arquivo cortado tem o mesmo tamanho do original!');
      }
      
      // Debug: Criar URLs temporárias para comparar visualmente
      const originalUrl = URL.createObjectURL(originalFile);
      const croppedUrl = URL.createObjectURL(this.croppedFile);
      
      console.log('🔍 URLs para comparação:', {
        original: originalUrl,
        cropped: croppedUrl
      });
      
      // Criar imagens temporárias para verificar dimensões
      const originalImg = new Image();
      const croppedImg = new Image();
      
      originalImg.onload = () => {
        console.log('📊 Dimensões - Original:', {
          width: originalImg.naturalWidth,
          height: originalImg.naturalHeight
        });
        URL.revokeObjectURL(originalUrl);
      };
      
      croppedImg.onload = () => {
        console.log('📊 Dimensões - Cortado:', {
          width: croppedImg.naturalWidth,
          height: croppedImg.naturalHeight
        });
        URL.revokeObjectURL(croppedUrl);
      };
      
      originalImg.src = originalUrl;
      croppedImg.src = croppedUrl;
      
      // Atualizar preview com imagem cortada
      await this.updatePreviewWithCroppedImage();
      
      // Limpar apenas o cropper visual, mas manter o arquivo cortado
      if (this.imageCropper) {
        this.imageCropper.destroy();
        this.imageCropper = null;
      }
      
      // Limpar container de crop
      const cropPreview = document.getElementById('crop-preview');
      if (cropPreview) {
        cropPreview.innerHTML = '';
      }
      
      // Voltar para página de preview
      this.uiManager.showPage(2);
      
      toast.success('✅ Imagem cortada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao aplicar crop:', error);
      toast.error('❌ Erro ao cortar imagem');
    }
  }

  /**
   * Atualiza o preview com a imagem cortada
   */
  async updatePreviewWithCroppedImage() {
    if (!this.croppedFile) return;
    
    const preview = document.getElementById('preview');
    const imageSize = document.getElementById('image-size');
    const imageDimensions = document.getElementById('image-dimensions');
    
    // Criar URL temporária para a imagem cortada
    const imageUrl = URL.createObjectURL(this.croppedFile);
    
    // Atualizar preview
    if (preview) {
      preview.src = imageUrl;
      
      // Aguardar carregar para obter dimensões
      await this.ensureImageLoaded(preview);
      
      // Limpar URL temporária anterior se existir
      if (preview.dataset.tempUrl) {
        URL.revokeObjectURL(preview.dataset.tempUrl);
      }
      preview.dataset.tempUrl = imageUrl;
    }
    
    // Atualizar informações da imagem
    if (imageSize) {
      imageSize.textContent = this.formatFileSize(this.croppedFile.size);
    }
    
    if (imageDimensions) {
      imageDimensions.textContent = `${preview.naturalWidth} × ${preview.naturalHeight}px`;
    }

    // Adicionar indicador visual de que a imagem foi cortada
    this.addCroppedIndicator();
  }

  /**
   * Adiciona indicador visual de que a imagem foi cortada
   */
  addCroppedIndicator() {
    // Remover indicador anterior se existir
    const existingIndicator = document.querySelector('.cropped-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Adicionar novo indicador
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      const indicator = document.createElement('div');
      indicator.className = 'cropped-indicator';
      indicator.innerHTML = '✂️ Imagem cortada - Esta versão será processada';
      indicator.style.cssText = `
        background: rgba(23, 162, 184, 0.1);
        border: 1px solid rgba(23, 162, 184, 0.3);
        color: #17a2b8;
        padding: 8px 12px;
        border-radius: 6px;
        margin-top: 10px;
        text-align: center;
        font-size: 14px;
        backdrop-filter: blur(10px);
      `;
      previewContainer.appendChild(indicator);
    }
  }

  /**
   * Remove indicador visual de corte
   */
  removeCroppedIndicator() {
    const existingIndicator = document.querySelector('.cropped-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
  }

  /**
   * Formata o tamanho do arquivo
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Limpa o cropper e libera recursos
   */
  clearCrop() {
    if (this.imageCropper) {
      this.imageCropper.destroy();
      this.imageCropper = null;
    }
    
    // Limpar container de crop
    const cropPreview = document.getElementById('crop-preview');
    if (cropPreview) {
      cropPreview.innerHTML = '';
    }
  }

  /**
   * Limpa completamente o crop incluindo o arquivo cortado
   */
  clearCropCompletely() {
    this.clearCrop();
    
    if (this.croppedFile) {
      this.croppedFile = null;
      this.removeCroppedIndicator();
    }
  }

  /**
   * Método para debug - testa o cropping com uma imagem de exemplo
   */
  debugCropping() {
    // Criar uma imagem de teste
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Desenhar um gradiente colorido para teste
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, '#4ecdc4');
    gradient.addColorStop(1, '#45b7d1');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    // Adicionar texto
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TESTE CROP', 200, 150);
    
    // Converter para blob e criar imagem
    canvas.toBlob((blob) => {
      const file = new File([blob], 'test-image.png', { type: 'image/png' });
      
      // Simular upload do arquivo
      this.fileUploadManager.selectedFile = file;
      
      // Atualizar preview
      const preview = document.getElementById('preview');
      if (preview) {
        preview.src = URL.createObjectURL(blob);
        preview.onload = () => {
          // Simular dados da imagem
          const imageSize = document.getElementById('image-size');
          const imageDimensions = document.getElementById('image-dimensions');
          
          if (imageSize) imageSize.textContent = this.formatFileSize(file.size);
          if (imageDimensions) imageDimensions.textContent = '400 × 300px';
          
          // Ir para página 2
          this.uiManager.showPage(2);
          
          console.log('🧪 Imagem de teste carregada! Clique em "Cortar Imagem" para testar');
        };
      }
    });
  }
}

window.removeBGApp = null;

document.addEventListener('DOMContentLoaded', () => {
  window.removeBGApp = new RemoveBGApp();
});
