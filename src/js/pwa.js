// PWA Service Worker Registration and Management
class PWAManager {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    // Verificar se estamos em desenvolvimento
    const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    // Registrar Service Worker apenas em produção ou se explicitamente solicitado
    if ('serviceWorker' in navigator && (!isDev || localStorage.getItem('forceSW'))) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('[PWA] Service Worker registrado:', this.swRegistration);
        
        // Verificar atualizações
        this.swRegistration.addEventListener('updatefound', () => {
          this.handleUpdateFound();
        });

        // Verificar se já está controlado
        if (navigator.serviceWorker.controller) {
          console.log('[PWA] Página já controlada pelo SW');
        }

      } catch (error) {
        console.warn('[PWA] Erro ao registrar Service Worker (normal em dev):', error);
      }
    } else if (isDev) {
      console.log('[PWA] Service Worker desabilitado em desenvolvimento');
    }

    // Configurar eventos de rede
    this.setupNetworkEvents();
    
    // Configurar prompt de instalação apenas se não estivermos em dev
    if (!isDev) {
      this.setupInstallPrompt();
    }
    
    // Mostrar status da PWA
    this.showPWAStatus();
  }

  handleUpdateFound() {
    const newWorker = this.swRegistration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // Nova versão disponível
          this.showUpdateAvailable();
        } else {
          // App instalado pela primeira vez
          console.log('[PWA] App instalado e pronto para uso offline');
        }
      }
    });
  }

  showUpdateAvailable() {
    // Criar notificação de atualização
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div class="update-content">
        <span>🚀 Nova versão disponível!</span>
        <button id="update-btn" class="btn-primary">Atualizar</button>
        <button id="dismiss-update" class="btn-secondary">Depois</button>
      </div>
    `;
    
    document.body.appendChild(updateBanner);
    
    // Evento para atualizar
    document.getElementById('update-btn').addEventListener('click', () => {
      this.applyUpdate();
      updateBanner.remove();
    });
    
    // Evento para dispensar
    document.getElementById('dismiss-update').addEventListener('click', () => {
      updateBanner.remove();
    });
  }

  applyUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  setupNetworkEvents() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNetworkStatus('🟢 Conectado', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNetworkStatus('🔴 Offline - Usando cache', 'warning');
    });
  }

  showNetworkStatus(message, type) {
    const status = document.getElementById('status') || document.createElement('div');
    status.id = 'status';
    status.className = `status ${type}`;
    status.textContent = message;
    
    if (!document.getElementById('status')) {
      document.body.appendChild(status);
    }
    
    // Auto-remover após 3 segundos
    setTimeout(() => {
      status.remove();
    }, 3000);
  }

  setupInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevenir o prompt automático
      e.preventDefault();
      deferredPrompt = e;
      
      // Mostrar botão de instalação
      this.showInstallButton(deferredPrompt);
    });

    // Detectar quando app foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App foi instalado');
      this.hideInstallButton();
      this.showNetworkStatus('✅ App instalado com sucesso!', 'success');
    });
  }

  showInstallButton(deferredPrompt) {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Já está instalado
    }

    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
      <div class="install-content">
        <span>📱 Instalar RemoveBG no seu dispositivo?</span>
        <button id="install-btn" class="btn-primary">Instalar</button>
        <button id="dismiss-install" class="btn-secondary">Não</button>
      </div>
    `;
    
    document.body.appendChild(installBanner);
    
    // Evento para instalar
    document.getElementById('install-btn').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] Escolha do usuário:', outcome);
        deferredPrompt = null;
      }
      installBanner.remove();
    });
    
    // Evento para dispensar
    document.getElementById('dismiss-install').addEventListener('click', () => {
      installBanner.remove();
    });
  }

  hideInstallButton() {
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
      installBanner.remove();
    }
  }

  showPWAStatus() {
    // Verificar se está rodando como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true;
    
    if (isStandalone) {
      console.log('[PWA] Rodando como app instalado');
      document.body.classList.add('pwa-mode');
    } else {
      console.log('[PWA] Rodando no navegador');
    }
    
    // Mostrar status inicial da rede
    if (!this.isOnline) {
      this.showNetworkStatus('🔴 Offline - Usando cache', 'warning');
    }
  }

  // Métodos utilitários para cache
  async clearCache() {
    if (this.swRegistration) {
      const channel = new MessageChannel();
      
      return new Promise((resolve) => {
        channel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_CLEARED') {
            console.log('[PWA] Cache limpo');
            resolve();
          }
        };
        
        this.swRegistration.active.postMessage(
          { type: 'CLEAR_CACHE' },
          [channel.port2]
        );
      });
    }
  }

  async getVersion() {
    if (this.swRegistration) {
      const channel = new MessageChannel();
      
      return new Promise((resolve) => {
        channel.port1.onmessage = (event) => {
          if (event.data.type === 'VERSION') {
            resolve(event.data.version);
          }
        };
        
        this.swRegistration.active.postMessage(
          { type: 'GET_VERSION' },
          [channel.port2]
        );
      });
    }
  }
}

// Inicializar PWA Manager quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
  });
} else {
  window.pwaManager = new PWAManager();
}
