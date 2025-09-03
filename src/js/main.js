// RemoveBG WebApp - Arquivo principal
import { UIManager } from './ui-manager.js';
import { FileUploadManager } from './file-upload.js';
import { BackgroundProcessor } from './background-processor.js';
import { modelPreloader } from './model-preloader.js';
import { cacheManager } from './cache-manager.js';
import { toast } from './toast.js';
import { globalState } from './global-state.js';
// import './network-monitor.js'; // Desabilitado temporariamente

class RemoveBGApp {
  constructor() {
    this.uiManager = null;
    this.fileUploadManager = null;
    this.backgroundProcessor = null;
    this.isReady = false;
    
    // Aguardar splash screen terminar
    this.waitForAppReady();
  }

  async waitForAppReady() {
    console.log('⏳ Aguardando splash screen terminar...');
    
    // Verificar estado global primeiro
    const stats = globalState.getStats();
    console.log('🌍 Estado global na inicialização do main:', stats);
    
    // Se splash já foi completado, inicializar imediatamente
    if (globalState.isSplashCompleted()) {
      console.log('⚡ Splash já completado globalmente, inicializando app imediatamente...');
      setTimeout(() => this.init(), 100);
      return;
    }
    
    // Escutar evento de app pronto
    window.addEventListener('appReady', () => {
      console.log('🔔 Evento appReady recebido!');
      console.log('✅ Splash screen terminou, inicializando app...');
      this.init();
    });
    
    // Timeout de segurança muito mais curto para debug
    setTimeout(() => {
      if (!this.isReady) {
        console.warn('⚠️ Timeout: forçando inicialização do app após 3 segundos');
        this.init();
      }
    }, 3000); // 3 segundos apenas para debug
    
    // Adicionar botão de inicialização manual para debug
    setTimeout(() => {
      if (!this.isReady) {
        console.log('🔧 Criando botão de debug para inicialização manual...');
      }
    }, 1000);
  }
  
  async init() {
    console.log('🚀 Inicializando RemoveBG App...');
    
    // Verificar se já foi inicializado
    if (this.isReady) {
      console.warn('⚠️ App já foi inicializado! Ignorando nova inicialização.');
      return;
    }
    
    // Verificar se splash ainda existe
    const splashElement = document.getElementById('splash-screen');
    if (splashElement) {
      console.warn('⚠️ Splash screen ainda existe no DOM!', splashElement);
    } else {
      console.log('✅ Splash screen removido do DOM');
    }
    
    // Verificar se main-content está visível
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const styles = window.getComputedStyle(mainContent);
      console.log('📊 Main content styles:', {
        display: styles.display,
        opacity: styles.opacity,
        visibility: styles.visibility
      });
    }
    
    // Aguardar um pouco para garantir que DOM está pronto
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar elementos essenciais
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const page1 = document.getElementById('page-1');
    const page2 = document.getElementById('page-2');
    
    console.log('🎯 Elementos do DOM verificados:', {
      fileInput: !!fileInput,
      uploadArea: !!uploadArea,
      page1: !!page1,
      page2: !!page2
    });
    
    if (!fileInput || !uploadArea) {
      console.error('❌ Elementos essenciais não encontrados! Aguardando mais...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.uiManager = new UIManager();
    this.fileUploadManager = new FileUploadManager(this.uiManager);
    this.backgroundProcessor = new BackgroundProcessor(this.uiManager);
    
    this.setupNavigationListeners();
    this.setupCacheManagement();
    this.uiManager.updateStatus('✅ Pronto para processar imagens!');
    this.uiManager.showPage(1);
    
    this.isReady = true;
    
    // Adicionar funções de teste globais
    window.debugApp = {
      testFileInput: () => {
        console.log('🧪 Testando input de arquivo...');
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
          console.log('✅ Input encontrado, simulando click...');
          fileInput.click();
        } else {
          console.error('❌ Input não encontrado!');
        }
      },
      
      testUploadArea: () => {
        console.log('🧪 Testando área de upload...');
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
          console.log('✅ Área encontrada, simulando click...');
          uploadArea.click();
        } else {
          console.error('❌ Área não encontrada!');
        }
      },
      
      showPage: (pageNumber) => {
        console.log(`🧪 Testando mudança para página ${pageNumber}...`);
        this.uiManager.showPage(pageNumber);
      },
      
      getElements: () => {
        return {
          fileInput: document.getElementById('file-input'),
          uploadArea: document.getElementById('upload-area'),
          page1: document.getElementById('page-1'),
          page2: document.getElementById('page-2'),
          page3: document.getElementById('page-3'),
          mainContent: document.querySelector('.main-content')
        };
      }
    };
    
    console.log('🧪 Funções de debug disponíveis em window.debugApp');
    
    // Função de teste global mais simples
    window.debugTest = () => {
      console.log('🧪 DEBUG TEST: Iniciando teste de upload...');
      
      // Verificar estado da aplicação
      console.log('🔍 Estado da aplicação:', {
        app: !!window.removeBGApp,
        ready: window.removeBGApp?.isReady,
        uiManager: !!window.removeBGApp?.uiManager,
        fileUploadManager: !!window.removeBGApp?.fileUploadManager
      });
      
      // Verificar elementos DOM
      const elements = {
        fileInput: document.getElementById('file-input'),
        uploadArea: document.getElementById('upload-area'),
        page1: document.getElementById('page-1'),
        page2: document.getElementById('page-2'),
        mainContent: document.querySelector('.main-content')
      };
      
      console.log('🎯 Elementos DOM:', elements);
      
      // Testar click no fileInput diretamente
      if (elements.fileInput) {
        console.log('🖱️ Testando click direto no input...');
        elements.fileInput.click();
      }
    };
    
    // Função para testar upload simples
    window.testUpload = () => {
      console.log('📁 Testando click na área de upload...');
      const uploadArea = document.getElementById('upload-area');
      const fileInput = document.getElementById('file-input');
      
      console.log('🔍 Elementos:', {
        uploadArea: !!uploadArea,
        fileInput: !!fileInput
      });
      
      if (uploadArea) {
        console.log('🖱️ Clicando na área de upload...');
        uploadArea.click();
      } else if (fileInput) {
        console.log('🖱️ Clicando diretamente no input...');
        fileInput.click();
      }
    };
      
      console.log('🎯 Elementos DOM:', Object.keys(elements).reduce((acc, key) => {
        acc[key] = !!elements[key];
        return acc;
      }, {}));
      
      // Tentar simular upload
      const fileInput = elements.fileInput;
      if (fileInput) {
        console.log('✅ Simulando click no input...');
        fileInput.click();
      } else {
        console.error('❌ Input não encontrado!');
      }
    };
    
    // Toast de boas-vindas mais discreto (modelo já foi carregado)
    setTimeout(() => {
      toast.success('🎉 RemoveBG pronto! Modelo de IA carregado e funcional.', 4000);
    }, 500);
    
    console.log('✅ RemoveBG App inicializado com sucesso!');
  }

  setupNavigationListeners() {
    // Botões de navegação
    const backToUpload = document.getElementById('back-to-upload');
    const proceedToProcess = document.getElementById('proceed-to-process');
    const processNew = document.getElementById('process-new');
    const backToPreview = document.getElementById('back-to-preview');

    // Voltar para upload
    if (backToUpload) {
      backToUpload.addEventListener('click', () => {
        this.uiManager.showPage(1);
        this.uiManager.clearPreview();
        this.fileUploadManager.clearSelectedFile();
      });
    }

    // Prosseguir para processamento
    if (proceedToProcess) {
      proceedToProcess.addEventListener('click', async () => {
        const file = this.fileUploadManager.getSelectedFile();
        if (!file) {
          this.uiManager.updateStatus('❌ Nenhum arquivo selecionado', 'error');
          return;
        }

        // Se o modelo não estiver carregado ainda, iniciar carregamento imediatamente
        if (!modelPreloader.isReady() && !modelPreloader.isPreloading) {
          toast.info('🚀 Iniciando carregamento do modelo...');
          modelPreloader.startPreloading();
        }

        this.uiManager.showPage(3);
        this.uiManager.toggleProcessingSections(true);
        
        try {
          await this.backgroundProcessor.processImage(file);
        } catch (error) {
          this.uiManager.showPage(2); // Voltar para preview em caso de erro
        }
      });
    }

    // Processar nova imagem
    if (processNew) {
      processNew.addEventListener('click', () => {
        this.uiManager.showPage(1);
        this.uiManager.clearPreview();
        this.uiManager.clearResults();
        this.fileUploadManager.clearSelectedFile();
      });
    }

    // Voltar para preview
    if (backToPreview) {
      backToPreview.addEventListener('click', () => {
        this.uiManager.showPage(2);
        this.uiManager.clearResults();
      });
    }
  }

  /**
   * Configura gerenciamento de cache e controles avançados
   */
  setupCacheManagement() {
    // Escutar mensagens do service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { data } = event;
        
        if (data.type === 'AI_CACHE_HIT') {
          console.log('🚀 Cache hit do SW:', data.url);
        } else if (data.type === 'AI_DOWNLOAD_START') {
          console.log('📥 SW iniciando download:', data.url);
        } else if (data.type === 'AI_CACHE_STORED') {
          console.log('💾 SW armazenou no cache:', data.url);
        }
      });

      // Registrar novo service worker (desabilitado para debug)
      // this.registerServiceWorker();
      console.log('⚠️ Service Worker desabilitado para debug');
    }

    // Adicionar controles de cache na interface (opcional)
    this.addCacheControls();
  }

  /**
   * Registra o service worker avançado
   */
  async registerServiceWorker() {
    try {
      // Registrar com escopo correto
      const registration = await navigator.serviceWorker.register('/src/js/sw-advanced.js', {
        scope: '/src/js/'
      });
      console.log('✅ Service Worker avançado registrado');
      
      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Nova versão do Service Worker disponível');
      });
      
    } catch (error) {
      console.warn('⚠️ Falha ao registrar Service Worker:', error);
      // Tentar registrar SW simples como fallback
      try {
        await navigator.serviceWorker.register('/src/js/sw.js', {
          scope: '/src/js/'
        });
        console.log('✅ Service Worker simples registrado como fallback');
      } catch (fallbackError) {
        console.warn('⚠️ Falha ao registrar SW fallback:', fallbackError);
      }
    }
  }

  /**
   * Adiciona controles de cache na interface
   */
  addCacheControls() {
    // Adicionar botão de estatísticas do cache no rodapé
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
    
    // Mostrar controles após alguns segundos
    setTimeout(() => {
      document.getElementById('cache-stats').style.display = 'block';
      this.updateCacheInfo();
    }, 5000);
  }

  /**
   * Atualiza informações do cache na interface
   */
  async updateCacheInfo() {
    try {
      const stats = await cacheManager.getCacheStats();
      const cacheInfo = document.getElementById('cache-info');
      if (cacheInfo) {
        cacheInfo.textContent = `Cache: ${stats.count} recursos (${stats.formattedSize})`;
      }
    } catch (error) {
      console.warn('Erro ao atualizar info do cache:', error);
    }
  }

  /**
   * Mostra estatísticas detalhadas do cache
   */
  async showCacheStats() {
    const stats = await cacheManager.getCacheStats();
    const types = Object.entries(stats.types).map(([type, count]) => `${type}: ${count}`).join('\n');
    
    alert(`📊 Estatísticas do Cache:\n\n` +
          `Total de recursos: ${stats.count}\n` +
          `Tamanho total: ${stats.formattedSize}\n\n` +
          `Tipos de recursos:\n${types || 'Nenhum recurso ainda'}`);
  }

  /**
   * Limpa o cache de recursos
   */
  async clearCache() {
    if (confirm('🗑️ Tem certeza que deseja limpar o cache?\n\nIsso forçará o download dos recursos novamente.')) {
      const success = await cacheManager.clearCache();
      if (success) {
        this.updateCacheInfo();
        // Também limpar cache do service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_AI_CACHE' });
        }
      }
    }
  }
}

// Expor globalmente para os botões inline
window.removeBGApp = null;

// Inicializar app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM carregado, criando app...');
  window.removeBGApp = new RemoveBGApp();
});
