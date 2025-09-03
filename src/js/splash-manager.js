// Splash Manager - Versão Simplificada
import { globalState } from './global-state.js';

export class SplashManager {
  constructor() {
    this.isLoading = true;
    this.currentStep = 0;
    this.steps = [
      { id: 'cache', icon: '💾', text: 'Verificando cache...' },
      { id: 'assets', icon: '📦', text: 'Carregando arquivos...' },
      { id: 'ai-model', icon: '🧠', text: 'Carregando modelo de IA...' },
      { id: 'systems', icon: '⚙️', text: 'Iniciando sistemas...' }
    ];
  }

  createSplashHTML() {
    const splashHTML = `
      <div id="splash-screen" class="splash-screen">
        <div class="splash-content">
          <div class="splash-logo">🎨</div>
          <h1 class="splash-title">RemoveBG</h1>
          <p class="splash-subtitle">Remoção de Fundo com IA</p>
          
          <div class="splash-progress">
            <div class="splash-progress-bar">
              <div class="progress-bar splash-progress-fill" style="width: 0%"></div>
            </div>
          </div>
          
          <div class="loading-text splash-status">Iniciando...</div>
          
          <div class="splash-loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', splashHTML);
  }

  async start() {
    console.log('🚀 Iniciando splash screen simplificado...');
    
    // Criar o HTML do splash
    this.createSplashHTML();
    
    // Esconder conteúdo principal
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'none';
    }
    
    try {
      // Simular carregamento básico
      for (let i = 0; i < this.steps.length; i++) {
        this.updateStep(i);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      this.complete();
      
    } catch (error) {
      console.error('Erro no splash:', error);
      this.complete(); // Mesmo com erro, continuar
    }
  }

  updateStep(stepIndex) {
    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];
    
    console.log(`${step.icon} ${step.text}`);
    
    // Atualizar UI se elementos existirem
    const progressBar = document.querySelector('.splash-progress-fill');
    const loadingText = document.querySelector('.splash-status');
    
    if (progressBar) {
      const progress = ((stepIndex + 1) / this.steps.length) * 100;
      progressBar.style.width = `${progress}%`;
    }
    
    if (loadingText) {
      loadingText.textContent = step.text;
    }
  }

  complete() {
    console.log('✅ Splash concluído');
    
    this.isLoading = false;
    globalState.setSplashCompleted(true);
    
    // Esconder splash screen com animação
    const splashElement = document.getElementById('splash-screen');
    if (splashElement) {
      splashElement.style.transition = 'opacity 0.5s ease-out';
      splashElement.style.opacity = '0';
      
      setTimeout(() => {
        splashElement.remove();
      }, 500);
    }
    
    // Mostrar aplicação principal
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
    }
    
    // Disparar evento de app pronto
    window.dispatchEvent(new CustomEvent('appReady'));
  }

  isComplete() {
    return !this.isLoading;
  }
}

// Instância global
export const splashManager = new SplashManager();

// Auto-inicializar splash se for primeira visita
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎬 DOMContentLoaded - verificando splash...');
  
  // Verificar se é primeira visita ou se splash deve ser exibido
  const isFirstVisit = !globalState.isSplashCompleted();
  console.log('🔍 Primeira visita?', isFirstVisit);
  console.log('🔍 Splash completado?', globalState.isSplashCompleted());
  
  if (isFirstVisit) {
    console.log('🎬 Primeira visita detectada - iniciando splash');
    await splashManager.start();
  } else {
    console.log('⚡ Splash já foi exibido - carregamento rápido');
    // Mostrar conteúdo imediatamente
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
    }
    window.dispatchEvent(new CustomEvent('appReady'));
  }
});

// Função global para resetar splash (para testing)
window.resetSplash = () => {
  console.log('🔄 Resetando splash...');
  globalState.setSplashCompleted(false);
  location.reload();
};
