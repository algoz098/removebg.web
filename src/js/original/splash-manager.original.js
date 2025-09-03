// Splash Screen Manager - Tela de carregamento inicial
// Importações dinâmicas para evitar problemas de dependência
let cacheManager = null;
let globalState = null;

// Carregar dependências dinamicamente
async function loadDependencies() {
  try {
    const cacheModule = await import('./cache-manager.js');
    cacheManager = cacheModule.cacheManager;
    
    const stateModule = await import('./global-state.js'); 
    globalState = stateModule.globalState;
    
    console.log('✅ Dependências carregadas com sucesso');
  } catch (error) {
    console.warn('⚠️ Erro carregando dependências:', error);
  }
}

// Variável global para armazenar o modelo inicializado
window.preloadedBackgroundRemover = null;

export class SplashManager {
  constructor() {
    this.isLoading = true;
    this.currentStep = 0;
    this.totalProgress = 0;
    
    // Verificar se deve usar carregamento rápido
    this.shouldUseFastLoad = false; // Inicializar como false até carregar deps
    
    // Sistema de medição de velocidade
    this.speedTracker = {
      downloads: new Map(), // url -> {startTime, bytesLoaded, lastTime, lastBytes}
      cacheReads: [],
      cacheWrites: [],
      currentDownloadSpeed: 0,
      currentReadSpeed: 0,
      currentWriteSpeed: 0,
      eta: null
    };
    
    // Steps do carregamento
    this.steps = [
      { 
        id: 'cache', 
        icon: '💾', 
        text: 'Verificando cache...', 
        size: '', 
        progress: 0 
      },
      { 
        id: 'files', 
        icon: '📦', 
        text: 'Carregando arquivos...', 
        size: '0 MB', 
        progress: 0 
      },
      { 
        id: 'ai', 
        icon: '🧠', 
        text: 'Preparando modelo de IA...', 
        size: '45 MB', 
        progress: 0 
      },
      { 
        id: 'initialization', 
        icon: '⚙️', 
        text: 'Inicializando sistema...', 
        size: '', 
        progress: 0 
      },
      { 
        id: 'ready', 
        icon: '✅', 
        text: 'Aplicação pronta!', 
        size: '', 
        progress: 100 
      }
    ];
    
    this.init();
  }

  async init() {
    // Carregar dependências primeiro
    await loadDependencies();
    
    // Agora verificar fast load
    this.shouldUseFastLoad = this.checkFastLoad();
    
    this.createSplashScreen();
    this.startLoading();
  }

  /**
   * Verificar se deve usar carregamento rápido baseado no navigation manager
   */
  checkFastLoad() {
    try {
      const fastLoad = sessionStorage.getItem('fastLoad');
      const reason = sessionStorage.getItem('fastLoadReason') || 
                    sessionStorage.getItem('fastLoadSource');
      
      if (fastLoad === 'true' && globalState && globalState.isCacheReady()) {
        console.log('⚡ Fast load ativado:', reason, globalState.getStats());
        
        // Limpar flags
        sessionStorage.removeItem('fastLoad');
        sessionStorage.removeItem('fastLoadReason');
        sessionStorage.removeItem('fastLoadSource');
        
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Erro verificando fast load:', error);
    }
    
    return false;
  }

  createSplashScreen() {
    const splashHTML = `
      <div class="splash-screen" id="splash-screen">
        <div class="splash-logo">🎨</div>
        <div class="splash-title">RemoveBG</div>
        <div class="splash-subtitle">Remoção de Fundo com IA</div>
        
        <div class="splash-progress">
          <div class="splash-progress-label">
            <span id="splash-current-step">Iniciando...</span>
            <span id="splash-percentage">0%</span>
          </div>
          <div class="splash-progress-bar">
            <div class="splash-progress-fill" id="splash-progress-fill"></div>
          </div>
        </div>
        
        <div class="splash-status" id="splash-status">
          Preparando aplicação...
        </div>
        
        <div class="splash-speed-metrics" id="splash-speed-metrics">
          <div class="speed-item">
            <span class="speed-icon">📥</span>
            <span class="speed-label">Download:</span>
            <span class="speed-value" id="download-speed">-- KB/s</span>
          </div>
          <div class="speed-item">
            <span class="speed-icon">💾</span>
            <span class="speed-label">Cache:</span>
            <span class="speed-value" id="cache-speed">-- KB/s</span>
          </div>
          <div class="speed-item">
            <span class="speed-icon">⏱️</span>
            <span class="speed-label">ETA:</span>
            <span class="speed-value" id="eta-time">--</span>
          </div>
        </div>
        
        <div class="splash-details">
          <div id="splash-steps"></div>
          
          <div class="splash-loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

    // Criar e inserir splash screen
    const splashElement = document.createElement('div');
    splashElement.innerHTML = splashHTML;
    document.body.insertBefore(splashElement.firstElementChild, document.body.firstChild);

    // Renderizar steps
    this.renderSteps();
  }

  renderSteps() {
    const stepsContainer = document.getElementById('splash-steps');
    if (!stepsContainer) return;

    stepsContainer.innerHTML = this.steps.map((step, index) => `
      <div class="splash-step ${index === 0 ? 'active' : ''}" id="step-${step.id}">
        <div class="step-icon">${step.icon}</div>
        <div class="step-content">
          <div class="step-text">${step.text}</div>
          <div class="step-size">${step.size}</div>
          <div class="step-progress">
            <div class="step-progress-bar">
              <div class="step-progress-fill" style="width: ${step.progress}%"></div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  async startLoading() {
    console.log('🚀 Iniciando splash screen...');
    
    // Se fast load está ativado, usar processo acelerado
    if (this.shouldUseFastLoad) {
      await this.fastLoad();
      return;
    }
    
    // Processo normal de carregamento
    await this.normalLoad();
  }

  async fastLoad() {
    console.log('⚡ Executando fast load...');
    
    this.updateProgress('cache', 20, 'Cache verificado rapidamente');
    await this.delay(200);
    
    this.updateProgress('files', 40, 'Arquivos já em cache');
    await this.delay(200);
    
    this.updateProgress('ai', 70, 'Modelo já carregado');
    await this.delay(300);
    
    this.updateProgress('initialization', 90, 'Sistemas já inicializados');
    await this.delay(200);
    
    this.updateProgress('ready', 100, 'Aplicação pronta!');
    await this.delay(300);
    
    this.finishLoading();
  }

  async normalLoad() {
    console.log('🔄 Executando carregamento normal...');
    
    try {
      // 1. Verificar cache
      this.updateProgress('cache', 5, 'Verificando cache local...');
      await this.initializeCache();
      
      // 2. Carregar arquivos básicos
      this.updateProgress('files', 20, 'Carregando recursos...');
      await this.loadBasicFiles();
      
      // 3. Carregar modelo de IA
      this.updateProgress('ai', 40, 'Baixando modelo de IA...');
      await this.loadAIModel();
      
      // 4. Inicializar sistemas
      this.updateProgress('initialization', 90, 'Inicializando sistemas...');
      await this.initializeSystems();
      
      // 5. Finalizar
      this.updateProgress('ready', 100, 'Aplicação pronta!');
      await this.delay(500);
      
      this.finishLoading();
      
    } catch (error) {
      console.error('❌ Erro durante carregamento:', error);
      this.showError(error);
    }
  }

  async initializeCache() {
    console.log('💾 Inicializando cache...');
    try {
      if (cacheManager && cacheManager.init) {
        await cacheManager.init();
        this.updateProgress('cache', 15, 'Cache inicializado');
      } else {
        this.updateProgress('cache', 15, 'Cache não disponível');
      }
    } catch (error) {
      console.warn('⚠️ Erro no cache, continuando:', error);
      this.updateProgress('cache', 15, 'Cache em modo simplificado');
    }
  }

  async loadBasicFiles() {
    console.log('📦 Carregando arquivos básicos...');
    // Simular carregamento de recursos básicos
    await this.delay(300);
    this.updateProgress('files', 35, 'Recursos carregados');
  }

  async loadAIModel() {
    console.log('🧠 Carregando modelo de IA...');
    
    try {
      // Interceptar fetch para medir progresso de download
      this.interceptFetch();
      
      // Precarregar modelo
      console.log('📥 Iniciando download do modelo...');
      this.updateProgress('ai', 45, 'Preparando modelo de IA...');
      
      // Importar dinamicamente para evitar erro de carregamento inicial
      const { removeBackground } = await import('@imgly/background-removal');
      
      this.updateProgress('ai', 60, 'Baixando modelo de IA...');
      
      // Carregar modelo de forma otimizada
      const modelConfig = {
        model: 'medium',
        debug: false,
        progress: (key, current, total) => {
          const percentage = Math.round((current / total) * 100);
          console.log(`📊 Progresso ${key}: ${percentage}%`);
          
          // Atualizar progresso de forma mais granular
          const baseProgress = 60;
          const maxProgress = 85;
          const currentProgress = baseProgress + (percentage * (maxProgress - baseProgress) / 100);
          
          this.updateProgress('ai', currentProgress, `Processando ${key}: ${percentage}%`);
        }
      };
      
      // Inicializar modelo com imagem dummy
      await removeBackground('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', modelConfig);
      
      // Modelo agora está COMPLETAMENTE inicializado e pronto para uso
      this.updateProgress('ai', 85, 'Modelo de IA carregado!');
      
      // Armazenar confirmação de que modelo está pronto
      window.modelReady = true;
      window.lastModelInit = Date.now();
      
      // Atualizar estado global
      if (globalState && globalState.setModelLoaded) {
        globalState.setModelLoaded();
      }
      
      console.log('✅ Modelo de IA totalmente carregado e pronto para uso!');
      
    } catch (error) {
      console.error('❌ Erro ao carregar modelo:', error);
      // Continuar mesmo com erro no modelo
      this.updateProgress('ai', 85, 'Modo offline (sem IA)');
    }
  }

  async initializeSystems() {
    console.log('⚙️ Inicializando sistemas...');
    
    try {
      // Inicializar estado global
      if (globalState && globalState.init) {
        globalState.init();
      }
      
      // Outros sistemas
      await this.delay(200);
      
      this.updateProgress('initialization', 95, 'Sistemas inicializados');
    } catch (error) {
      console.warn('⚠️ Erro nos sistemas, continuando:', error);
      this.updateProgress('initialization', 95, 'Sistemas em modo básico');
    }
  }

  interceptFetch() {
    // Código de interceptação de fetch para medir velocidade
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url] = args;
      
      if (typeof url === 'string' && (url.includes('.onnx') || url.includes('model'))) {
        console.log('📥 Interceptando download de modelo:', url);
        
        const startTime = Date.now();
        this.speedTracker.downloads.set(url, {
          startTime,
          bytesLoaded: 0,
          lastTime: startTime,
          lastBytes: 0
        });
        
        const response = await originalFetch(...args);
        
        // Retornar response com reader personalizado
        return this.createProgressResponse(response, url);
      }
      
      return originalFetch(...args);
    };
  }

  createProgressResponse(response, url) {
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    let loaded = 0;
    const self = this;
    
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();
        
        function pump() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            loaded += value.byteLength;
            
            // Atualizar progresso
            self.updateDownloadProgress(url, loaded, total);
            
            controller.enqueue(value);
            return pump();
          });
        }
        
        return pump();
      }
    });
    
    return new Response(stream, {
      headers: response.headers
    });
  }

  updateDownloadProgress(url, loaded, total) {
    const tracker = this.speedTracker.downloads.get(url);
    if (!tracker) return;
    
    const now = Date.now();
    const timeDiff = now - tracker.lastTime;
    const bytesDiff = loaded - tracker.lastBytes;
    
    if (timeDiff > 100) { // Atualizar a cada 100ms
      const speed = (bytesDiff / timeDiff) * 1000; // bytes/s
      const speedKB = Math.round(speed / 1024); // KB/s
      
      this.speedTracker.currentDownloadSpeed = speedKB;
      
      // Atualizar UI
      const speedElement = document.getElementById('download-speed');
      if (speedElement) {
        speedElement.textContent = `${speedKB} KB/s`;
      }
      
      // Calcular ETA
      if (total > 0) {
        const remaining = total - loaded;
        const eta = remaining / speed;
        this.updateETA(eta);
      }
      
      tracker.lastTime = now;
      tracker.lastBytes = loaded;
    }
  }

  updateETA(seconds) {
    const etaElement = document.getElementById('eta-time');
    if (!etaElement) return;
    
    if (seconds < 60) {
      etaElement.textContent = `${Math.round(seconds)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      etaElement.textContent = `${minutes}m ${remainingSeconds}s`;
    }
  }

  updateProgress(stepId, percentage, status) {
    // Atualizar progresso geral
    this.totalProgress = percentage;
    
    // Atualizar barra de progresso principal
    const progressFill = document.getElementById('splash-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
    
    // Atualizar porcentagem
    const percentageElement = document.getElementById('splash-percentage');
    if (percentageElement) {
      percentageElement.textContent = `${Math.round(percentage)}%`;
    }
    
    // Atualizar status
    const statusElement = document.getElementById('splash-status');
    if (statusElement) {
      statusElement.textContent = status;
    }
    
    // Atualizar step atual
    const currentStepElement = document.getElementById('splash-current-step');
    if (currentStepElement) {
      const step = this.steps.find(s => s.id === stepId);
      if (step) {
        currentStepElement.textContent = step.text;
      }
    }
    
    // Atualizar step específico
    this.updateStepProgress(stepId, percentage);
    
    console.log(`📊 Progresso: ${stepId} - ${Math.round(percentage)}% - ${status}`);
  }

  updateStepProgress(stepId, percentage) {
    const stepElement = document.getElementById(`step-${stepId}`);
    if (!stepElement) return;
    
    // Remover classe active de todos os steps
    document.querySelectorAll('.splash-step').forEach(step => {
      step.classList.remove('active', 'completed');
    });
    
    // Marcar steps anteriores como completados
    const currentStepIndex = this.steps.findIndex(s => s.id === stepId);
    this.steps.forEach((step, index) => {
      const element = document.getElementById(`step-${step.id}`);
      if (!element) return;
      
      if (index < currentStepIndex) {
        element.classList.add('completed');
      } else if (index === currentStepIndex) {
        element.classList.add('active');
        
        // Atualizar progresso do step atual
        const progressBar = element.querySelector('.step-progress-fill');
        if (progressBar) {
          const stepProgress = percentage >= 100 ? 100 : (percentage - (currentStepIndex * 20));
          progressBar.style.width = `${Math.max(0, Math.min(100, stepProgress))}%`;
        }
      }
    });
  }

  showError(error) {
    const statusElement = document.getElementById('splash-status');
    if (statusElement) {
      statusElement.textContent = `❌ Erro: ${error.message}`;
      statusElement.style.color = '#ff6b6b';
    }
    
    // Ainda assim tentar continuar
    setTimeout(() => {
      console.log('⚠️ Continuando apesar do erro...');
      this.finishLoading();
    }, 2000);
  }

  async finishLoading() {
    console.log('✅ Finalizando splash screen...');
    
    try {
      // Marcar como completado no estado global
      if (globalState && globalState.setSplashCompleted) {
        globalState.setSplashCompleted();
      }
    } catch (error) {
      console.warn('⚠️ Erro marcando splash como completado:', error);
    }
    
    // Aguardar um pouco para mostrar o 100%
    await this.delay(800);
    
    // Esconder splash screen
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      splashScreen.classList.add('hidden');
      
      // Remover elemento após animação
      setTimeout(() => {
        splashScreen.remove();
      }, 500);
    }
    
    // Mostrar conteúdo principal
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
    }
    
    // Disparar evento de app pronto
    window.dispatchEvent(new CustomEvent('appReady'));
    
    console.log('🎉 Splash screen finalizado! App pronto para uso.');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Inicializar splash screen automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    checkAndInitSplash();
  });
} else {
  checkAndInitSplash();
}

// Função para verificar se splash deve ser executado
async function checkAndInitSplash() {
  console.log('🎬 Verificando splash screen...');
  
  // Sempre carregar dependências primeiro
  await loadDependencies();
  
  // REGRA 1: Verificar flag de skip splash MUITO recente (apenas 3 segundos)
  const skipSplash = sessionStorage.getItem('skipSplash');
  const skipTimestamp = sessionStorage.getItem('skipSplashTimestamp');
  
  if (skipSplash === 'true' && skipTimestamp) {
    const timeDiff = Date.now() - parseInt(skipTimestamp);
    
    if (timeDiff < 3000) { // Apenas 3 segundos
      console.log('⚡ Skip splash ativo, pulando...');
      cleanupSkipFlags();
      showMainContentDirectly();
      return;
    } else {
      cleanupSkipFlags();
    }
  }
  
  // REGRA 2: Se não há referrer OU é primeira visita, SEMPRE mostrar splash
  if (!document.referrer || isFirstVisit()) {
    console.log('🎬 Primeira visita - iniciando splash');
    new SplashManager();
    return;
  }
  
  // REGRA 3: Navegação interna - verificar se splash já foi completado
  const isInternalNav = document.referrer.startsWith(window.location.origin);
  
  if (isInternalNav && globalState && globalState.isSplashCompleted()) {
    console.log('⚡ Navegação interna - splash já completado');
    showMainContentDirectly();
    return;
  }
  
  // REGRA 4: Se modelo já está carregado em navegação interna, pular
  if (isInternalNav && window.modelReady) {
    console.log('⚡ Navegação interna - modelo pronto');
    
    if (globalState && globalState.setSplashCompleted) {
      globalState.setSplashCompleted();
    }
    
    showMainContentDirectly();
    return;
  }
  
  // REGRA 5: Em qualquer outro caso, mostrar splash
  console.log('🎬 Iniciando splash screen');
  new SplashManager();
}

// Função para verificar se é primeira visita
function isFirstVisit() {
  const hasVisited = sessionStorage.getItem('hasVisited');
  if (!hasVisited) {
    sessionStorage.setItem('hasVisited', 'true');
    return true;
  }
  return false;
}

// Função para limpar flags de skip
function cleanupSkipFlags() {
  sessionStorage.removeItem('skipSplash');
  sessionStorage.removeItem('skipSplashReason');
  sessionStorage.removeItem('skipSplashTimestamp');
}

// Função para mostrar conteúdo principal diretamente
function showMainContentDirectly() {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.display = 'block';
  }
  
  // Disparar evento de app pronto
  window.dispatchEvent(new CustomEvent('appReady'));
  
  console.log('⚡ Conteúdo principal exibido diretamente');
}