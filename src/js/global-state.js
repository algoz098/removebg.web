// Sistema de Estado Global Compartilhado para PWA
// Mantém cache e estado inicializado entre navegação de páginas

class GlobalStateManager {
  constructor() {
    this.storageKey = 'removebg_global_state';
    this.sessionKey = 'removebg_session_state';
    this.state = this.loadState();
    
    // Configurar listeners de sincronização entre abas/páginas
    this.setupCrossPageSync();
    
    console.log('🌍 GlobalStateManager inicializado:', this.state);
  }

  /**
   * Carrega estado do localStorage e sessionStorage
   */
  loadState() {
    try {
      // Estado persistente (localStorage)
      const persistentState = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      
      // Estado da sessão (sessionStorage)  
      const sessionState = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
      
      return {
        // Cache e modelos (persistente)
        cache: {
          isInitialized: persistentState.cache?.isInitialized || false,
          isModelLoaded: persistentState.cache?.isModelLoaded || false,
          lastModelInit: persistentState.cache?.lastModelInit || null,
          cacheStats: persistentState.cache?.cacheStats || { hits: 0, misses: 0, totalSize: 0 },
          resourcesReady: persistentState.cache?.resourcesReady || false,
          lastCacheCheck: persistentState.cache?.lastCacheCheck || null
        },
        
        // Estado da sessão atual (mais robusto)
        session: {
          splashCompleted: sessionState.splashCompleted || false,
          appInitialized: sessionState.appInitialized || false,
          currentPage: sessionState.currentPage || window.location.pathname,
          navigationCount: (sessionState.navigationCount || 0) + 1,
          lastPageLoad: Date.now(),
          sessionId: sessionState.sessionId || this.generateSessionId(),
          splashTimestamp: sessionState.splashTimestamp || null
        },
        
        // PWA status
        pwa: {
          isInstalled: persistentState.pwa?.isInstalled || false,
          swRegistered: persistentState.pwa?.swRegistered || false,
          lastSwUpdate: persistentState.pwa?.lastSwUpdate || null
        }
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar estado global:', error);
      return this.getDefaultState();
    }
  }

  /**
   * Estado padrão quando não há dados salvos
   */
  getDefaultState() {
    return {
      cache: {
        isInitialized: false,
        isModelLoaded: false,
        lastModelInit: null,
        cacheStats: { hits: 0, misses: 0, totalSize: 0 },
        resourcesReady: false,
        lastCacheCheck: null
      },
      session: {
        splashCompleted: false,
        appInitialized: false,
        currentPage: window.location.pathname,
        navigationCount: 1,
        lastPageLoad: Date.now()
      },
      pwa: {
        isInstalled: false,
        swRegistered: false,
        lastSwUpdate: null
      }
    };
  }

  /**
   * Salva estado nos storages apropriados
   */
  saveState() {
    try {
      // Estado persistente
      const persistentData = {
        cache: this.state.cache,
        pwa: this.state.pwa,
        lastSaved: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(persistentData));
      
      // Estado da sessão
      const sessionData = {
        ...this.state.session,
        lastSaved: Date.now()
      };
      sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
      
      // Notificar outras abas/páginas sobre mudança
      this.broadcastStateChange();
      
    } catch (error) {
      console.warn('⚠️ Erro ao salvar estado global:', error);
    }
  }

  /**
   * Configurar sincronização entre páginas/abas
   */
  setupCrossPageSync() {
    // Escutar mudanças no localStorage (outras abas)
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        console.log('🔄 Estado global sincronizado de outra aba');
        const newState = JSON.parse(e.newValue);
        this.state.cache = newState.cache;
        this.state.pwa = newState.pwa;
      }
    });

    // Escutar broadcast de mudanças
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'GLOBAL_STATE_CHANGE' && e.source !== window) {
        console.log('📡 Estado global atualizado via broadcast');
        this.loadState();
      }
    });

    // Auto-salvar periodicamente
    setInterval(() => {
      this.saveState();
    }, 10000); // A cada 10 segundos

    // Salvar ao fechar página
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }

  /**
   * Notificar outras páginas sobre mudança de estado
   */
  broadcastStateChange() {
    // Broadcast para outras abas do mesmo origin
    try {
      window.postMessage({ type: 'GLOBAL_STATE_CHANGE', timestamp: Date.now() }, '*');
    } catch (error) {
      console.warn('⚠️ Erro no broadcast:', error);
    }
  }

  /**
   * Métodos de acesso e modificação do estado do cache
   */
  
  // Verificar se cache está inicializado
  isCacheReady() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    const isRecent = this.state.cache.lastModelInit && 
                    (Date.now() - this.state.cache.lastModelInit) < maxAge;
    
    return this.state.cache.isInitialized && 
           this.state.cache.isModelLoaded && 
           this.state.cache.resourcesReady &&
           isRecent;
  }

  // Marcar cache como inicializado
  setCacheReady(cacheStats = null) {
    this.state.cache.isInitialized = true;
    this.state.cache.isModelLoaded = true;
    this.state.cache.resourcesReady = true;
    this.state.cache.lastModelInit = Date.now();
    this.state.cache.lastCacheCheck = Date.now();
    
    if (cacheStats) {
      this.state.cache.cacheStats = { ...this.state.cache.cacheStats, ...cacheStats };
    }
    
    this.saveState();
    console.log('✅ Cache marcado como pronto globalmente');
  }

  // Verificar se splash já foi completado nesta sessão
  isSplashCompleted() {
    const completed = this.state.session.splashCompleted;
    const timestamp = this.state.session.splashTimestamp;
    
    // Verificar se splash foi completado recentemente (últimos 30 minutos)
    if (completed && timestamp) {
      const timeDiff = Date.now() - timestamp;
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeDiff < thirtyMinutes) {
        console.log('✅ Splash ainda válido na sessão atual');
        return true;
      } else {
        console.log('⏰ Splash expirado, será executado novamente');
        this.state.session.splashCompleted = false;
        this.state.session.splashTimestamp = null;
        this.saveState();
        return false;
      }
    }
    
    return completed;
  }

  // Marcar splash como completado
  setSplashCompleted() {
    this.state.session.splashCompleted = true;
    this.state.session.appInitialized = true;
    this.state.session.splashTimestamp = Date.now();
    this.saveState();
    console.log('✅ Splash marcado como completado globalmente');
  }

  // Gerar ID único para sessão
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Atualizar página atual
  updateCurrentPage(path = window.location.pathname) {
    this.state.session.currentPage = path;
    this.state.session.lastPageLoad = Date.now();
    this.saveState();
  }

  // Obter estatísticas
  getStats() {
    return {
      ...this.state,
      cacheAge: this.state.cache.lastModelInit ? 
        Math.round((Date.now() - this.state.cache.lastModelInit) / 1000 / 60) : null,
      sessionDuration: Math.round((Date.now() - this.state.session.lastPageLoad) / 1000 / 60),
      shouldSkipCache: !this.isCacheReady()
    };
  }

  // Reset do estado (para debug)
  reset() {
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.sessionKey);
    this.state = this.getDefaultState();
    console.log('🔄 Estado global resetado');
    return this.state;
  }

  // Métodos para componentes específicos
  
  // Marcar modelo como carregado
  setModelLoaded(modelData = null) {
    this.state.cache.isModelLoaded = true;
    this.state.cache.lastModelInit = Date.now();
    
    // Salvar referência global do modelo
    if (modelData) {
      window.preloadedBackgroundRemover = modelData;
      window.modelReady = true;
      window.lastModelInit = Date.now();
    }
    
    this.saveState();
    console.log('🧠 Modelo marcado como carregado globalmente');
  }

  // Atualizar estatísticas do cache
  updateCacheStats(stats) {
    this.state.cache.cacheStats = { ...this.state.cache.cacheStats, ...stats };
    this.saveState();
  }

  // Verificar se deve pular inicialização
  shouldSkipInit() {
    return this.isCacheReady() && this.isSplashCompleted();
  }
}

// Instância global
const globalState = new GlobalStateManager();

// Exportar para uso em outros módulos
export { globalState, GlobalStateManager };

// Disponibilizar globalmente para debug
window.globalState = globalState;

// Log de debug
console.log('🌍 GlobalState carregado:', {
  cacheReady: globalState.isCacheReady(),
  splashCompleted: globalState.isSplashCompleted(),
  shouldSkipInit: globalState.shouldSkipInit(),
  stats: globalState.getStats()
});
