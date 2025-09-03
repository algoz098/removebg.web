const CACHE_NAME = 'removebg-v1.0.0';
const CACHE_STATIC_NAME = 'removebg-static-v1.0.0';
const CACHE_DYNAMIC_NAME = 'removebg-dynamic-v1.0.0';

// Assets estáticos para cache inicial
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
  // Não incluir CSS e JS aqui para evitar conflitos com Vite HMR
];

// Assets dinâmicos que podem ser cachados conforme uso
const DYNAMIC_CACHE_LIMIT = 50;

// Instalar o Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Ativar o Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_STATIC_NAME && 
              cacheName !== CACHE_DYNAMIC_NAME &&
              cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activated');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Não interceptar requisições do Vite dev server
  if (url.pathname.includes('/@vite/') || 
      url.pathname.includes('/@fs/') ||
      url.pathname.includes('/__vite') ||
      url.search.includes('import') ||
      url.search.includes('t=')) {
    return;
  }

  // Só interceptar requisições do mesmo origin
  if (url.origin !== location.origin) {
    return;
  }

  // Cache First Strategy para assets estáticos
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.startsWith('/icons/') ||
      (url.pathname.endsWith('.css') && !url.search.includes('t=')) ||
      (url.pathname.endsWith('.png') && !url.pathname.includes('node_modules')) ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg')) {
    
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then(response => {
              if (response && response.status === 200 && response.type === 'basic') {
                const responseClone = response.clone();
                caches.open(CACHE_STATIC_NAME)
                  .then(cache => cache.put(request, responseClone))
                  .catch(err => console.log('[SW] Cache put error:', err));
              }
              return response;
            })
            .catch(err => {
              console.log('[SW] Fetch error:', err);
              // Fallback para página offline se disponível
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
              throw err;
            });
        })
    );
    return;
  }

  // Para arquivos JS em desenvolvimento, não interceptar
  if (url.pathname.endsWith('.js') && (url.search.includes('t=') || url.hostname === 'localhost')) {
    return;
  }

  // Network First Strategy para outras requisições
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          
          caches.open(CACHE_DYNAMIC_NAME)
            .then(cache => {
              cache.put(request, responseClone);
              
              // Limitar o tamanho do cache dinâmico
              cache.keys().then(keys => {
                if (keys.length > DYNAMIC_CACHE_LIMIT) {
                  cache.delete(keys[0]);
                }
              });
            })
            .catch(err => console.log('[SW] Dynamic cache error:', err));
        }
        return response;
      })
      .catch(err => {
        console.log('[SW] Network error:', err);
        return caches.match(request);
      })
  );
});

// Manipular mensagens do cliente
self.addEventListener('message', event => {
  const { data } = event;
  
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
  
  if (data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({
        type: 'CACHE_CLEARED'
      });
    });
  }
});

// Notificar sobre atualizações
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.ports[0].postMessage({
      type: 'UPDATE_AVAILABLE',
      hasUpdate: false // Implementar lógica de verificação se necessário
    });
  }
});
