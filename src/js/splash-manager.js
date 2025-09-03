// Splash Screen Manager - Tela de carregamento inicial (Produção)
let cacheManager = null;
let globalState = null;

async function loadDependencies() {
  try {
    const cacheModule = await import('./cache-manager.js');
    cacheManager = cacheModule.cacheManager;
    
    const stateModule = await import('./global-state.js'); 
    globalState = stateModule.globalState;
  } catch (error) {
    // Falha silenciosa
  }
}

window.preloadedBackgroundRemover = null;

export class SplashManager {
  constructor() {
    this.isLoading = true;
    this.currentStep = 0;
    this.totalProgress = 0;
    this.shouldUseFastLoad = false;
    
    this.speedTracker = {
      downloads: new Map(),
      cacheReads: [],
      cacheWrites: [],
      currentDownloadSpeed: 0,
      currentReadSpeed: 0,
      currentWriteSpeed: 0,
      eta: null
    };
    
    this.steps = [
      { id: 'cache', icon: '💾', text: 'Verificando cache...', size: '', progress: 0 },
      { id: 'assets', icon: '📦', text: 'Carregando arquivos...', size: '', progress: 0 },
      { id: 'ai-model', icon: '🧠', text: 'Carregando modelo de IA...', size: '', progress: 0 },
      { id: 'systems', icon: '⚙️', text: 'Iniciando sistemas...', size: '', progress: 0 }
    ];

    this.downloadInterceptor = null;
  }

  async start() {
    await loadDependencies();
    
    if (this.checkFastLoad()) {
      this.executeFastLoad();
      return;
    }
    
    this.createSplashScreen();
    this.executeNormalLoad();
  }

  checkFastLoad() {
    try {
      const fastLoad = sessionStorage.getItem('fastLoad');
      const reason = sessionStorage.getItem('fastLoadReason') || 
                    sessionStorage.getItem('fastLoadSource');
      
      if (fastLoad === 'true' && globalState && globalState.isCacheReady()) {
        sessionStorage.removeItem('fastLoad');
        sessionStorage.removeItem('fastLoadReason');
        sessionStorage.removeItem('fastLoadSource');
        return true;
      }
    } catch (error) {
      // Falha silenciosa
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

    const splashElement = document.createElement('div');
    splashElement.innerHTML = splashHTML;
    document.body.insertBefore(splashElement.firstElementChild, document.body.firstChild);
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

  executeFastLoad() {
    this.updateProgress('systems', 100, 'App já carregado - iniciando...');
    this.finalizeSplash();
  }

  async executeNormalLoad() {
    try {
      await this.initializeCache();
      await this.loadBasicAssets();
      await this.loadAIModel();
      await this.initializeSystems();
      this.finalizeSplash();
    } catch (error) {
      this.updateProgress('', 100, 'Continuando apesar do erro...');
      setTimeout(() => this.finalizeSplash(), 1000);
    }
  }

  async initializeCache() {
    try {
      if (cacheManager) {
        await cacheManager.init();
      }
    } catch (error) {
      // Falha silenciosa
    }
    this.updateProgress('cache', 100, 'Cache inicializado');
  }

  async loadBasicAssets() {
    this.updateProgress('assets', 50, 'Carregando arquivos básicos...');
    await new Promise(resolve => setTimeout(resolve, 300));
    this.updateProgress('assets', 100, 'Arquivos carregados');
  }

  async loadAIModel() {
    this.updateProgress('ai-model', 0, 'Carregando modelo de IA...');
    
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      
      this.setupDownloadInterception();
      
      const testImage = new ImageData(new Uint8ClampedArray(4), 1, 1);
      window.preloadedBackgroundRemover = await removeBackground(testImage, {
        progress: (key, current, total) => {
          const percentage = (current / total) * 100;
          this.updateProgress('ai-model', percentage, `${key}: ${Math.round(percentage)}%`);
        }
      });
      
      this.updateProgress('ai-model', 100, 'Modelo carregado com sucesso!');
    } catch (error) {
      this.updateProgress('ai-model', 100, 'Erro no modelo, continuando...');
    }
  }

  setupDownloadInterception() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = args[0]?.toString() || '';
      
      if (url.includes('onnx') || url.includes('model')) {
        // Download de modelo detectado
      }
      
      return response;
    };
  }

  async initializeSystems() {
    this.updateProgress('systems', 50, 'Inicializando sistemas...');
    await new Promise(resolve => setTimeout(resolve, 200));
    this.updateProgress('systems', 100, 'Sistemas prontos!');
  }

  updateProgress(stepId, percentage, status) {
    if (stepId) {
      const step = this.steps.find(s => s.id === stepId);
      if (step) {
        step.progress = percentage;
        
        const stepElement = document.getElementById(`step-${stepId}`);
        if (stepElement) {
          const progressBar = stepElement.querySelector('.step-progress-fill');
          if (progressBar) {
            progressBar.style.width = `${percentage}%`;
          }
        }
      }
      
      this.currentStep = Math.max(this.currentStep, this.steps.findIndex(s => s.id === stepId));
    }
    
    const avgProgress = this.steps.reduce((sum, step) => sum + step.progress, 0) / this.steps.length;
    this.totalProgress = avgProgress;
    
    const progressBar = document.getElementById('splash-progress-fill');
    const percentageElement = document.getElementById('splash-percentage');
    const statusElement = document.getElementById('splash-status');
    
    if (progressBar) progressBar.style.width = `${this.totalProgress}%`;
    if (percentageElement) percentageElement.textContent = `${Math.round(this.totalProgress)}%`;
    if (statusElement) statusElement.textContent = status;
  }

  finalizeSplash() {
    if (globalState) {
      try {
        globalState.markSplashCompleted();
      } catch (error) {
        // Falha silenciosa
      }
    }
    
    const splashElement = document.getElementById('splash-screen');
    if (splashElement) {
      splashElement.style.transition = 'opacity 0.8s ease-out';
      splashElement.style.opacity = '0';
      
      setTimeout(() => {
        if (splashElement.parentNode) {
          splashElement.parentNode.removeChild(splashElement);
        }
        this.showMainContent();
      }, 800);
    } else {
      this.showMainContent();
    }
  }

  showMainContent() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
      mainContent.style.opacity = '1';
    }
    
    window.dispatchEvent(new CustomEvent('appReady'));
    this.isLoading = false;
  }
}

async function checkSplashScreen() {
  await loadDependencies();
  
  const splashElement = document.getElementById('splash-screen');
  if (splashElement) {
    return;
  }
  
  const isFirstVisit = !globalState || !globalState.isSplashCompleted();
  
  if (isFirstVisit) {
    const splashManager = new SplashManager();
    await splashManager.start();
  } else {
    showMainContentDirectly();
  }
}

function showMainContentDirectly() {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.display = 'block';
    mainContent.style.opacity = '1';
  }
  
  window.dispatchEvent(new CustomEvent('appReady'));
}

export async function initSplashScreen() {
  const splashManager = new SplashManager();
  await splashManager.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkSplashScreen);
} else {
  checkSplashScreen();
}
