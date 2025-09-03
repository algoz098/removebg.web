// Teste do sistema de estado global e navegação otimizada

console.log('🧪 Iniciando teste do sistema de cache global...');

// Aguardar elementos estarem disponíveis
setTimeout(() => {
  // Verificar se global state foi carregado
  if (window.globalState) {
    console.log('✅ GlobalState disponível:', window.globalState.getStats());
  } else {
    console.warn('❌ GlobalState não encontrado');
  }

  // Verificar navigation manager
  if (window.navigationManager) {
    console.log('✅ NavigationManager disponível');
  } else {
    console.warn('❌ NavigationManager não encontrado');
  }

  // Criar botões de teste
  const testDiv = document.createElement('div');
  testDiv.id = 'cache-test-controls';
  testDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #f8f9fa;
    border: 2px solid #dee2e6;
    border-radius: 10px;
    padding: 15px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    z-index: 10000;
    max-width: 250px;
  `;

  testDiv.innerHTML = `
    <h4 style="margin: 0 0 10px 0; color: #495057;">🧪 Cache Test</h4>
    <div style="margin-bottom: 8px;">
      <button onclick="testGlobalState()" style="padding: 5px 10px; margin: 2px; border: 1px solid #007bff; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">Estado Global</button>
    </div>
    <div style="margin-bottom: 8px;">
      <button onclick="simulateNavigation()" style="padding: 5px 10px; margin: 2px; border: 1px solid #28a745; background: #28a745; color: white; border-radius: 4px; cursor: pointer;">Simular Navegação</button>
    </div>
    <div style="margin-bottom: 8px;">
      <button onclick="clearGlobalState()" style="padding: 5px 10px; margin: 2px; border: 1px solid #dc3545; background: #dc3545; color: white; border-radius: 4px; cursor: pointer;">Limpar Cache</button>
    </div>
    <div style="margin-bottom: 8px;">
      <button onclick="markCacheReady()" style="padding: 5px 10px; margin: 2px; border: 1px solid #ffc107; background: #ffc107; color: black; border-radius: 4px; cursor: pointer;">Marcar Pronto</button>
    </div>
    <div style="font-size: 10px; color: #6c757d; margin-top: 10px;">
      Abra o Console para ver os logs
    </div>
  `;

  document.body.appendChild(testDiv);

  // Funções de teste globais
  window.testGlobalState = () => {
    if (window.globalState) {
      const stats = window.globalState.getStats();
      console.group('🌍 Estado Global Atual');
      console.log('Cache Ready:', window.globalState.isCacheReady());
      console.log('Splash Completed:', window.globalState.isSplashCompleted());
      console.log('Should Skip Init:', window.globalState.shouldSkipInit());
      console.log('Stats completas:', stats);
      console.groupEnd();
    }
  };

  window.simulateNavigation = () => {
    console.log('🚀 Simulando navegação otimizada...');
    sessionStorage.setItem('fastLoad', 'true');
    sessionStorage.setItem('fastLoadSource', 'test-simulation');
    console.log('✅ Flags de fast load definidas. Recarregue a página para testar.');
  };

  window.clearGlobalState = () => {
    if (window.globalState) {
      window.globalState.reset();
      console.log('🔄 Estado global resetado');
    }
  };

  window.markCacheReady = () => {
    if (window.globalState) {
      window.globalState.setCacheReady({ hits: 10, misses: 2, totalSize: 50000000 });
      window.globalState.setSplashCompleted();
      console.log('✅ Cache marcado como pronto para teste');
    }
  };

  console.log('🎯 Controles de teste adicionados à página');

}, 2000);

// Teste inicial
console.log('📍 Página atual:', window.location.pathname);
console.log('📎 Referrer:', document.referrer);
console.log('💾 SessionStorage fastLoad:', sessionStorage.getItem('fastLoad'));
