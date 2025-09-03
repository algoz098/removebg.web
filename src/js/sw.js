// Service Worker especializado para cache de recursos de IA
const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `removebg-static-${CACHE_VERSION}`;
const AI_CACHE = `removebg-ai-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `removebg-dynamic-${CACHE_VERSION}`;

// URLs de recursos de IA para cache agressivo
const AI_RESOURCE_PATTERNS = [
  'staticimgly.com',
  'background-removal-data',
  '.onnx',
  '.wasm',
  '.bin',
  'model'
];

// Assets estáticos do app
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/sobre.html',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      // Cache dos assets estáticos
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Pré-cache de recursos críticos se disponíveis
      self.skipWaiting()
    ])
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim()
    ])
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Não interceptar requisições do Vite dev server
  if (isDevelopment(url)) {
    return;
  }

  // Estratégia específica para recursos de IA
  if (isAIResource(url)) {
    event.respondWith(handleAIResource(request));
    return;
  }

  // Assets estáticos - Cache First
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Outras requisições - Network First com fallback
  event.respondWith(handleDynamicRequest(request));
});

/**
 * Verifica se é ambiente de desenvolvimento
 */
function isDevelopment(url) {
  return url.pathname.includes('/@vite/') || 
         url.pathname.includes('/@fs/') ||
         url.pathname.includes('/__vite') ||
         url.search.includes('import') ||
         url.search.includes('t=') ||
         (url.hostname === 'localhost' && url.pathname.endsWith('.js'));
}

/**
 * Verifica se é um recurso de IA
 */
function isAIResource(url) {
  const urlString = url.href.toLowerCase();
  return AI_RESOURCE_PATTERNS.some(pattern => urlString.includes(pattern));
}

/**
 * Verifica se é um asset estático
 */
function isStaticAsset(url) {
  return STATIC_ASSETS.includes(url.pathname) || 
         url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/screenshots/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico');
}

/**
 * Manipula recursos de IA com cache agressivo
 */
async function handleAIResource(request) {
  const url = request.url;
  
  try {
    // Primeiro verifica o cache
    const cachedResponse = await caches.match(request, {
      cacheName: AI_CACHE,
      ignoreVary: true
    });
    
    if (cachedResponse) {
      console.log('[SW] 🚀 AI Resource cache hit:', url);
      
      // Notificar cache hit para analytics
      notifyClients({
        type: 'AI_CACHE_HIT',
        url: url,
        size: cachedResponse.headers.get('content-length')
      });
      
      return cachedResponse;
    }

    // Se não está no cache, busca na rede
    console.log('[SW] 📥 Downloading AI resource:', url);
    
    // Notificar início do download
    notifyClients({
      type: 'AI_DOWNLOAD_START',
      url: url
    });

    const response = await fetch(request, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (response && response.status === 200) {
      // Clona resposta para cache
      const responseToCache = response.clone();
      
      // Cache em background
      caches.open(AI_CACHE).then(cache => {
        cache.put(request, responseToCache).then(() => {
          console.log('[SW] 💾 AI resource cached:', url);
          
          // Notificar cache success
          notifyClients({
            type: 'AI_CACHE_STORED',
            url: url,
            size: response.headers.get('content-length')
          });
        });
      }).catch(err => {
        console.warn('[SW] ⚠️ Failed to cache AI resource:', url, err);
      });

      return response;
    }

    throw new Error(`Network response not ok: ${response.status}`);
    
  } catch (error) {
    console.error('[SW] ❌ AI resource fetch failed:', url, error);
    
    // Notificar erro
    notifyClients({
      type: 'AI_DOWNLOAD_ERROR',
      url: url,
      error: error.message
    });

    // Tentar buscar uma versão cacheada mesmo que antiga
    const anyCache = await caches.match(request);
    if (anyCache) {
      console.log('[SW] 🆘 Using stale AI resource:', url);
      return anyCache;
    }

    throw error;
  }
}

/**
 * Manipula assets estáticos
 */
async function handleStaticAsset(request) {
  try {
    // Cache First
    const cachedResponse = await caches.match(request, {
      cacheName: STATIC_CACHE
    });
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Se não está no cache, busca e cacheia
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
    
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', request.url, error);
    
    // Fallback para página principal se for navegação
    if (request.destination === 'document') {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    
    throw error;
  }
}

/**
 * Manipula requisições dinâmicas
 */
async function handleDynamicRequest(request) {
  try {
    // Network First
    const response = await fetch(request);
    
    if (response && response.status === 200 && response.type === 'basic') {
      // Cache apenas se for do mesmo origem
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
    
  } catch (error) {
    console.error('[SW] Dynamic request failed:', request.url, error);
    
    // Fallback para cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Notifica clientes sobre eventos
 */
function notifyClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

/**
 * Manipula mensagens dos clientes
 */
self.addEventListener('message', event => {
  const { data } = event;
  
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data.type === 'GET_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage({
        type: 'CACHE_STATS',
        stats
      });
    });
  }
  
  if (data.type === 'CLEAR_AI_CACHE') {
    caches.delete(AI_CACHE).then(() => {
      event.ports[0].postMessage({
        type: 'AI_CACHE_CLEARED'
      });
    });
  }
  
  if (data.type === 'CLEAR_ALL_CACHE') {
    Promise.all([
      caches.delete(AI_CACHE),
      caches.delete(DYNAMIC_CACHE)
    ]).then(() => {
      event.ports[0].postMessage({
        type: 'ALL_CACHE_CLEARED'
      });
    });
  }
});

/**
 * Obtém estatísticas do cache
 */
async function getCacheStats() {
  try {
    const [aiCache, staticCache, dynamicCache] = await Promise.all([
      caches.open(AI_CACHE),
      caches.open(STATIC_CACHE),
      caches.open(DYNAMIC_CACHE)
    ]);

    const [aiKeys, staticKeys, dynamicKeys] = await Promise.all([
      aiCache.keys(),
      staticCache.keys(),
      dynamicCache.keys()
    ]);

    return {
      ai: aiKeys.length,
      static: staticKeys.length,
      dynamic: dynamicKeys.length,
      total: aiKeys.length + staticKeys.length + dynamicKeys.length,
      version: CACHE_VERSION
    };
  } catch (error) {
    console.error('[SW] Error getting cache stats:', error);
    return { ai: 0, static: 0, dynamic: 0, total: 0, version: CACHE_VERSION };
  }
}

// Log de inicialização
console.log('[SW] RemoveBG Service Worker v2.0.0 loaded');
