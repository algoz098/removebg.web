// Sistema de Estado Global Compartilhado para PWA (Produção)
class GlobalStateManager {
  constructor() {
    this.storageKey = 'removebg_global_state';
    this.sessionKey = 'removebg_session_state';
    this.state = this.loadState();
    this.setupCrossPageSync();
  }

  loadState() {
    try {
      const persistentState = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      const sessionState = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
      
      return {
        cache: {
          isInitialized: persistentState.cache?.isInitialized || false,
          isModelLoaded: persistentState.cache?.isModelLoaded || false,
          lastModelInit: persistentState.cache?.lastModelInit || null,
          cacheStats: persistentState.cache?.cacheStats || { hits: 0, misses: 0, totalSize: 0 },
          resourcesReady: persistentState.cache?.resourcesReady || false,
          lastCacheCheck: persistentState.cache?.lastCacheCheck || null
        },
        
        session: {
          splashCompleted: sessionState.splashCompleted || false,
          appInitialized: sessionState.appInitialized || false,
          currentPage: sessionState.currentPage || window.location.pathname,
          navigationCount: (sessionState.navigationCount || 0) + 1,
          lastPageLoad: Date.now(),
          sessionId: sessionState.sessionId || this.generateSessionId(),
          splashTimestamp: sessionState.splashTimestamp || null
        },
        
        pwa: {
          isInstalled: persistentState.pwa?.isInstalled || false,
          swRegistered: persistentState.pwa?.swRegistered || false,
          lastSwUpdate: persistentState.pwa?.lastSwUpdate || null
        }
      };
    } catch (error) {
      return this.getDefaultState();
    }
  }

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

  saveState() {
    try {
      const persistentData = {
        cache: this.state.cache,
        pwa: this.state.pwa,
        lastSaved: Date.now()
      };
      
      const sessionData = {
        ...this.state.session,
        lastSaved: Date.now()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(persistentData));
      sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
      
      this.broadcastStateChange();
    } catch (error) {
      // Falha silenciosa
    }
  }

  setupCrossPageSync() {
    try {
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey && e.newValue) {
          // Estado sincronizado de outra aba
        }
      });
      
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel('removebg_state');
        this.channel.onmessage = (event) => {
          if (event.data.type === 'state_update') {
            // Estado atualizado via broadcast
          }
        };
      }
    } catch (error) {
      // Falha silenciosa
    }
  }

  broadcastStateChange() {
    try {
      if (this.channel) {
        this.channel.postMessage({
          type: 'state_update',
          timestamp: Date.now(),
          state: this.state
        });
      }
    } catch (error) {
      // Falha silenciosa
    }
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  markCacheReady() {
    this.state.cache.isInitialized = true;
    this.state.cache.resourcesReady = true;
    this.state.cache.lastCacheCheck = Date.now();
    this.saveState();
  }

  isCacheReady() {
    const now = Date.now();
    const lastCheck = this.state.cache.lastCacheCheck || 0;
    const maxAge = 1000 * 60 * 60; // 1 hora
    
    if (this.state.cache.resourcesReady && (now - lastCheck) < maxAge) {
      return true;
    } else {
      return false;
    }
  }

  markSplashCompleted() {
    this.state.session.splashCompleted = true;
    this.state.session.splashTimestamp = Date.now();
    this.saveState();
  }

  isSplashCompleted() {
    return this.state.session.splashCompleted === true;
  }

  updateNavigation(page) {
    this.state.session.currentPage = page;
    this.state.session.navigationCount += 1;
    this.saveState();
  }

  getStats() {
    return {
      cache: this.state.cache,
      session: {
        ...this.state.session,
        sessionAge: Date.now() - this.state.session.lastPageLoad
      },
      pwa: this.state.pwa
    };
  }

  resetState() {
    this.state = this.getDefaultState();
    this.saveState();
  }

  markModelLoaded() {
    this.state.cache.isModelLoaded = true;
    this.state.cache.lastModelInit = Date.now();
    this.saveState();
  }

  isModelLoaded() {
    const now = Date.now();
    const lastInit = this.state.cache.lastModelInit || 0;
    const maxAge = 1000 * 60 * 60 * 24; // 24 horas
    
    return this.state.cache.isModelLoaded && (now - lastInit) < maxAge;
  }

  updateCacheStats(stats) {
    this.state.cache.cacheStats = { ...this.state.cache.cacheStats, ...stats };
    this.saveState();
  }

  markPWAInstalled() {
    this.state.pwa.isInstalled = true;
    this.saveState();
  }

  markSWRegistered() {
    this.state.pwa.swRegistered = true;
    this.state.pwa.lastSwUpdate = Date.now();
    this.saveState();
  }
}

export const globalState = new GlobalStateManager();
