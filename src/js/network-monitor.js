// Monitor de Rede Global - Debug de Downloads
export class NetworkMonitor {
  constructor() {
    this.requests = [];
    this.isMonitoring = false;
    this.maxRequests = 100;
  }

  setupGlobalInterception() {
    // Interceptar todas as requests para debug
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options) => {
      const urlString = url?.toString() || '';
      const requestInfo = {
        url: urlString,
        method: options?.method || 'GET',
        timestamp: Date.now(),
        type: this.getRequestType(urlString),
        source: 'fetch'
      };

      if (this.isMonitoring) {
        console.log(`📡 NETWORK REQUEST: ${requestInfo.type} | ${requestInfo.url}`);
        this.requests.push(requestInfo);
      }

      // Executar request original
      const response = await originalFetch(url, options);

      // Log da resposta
      if (this.isMonitoring) {
        const responseInfo = {
          ...requestInfo,
          status: response.status,
          contentType: response.headers.get('Content-Type'),
          size: response.headers.get('Content-Length')
        };
        console.log(`📡 RESPONSE: ${responseInfo.status} | ${responseInfo.size} bytes | ${responseInfo.url}`);
      }

      // Mostrar alerta visual para recursos importantes
      if (this.isAIResource(urlString)) {
        this.showNetworkAlert(urlString);
      }

      return response;
    };

    console.log('📡 Monitor de rede ativo');
  }

  isAIResource(url) {
    const urlString = url?.toString() || '';
    const aiPatterns = [
      'staticimgly.com',
      'background-removal-data',
      '.onnx',
      '.wasm',
      '.bin',
      'ort-wasm'
    ];
    return aiPatterns.some(pattern => urlString.includes(pattern));
  }

  getRequestType(url) {
    const urlString = url?.toString() || '';
    if (this.isAIResource(urlString)) return 'AI_RESOURCE';
    if (urlString.includes('vite')) return 'DEV_SERVER';
    if (urlString.includes('.js')) return 'JAVASCRIPT';
    if (urlString.includes('.css')) return 'STYLESHEET';
    if (urlString.includes('.png') || urlString.includes('.jpg') || urlString.includes('.jpeg')) return 'IMAGE';
    return 'OTHER';
  }

  showNetworkAlert(url) {
    // Criar alerta visual temporário
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0, 123, 255, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 10000;
      font-size: 12px;
      max-width: 300px;
      word-break: break-all;
      transition: opacity 0.3s ease;
    `;
    
    const fileName = url.split('/').pop() || 'recurso';
    alert.textContent = `📥 Baixando: ${fileName}`;
    
    document.body.appendChild(alert);
    
    // Remover após 3 segundos
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      }, 300);
    }, 3000);
  }

  startMonitoring() {
    this.isMonitoring = true;
    console.log('📡 Monitoramento de rede iniciado');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('📡 Monitoramento de rede parado');
  }

  getReport() {
    return {
      totalRequests: this.requests.length,
      aiRequests: this.requests.filter(r => r.type === 'AI_RESOURCE'),
      jsRequests: this.requests.filter(r => r.type === 'JAVASCRIPT'),
      cssRequests: this.requests.filter(r => r.type === 'STYLESHEET'),
      imageRequests: this.requests.filter(r => r.type === 'IMAGE'),
      otherRequests: this.requests.filter(r => r.type === 'OTHER'),
      requests: this.requests
    };
  }

  logReport() {
    const report = this.getReport();
    console.log('📊 NETWORK REPORT:', report);
    return report;
  }
}

// Instância global
window.networkMonitor = new NetworkMonitor();

// Auto-inicializar quando app estiver pronto
window.addEventListener('appReady', () => {
  setTimeout(() => {
    window.networkMonitor.startMonitoring();
    console.log('🔍 Monitor de rede ativado após splash');
  }, 1000);
}); {
    this.requests = [];
    this.isMonitoring = false;
    this.setupGlobalInterception();
  }

  setupGlobalInterception() {
    // Interceptar todas as requests para debug
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options) => {
      const requestInfo = {
        url: url.toString(),
        method: options?.method || 'GET',
        timestamp: Date.now(),
        type: this.getRequestType(url),
        source: 'fetch'
      };

      if (this.isMonitoring) {
        console.log(`📡 NETWORK REQUEST: ${requestInfo.type} | ${requestInfo.url}`);
        this.requests.push(requestInfo);
      }

      // Se é recurso de IA e já estamos após o splash
      if (this.isAIResource(url) && window.modelReady) {
        console.warn(`🚨 DOWNLOAD INESPERADO após splash: ${url}`);
        
        // Mostrar alerta visual
        this.showNetworkAlert(url);
      }

      return originalFetch(url, options);
    };

    // Interceptar XMLHttpRequest também
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalOpen = xhr.open;
      
      xhr.open = function(method, url, ...args) {
        const requestInfo = {
          url: url.toString(),
          method,
          timestamp: Date.now(),
          type: this.getRequestType ? this.getRequestType(url) : 'xhr',
          source: 'xhr'
        };

        if (window.networkMonitor?.isMonitoring) {
          console.log(`📡 XHR REQUEST: ${requestInfo.type} | ${requestInfo.url}`);
          window.networkMonitor.requests.push(requestInfo);
        }

        if (window.networkMonitor?.isAIResource(url) && window.modelReady) {
          console.warn(`🚨 XHR DOWNLOAD INESPERADO após splash: ${url}`);
        }

        return originalOpen.call(this, method, url, ...args);
      };
      
      return xhr;
    };

    console.log('🔍 Monitor de rede ativado');
  }

  isAIResource(url) {
    if (typeof url !== 'string') return false;
    
    const aiPatterns = [
      'staticimgly.com',
      'background-removal-data',
      '.onnx',
      '.wasm',
      '.bin',
      'ort-wasm'
    ];
    return aiPatterns.some(pattern => url.includes(pattern));
  }

  getRequestType(url) {
    if (this.isAIResource(url)) return 'AI_RESOURCE';
    if (url.includes('vite')) return 'DEV_SERVER';
    if (url.includes('.js')) return 'JAVASCRIPT';
    if (url.includes('.css')) return 'STYLESHEET';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) return 'IMAGE';
    return 'OTHER';
  }

  showNetworkAlert(url) {
    // Criar alerta visual temporário
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10001;
      max-width: 300px;
      word-break: break-all;
      animation: slideIn 0.3s ease-out;
    `;
    
    alert.innerHTML = `
      <strong>🚨 Download Inesperado!</strong><br>
      <small>${url.split('/').pop()}</small>
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
      if (alert.parentNode) {
        alert.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => alert.remove(), 300);
      }
    }, 3000);

    // Adicionar CSS de animação se não existir
    if (!document.querySelector('#network-alert-animations')) {
      const style = document.createElement('style');
      style.id = 'network-alert-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  startMonitoring() {
    this.isMonitoring = true;
    this.requests = [];
    console.log('🔍 Monitoramento de rede INICIADO');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('🔍 Monitoramento de rede PARADO');
  }

  getReport() {
    const aiRequests = this.requests.filter(r => r.type === 'AI_RESOURCE');
    const otherRequests = this.requests.filter(r => r.type !== 'AI_RESOURCE');

    return {
      total: this.requests.length,
      aiResources: aiRequests.length,
      other: otherRequests.length,
      aiRequests,
      otherRequests,
      summary: `Total: ${this.requests.length} | AI: ${aiRequests.length} | Outros: ${otherRequests.length}`
    };
  }

  logReport() {
    const report = this.getReport();
    console.group('📊 Relatório de Rede');
    console.log(`Total de requests: ${report.total}`);
    console.log(`Recursos de IA: ${report.aiResources}`);
    console.log(`Outros recursos: ${report.other}`);
    
    if (report.aiRequests.length > 0) {
      console.group('🧠 Recursos de IA:');
      report.aiRequests.forEach(req => {
        console.log(`${req.method} ${req.url} (${new Date(req.timestamp).toLocaleTimeString()})`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    return report;
  }
}

// Instância global
window.networkMonitor = new NetworkMonitor();

// Iniciar monitoramento automaticamente após splash
window.addEventListener('appReady', () => {
  setTimeout(() => {
    window.networkMonitor.startMonitoring();
    console.log('🔍 Monitor de rede ativado após splash');
  }, 1000);
});
