// Sistema de navegação inteligente para PWA
// Mantém cache entre páginas e evita recarregamento desnecessário

import { globalState } from './global-state.js';

class NavigationManager {
  constructor() {
    this.setupNavigationInterception();
    this.setupPageLoadOptimization();
    
    console.log('🚪 NavigationManager inicializado');
  }

  /**
   * Intercepta navegação entre páginas para otimizar
   */
  setupNavigationInterception() {
    // Interceptar cliques nos links de navegação
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && this.shouldOptimizeNavigation(link)) {
        this.optimizeNavigation(e, link);
      }
    });

    // Interceptar mudanças no histórico
    window.addEventListener('popstate', (e) => {
      this.handleHistoryNavigation(e);
    });
  }

  /**
   * Configurar otimizações de carregamento de página
   */
  setupPageLoadOptimization() {
    // Verificar se é retorno para página de início
    const currentPath = window.location.pathname;
    const referrer = document.referrer;
    
    if (currentPath === '/' && referrer.includes('sobre.html')) {
      console.log('🔄 Detectada navegação de volta à página inicial');
      this.optimizeReturnToHome();
    }

    // Atualizar estado global com página atual
    globalState.updateCurrentPage(currentPath);
  }

  /**
   * Verificar se deve otimizar navegação para este link
   */
  shouldOptimizeNavigation(link) {
    const href = link.getAttribute('href');
    
    // Apenas links internos
    if (!href || href.startsWith('http') || href.startsWith('//')) {
      return false;
    }

    // Links para páginas principais
    const optimizablePages = ['/', '/sobre.html', 'sobre.html'];
    return optimizablePages.includes(href);
  }

  /**
   * Otimizar navegação interceptada
   */
  optimizeNavigation(event, link) {
    const href = link.getAttribute('href');
    
    // Se está indo para home e app já foi inicializado, marcar para pular splash
    if (href === '/' && globalState.isSplashCompleted()) {
      console.log('⚡ Navegação para home com splash já completado');
      
      // Garantir que não vai mostrar splash novamente
      sessionStorage.setItem('skipSplash', 'true');
      sessionStorage.setItem('skipSplashReason', 'navigation-return');
      sessionStorage.setItem('skipSplashTimestamp', Date.now().toString());
    }
    
    // Se está indo para home e cache está pronto, preparar para carregamento rápido
    if (href === '/' && globalState.isCacheReady()) {
      console.log('⚡ Cache pronto, navegação otimizada para home');
      
      // Salvar flag para carregamento rápido
      sessionStorage.setItem('fastLoad', 'true');
      sessionStorage.setItem('fastLoadReason', 'cache-ready');
    }

    // Permitir navegação normal
    return true;
  }

  /**
   * Otimizar retorno à página inicial
   */
  optimizeReturnToHome() {
    const stats = globalState.getStats();
    
    if (globalState.isCacheReady()) {
      console.log('✅ Cache disponível para carregamento rápido:', stats);
      
      // Sinalizar para splash manager pular inicialização pesada
      sessionStorage.setItem('fastLoad', 'true');
      sessionStorage.setItem('fastLoadSource', 'navigation-return');
      
      // Mostrar indicador visual de carregamento rápido
      this.showFastLoadIndicator();
    }
  }

  /**
   * Lidar com navegação via histórico (botão voltar/avançar)
   */
  handleHistoryNavigation(event) {
    console.log('🔙 Navegação via histórico detectada:', event.state);
    
    // Se voltando para home com cache pronto
    if (window.location.pathname === '/' && globalState.isCacheReady()) {
      sessionStorage.setItem('fastLoad', 'true');
      sessionStorage.setItem('fastLoadSource', 'history-back');
    }
  }

  /**
   * Mostrar indicador de carregamento rápido
   */
  showFastLoadIndicator() {
    // Criar indicador discreto
    const indicator = document.createElement('div');
    indicator.id = 'fast-load-indicator';
    indicator.innerHTML = '⚡ Carregamento otimizado';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #28a745;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    
    document.body.appendChild(indicator);
    
    // Animar entrada
    setTimeout(() => {
      indicator.style.opacity = '1';
    }, 100);
    
    // Remover após tempo
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }, 2000);
  }

  /**
   * Verificar se deve usar carregamento rápido
   */
  static shouldUseFastLoad() {
    const fastLoad = sessionStorage.getItem('fastLoad');
    const reason = sessionStorage.getItem('fastLoadReason') || 
                  sessionStorage.getItem('fastLoadSource');
    
    if (fastLoad === 'true') {
      console.log('⚡ Fast load ativado:', reason);
      
      // Limpar flags para próxima navegação
      sessionStorage.removeItem('fastLoad');
      sessionStorage.removeItem('fastLoadReason');
      sessionStorage.removeItem('fastLoadSource');
      
      return true;
    }
    
    return false;
  }

  /**
   * Pré-carregar recursos da próxima página
   */
  preloadNextPage(href) {
    // Apenas se cache estiver pronto e connection for boa
    if (!globalState.isCacheReady() || !navigator.connection) {
      return;
    }

    // Verificar tipo de conexão
    const connection = navigator.connection;
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return; // Não pré-carregar em conexões lentas
    }

    console.log('🚀 Pré-carregando recursos para:', href);
    
    // Criar link prefetch
    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = href;
    document.head.appendChild(prefetch);
  }
}

// Instanciar apenas uma vez
let navigationManager = null;

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!navigationManager) {
      navigationManager = new NavigationManager();
    }
  });
} else {
  // DOM já está pronto
  if (!navigationManager) {
    navigationManager = new NavigationManager();
  }
}

// Exportar para uso em outros módulos
export { NavigationManager, navigationManager };

// Disponibilizar globalmente
window.navigationManager = navigationManager;
