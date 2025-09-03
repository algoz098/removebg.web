// Debug Interceptor - Captura todos os eventos e estados
export class DebugInterceptor {
  constructor() {
    this.events = [];
    this.maxEvents = 100;
    this.startTime = Date.now();
    
    this.setupGlobalInterceptors();
    this.setupConsoleOverride();
  }
  
  log(message, data = null) {
    const timestamp = Date.now() - this.startTime;
    const entry = {
      timestamp,
      message,
      data,
      stack: new Error().stack
    };
    
    this.events.push(entry);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    
    // Log original
    console.log(`[${timestamp}ms] ${message}`, data || '');
  }
  
  setupGlobalInterceptors() {
    // Interceptar todos os cliques
    document.addEventListener('click', (e) => {
      this.log(`🖱️ CLICK: ${e.target.tagName}#${e.target.id}.${e.target.className}`, {
        target: e.target,
        coordinates: { x: e.clientX, y: e.clientY }
      });
    }, true);
    
    // Interceptar mudanças em inputs
    document.addEventListener('change', (e) => {
      this.log(`📝 CHANGE: ${e.target.tagName}#${e.target.id}`, {
        target: e.target,
        value: e.target.value,
        files: e.target.files ? Array.from(e.target.files).map(f => f.name) : null
      });
    }, true);
    
    // Interceptar erros JavaScript
    window.addEventListener('error', (e) => {
      this.log(`❌ ERROR: ${e.message}`, {
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        error: e.error
      });
    });
    
    // Interceptar promises rejeitadas
    window.addEventListener('unhandledrejection', (e) => {
      this.log(`💥 UNHANDLED REJECTION: ${e.reason}`, {
        reason: e.reason,
        promise: e.promise
      });
    });
    
    // Interceptar mudanças no DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const element = mutation.target;
          if (element.id && element.id.includes('page-')) {
            this.log(`🎨 STYLE CHANGE: ${element.id}`, {
              display: element.style.display,
              visibility: element.style.visibility,
              opacity: element.style.opacity
            });
          }
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['style', 'class']
    });
  }
  
  setupConsoleOverride() {
    // Interceptar console.log para capturar logs da aplicação
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      this.events.push({
        timestamp: Date.now() - this.startTime,
        type: 'console.log',
        args
      });
      originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
      this.events.push({
        timestamp: Date.now() - this.startTime,
        type: 'console.error',
        args
      });
      originalError.apply(console, args);
    };
  }
  
  getEvents() {
    return this.events;
  }
  
  getEventsSince(timestamp) {
    return this.events.filter(e => e.timestamp > timestamp);
  }
  
  clear() {
    this.events = [];
  }
  
  exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      events: this.events,
      dom: this.getDOMState(),
      window: this.getWindowState()
    };
    
    console.log('📊 DEBUG REPORT:', report);
    return report;
  }
  
  getDOMState() {
    return {
      fileInput: {
        exists: !!document.getElementById('file-input'),
        value: document.getElementById('file-input')?.value || '',
        files: document.getElementById('file-input')?.files?.length || 0
      },
      uploadArea: {
        exists: !!document.getElementById('upload-area'),
        visible: this.isElementVisible(document.getElementById('upload-area'))
      },
      pages: {
        page1: {
          exists: !!document.getElementById('page-1'),
          display: document.getElementById('page-1')?.style.display || 'initial',
          visible: this.isElementVisible(document.getElementById('page-1'))
        },
        page2: {
          exists: !!document.getElementById('page-2'),
          display: document.getElementById('page-2')?.style.display || 'initial',
          visible: this.isElementVisible(document.getElementById('page-2'))
        },
        page3: {
          exists: !!document.getElementById('page-3'),
          display: document.getElementById('page-3')?.style.display || 'initial',
          visible: this.isElementVisible(document.getElementById('page-3'))
        }
      },
      mainContent: {
        exists: !!document.querySelector('.main-content'),
        display: document.querySelector('.main-content')?.style.display || 'initial',
        visible: this.isElementVisible(document.querySelector('.main-content'))
      }
    };
  }
  
  getWindowState() {
    return {
      removeBGApp: {
        exists: !!window.removeBGApp,
        isReady: window.removeBGApp?.isReady || false
      },
      location: window.location.href,
      userAgent: navigator.userAgent
    };
  }
  
  isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }
}

// Inicializar interceptador automaticamente
const debugInterceptor = new DebugInterceptor();
window.debugInterceptor = debugInterceptor;

// Criar funções de debug globais imediatamente
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

// Função para forçar processamento do arquivo selecionado
window.forceProcessFile = () => {
  console.log('🚀 Forçando processamento do arquivo...');
  
  const fileInput = document.getElementById('file-input');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    console.error('❌ Nenhum arquivo selecionado');
    return;
  }
  
  const file = fileInput.files[0];
  console.log('📁 Arquivo encontrado:', file.name, file.size);
  
  // Se o app ainda não estiver pronto, simular o processamento manualmente
  if (!window.removeBGApp || !window.removeBGApp.isReady) {
    console.log('🔧 App não está pronto, simulando processamento manual...');
    window.manualFileProcess(file);
  } else {
    console.log('✅ App pronto, usando processamento normal...');
    window.removeBGApp.fileUploadManager.processFile(file);
  }
};

// Função de processamento manual quando app não está pronto
window.manualFileProcess = async (file) => {
  try {
    console.log('🛠️ Processamento manual iniciado...');
    
    // Validação básica
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado');
    }
    
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Arquivo muito grande (máximo 10MB)');
    }
    
    console.log('✅ Arquivo validado');
    
    // Mostrar página 2 manualmente
    console.log('🔄 Mudando para página 2 manualmente...');
    const page1 = document.getElementById('page-1');
    const page2 = document.getElementById('page-2');
    
    if (page1) page1.style.display = 'none';
    if (page2) page2.style.display = 'block';
    
    // Criar preview manual
    console.log('🖼️ Criando preview manual...');
    const preview = document.getElementById('preview');
    if (preview) {
      const url = URL.createObjectURL(file);
      preview.src = url;
      console.log('✅ Preview criado com sucesso');
    }
    
    // Atualizar informações do arquivo
    const imageSize = document.getElementById('image-size');
    const imageDimensions = document.getElementById('image-dimensions');
    
    if (imageSize) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      imageSize.textContent = `${mb} MB`;
    }
    
    // Para dimensões, precisamos carregar a imagem
    if (imageDimensions && preview) {
      preview.onload = () => {
        imageDimensions.textContent = `${preview.naturalWidth} x ${preview.naturalHeight}px`;
        console.log('📐 Dimensões atualizadas');
      };
    }
    
    console.log('🎉 Processamento manual concluído!');
    
  } catch (error) {
    console.error('❌ Erro no processamento manual:', error);
    alert(`Erro: ${error.message}`);
  }
};

console.log('🔍 Debug Interceptor ativado!');
console.log('💡 Funções disponíveis:');
console.log('  - window.debugTest() - testa upload');
console.log('  - window.forceProcessFile() - processa arquivo selecionado');
console.log('  - window.debugInterceptor.exportReport() - relatório completo');
