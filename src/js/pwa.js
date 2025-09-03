// PWA Manager - Gerenciamento avançado de PWA com cache inteligente
class AdvancedPWAManager {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.cacheStats = { hits: 0, misses: 0, totalSize: 0 };
    this.init();
  }

  async init() {
    const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    if ('serviceWorker' in navigator) {
      try {
        // Desregistrar service worker antigo se existir
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.scope.includes('sw.js')) {
            await registration.unregister();
            console.log('[PWA] Service Worker antigo desregistrado');
          }
        }

        // Registrar novo service worker avançado
        this.swRegistration = await navigator.serviceWorker.register('/src/js/sw-advanced.js', {
          scope: '/'
        });
        
        console.log('✅ [PWA] Service Worker avançado registrado:', this.swRegistration.scope);
        
        // Configurar listeners
        this.setupServiceWorkerListeners();
        
      } catch (error) {
        console.warn('⚠️ [PWA] Erro ao registrar Service Worker:', error);
      }
    }

    this.setupNetworkEvents();
    this.setupInstallPrompt();
    this.showPWAStatus();
  }

  setupServiceWorkerListeners() {
    // Verificar atualizações
    this.swRegistration.addEventListener('updatefound', () => {
      const newWorker = this.swRegistration.installing;
      console.log('🔄 [PWA] Nova versão encontrada');
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.showUpdateAvailable();
        }
      });
    });

    // Escutar mensagens do service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });

    // Verificar se já está ativo
    if (navigator.serviceWorker.controller) {
      console.log('✅ [PWA] Página controlada pelo Service Worker');
    }
  }

  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'AI_CACHE_HIT':
        this.cacheStats.hits++;
        console.log('🚀 Cache hit:', data.url.split('/').pop());
        this.updateCacheIndicator('hit');
        break;
        
      case 'AI_DOWNLOAD_START':
        this.cacheStats.misses++;
        console.log('📥 Baixando:', data.url.split('/').pop());
        this.updateCacheIndicator('downloading');
        break;
        
      case 'AI_CACHE_STORED':
        console.log('💾 Armazenado:', data.url.split('/').pop());
        this.updateCacheIndicator('stored');
        
        // Atualizar estatísticas de tamanho se disponível
        if (data.size) {
          this.cacheStats.totalSize += parseInt(data.size) || 0;
        }
        break;
        
      case 'AI_DOWNLOAD_ERROR':
        console.warn('❌ Erro no download:', data.url, data.error);
        this.showErrorNotification(data.error);
        break;
    }
  }

  updateCacheIndicator(type) {
    // Criar ou atualizar indicador visual de cache
    let indicator = document.getElementById('cache-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'cache-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        z-index: 9999;
        transition: all 0.3s ease;
        pointer-events: none;
        opacity: 0;
      `;
      document.body.appendChild(indicator);
    }

    // Definir estilo baseado no tipo
    switch (type) {
      case 'hit':
        indicator.style.background = '#28a745';
        indicator.style.color = 'white';
        indicator.textContent = '⚡ Cache';
        break;
        
      case 'downloading':
        indicator.style.background = '#ffc107';
        indicator.style.color = '#000';
        indicator.textContent = '📥 Download';
        break;
        
      case 'stored':
        indicator.style.background = '#17a2b8';
        indicator.style.color = 'white';
        indicator.textContent = '💾 Armazenado';
        break;
    }

    // Mostrar e ocultar
    indicator.style.opacity = '1';
    setTimeout(() => {
      if (indicator) {
        indicator.style.opacity = '0';
      }
    }, 2000);
  }

  showUpdateAvailable() {
    // Remover banner anterior se existir
    const oldBanner = document.getElementById('update-banner');
    if (oldBanner) oldBanner.remove();

    const updateBanner = document.createElement('div');
    updateBanner.id = 'update-banner';
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(90deg, #007bff, #0056b3);
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 2px 15px rgba(0,0,0,0.3);
        animation: slideDown 0.5s ease;
      ">
        <div style="max-width: 800px; margin: 0 auto;">
          🚀 <strong>Nova versão disponível!</strong> Melhorias no sistema de cache.
          <div style="margin-top: 10px;">
            <button onclick="window.pwaManager.updateApp()" style="
              background: white;
              color: #007bff;
              border: none;
              padding: 8px 16px;
              margin: 0 5px;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              Atualizar Agora
            </button>
            <button onclick="this.closest('#update-banner').remove()" style="
              background: transparent;
              color: white;
              border: 2px solid white;
              padding: 8px 16px;
              margin: 0 5px;
              border-radius: 5px;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='white'; this.style.color='#007bff'" onmouseout="this.style.background='transparent'; this.style.color='white'">
              Mais Tarde
            </button>
          </div>
        </div>
      </div>
      <style>
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      </style>
    `;
    
    document.body.appendChild(updateBanner);
  }

  updateApp() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      
      // Mostrar loading
      const banner = document.getElementById('update-banner');
      if (banner) {
        banner.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #28a745;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
          ">
            🔄 Atualizando aplicação...
          </div>
        `;
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  setupNetworkEvents() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNetworkStatus('🌐 Conectado', '#28a745');
      console.log('[PWA] Online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNetworkStatus('📵 Offline - Usando cache local', '#dc3545');
      console.log('[PWA] Offline');
    });
  }

  showNetworkStatus(message, color) {
    const status = document.createElement('div');
    status.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: bold;
      z-index: 9999;
      animation: fadeInOut 3s ease;
    `;
    status.textContent = message;
    
    // Adicionar animação
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(status);
    
    setTimeout(() => {
      if (status.parentNode) {
        status.remove();
      }
    }, 3000);
  }

  setupInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallButton(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App instalado');
      this.hideInstallButton();
      this.showNetworkStatus('📱 App instalado com sucesso!', '#28a745');
    });
  }

  showInstallButton(deferredPrompt) {
    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.innerHTML = '📱 Instalar App';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(45deg, #007bff, #0056b3);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      transition: transform 0.2s;
    `;

    installButton.addEventListener('mouseenter', () => {
      installButton.style.transform = 'scale(1.05)';
    });

    installButton.addEventListener('mouseleave', () => {
      installButton.style.transform = 'scale(1)';
    });

    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('[PWA] Usuário aceitou instalar');
        } else {
          console.log('[PWA] Usuário rejeitou instalar');
        }
        
        deferredPrompt = null;
        this.hideInstallButton();
      }
    });

    document.body.appendChild(installButton);
  }

  hideInstallButton() {
    const button = document.getElementById('install-button');
    if (button) {
      button.remove();
    }
  }

  showPWAStatus() {
    // Verificar se está instalado como PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true;

    if (isInstalled) {
      console.log('✅ [PWA] Executando como app instalado');
    } else {
      console.log('🌐 [PWA] Executando no navegador');
    }
  }

  showErrorNotification(error) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #dc3545;
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 400px;
      text-align: center;
    `;
    
    notification.innerHTML = `
      <div style="margin-bottom: 15px;">❌ <strong>Erro de Conexão</strong></div>
      <div style="margin-bottom: 15px; opacity: 0.9;">${error}</div>
      <button onclick="this.closest('div').remove()" style="
        background: white;
        color: #dc3545;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      ">OK</button>
    `;
    
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Métodos públicos para interação externa
  async getCacheStats() {
    if (navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.stats);
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATS' },
          [messageChannel.port2]
        );
      });
    }
    return { ai: 0, static: 0, dynamic: 0, total: 0 };
  }

  async clearCache() {
    if (navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = () => {
          this.showNetworkStatus('🗑️ Cache limpo com sucesso', '#28a745');
          resolve(true);
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_ALL_CACHE' },
          [messageChannel.port2]
        );
      });
    }
    return false;
  }
}

// Inicializar PWA Manager
window.pwaManager = new AdvancedPWAManager();

// Expor globalmente para debug
window.PWA_DEBUG = () => {
  console.log('📊 PWA Debug Info:', {
    registration: window.pwaManager.swRegistration,
    isOnline: window.pwaManager.isOnline,
    cacheStats: window.pwaManager.cacheStats,
    controller: navigator.serviceWorker.controller
  });
};
