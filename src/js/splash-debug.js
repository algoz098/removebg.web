// Debug do Splash - Teste básico
console.log('🔍 DEBUG: Splash debug carregado!');

// Função de teste para verificar se splash aparece
window.testSplash = function() {
  console.log('🧪 Testando splash básico...');
  
  // Remover qualquer splash existente
  const existingSplash = document.getElementById('splash-screen');
  if (existingSplash) {
    existingSplash.remove();
  }
  
  // Criar splash simples
  const splashHTML = `
    <div class="splash-screen" id="test-splash" style="
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ">
      <div style="font-size: 4rem; margin-bottom: 1rem;">🎨</div>
      <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">RemoveBG</div>
      <div style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 3rem;">Teste de Splash</div>
      <div style="color: yellow; font-size: 1rem;">✅ Splash funcionando!</div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', splashHTML);
  
  console.log('✅ Splash de teste criado!');
  
  // Remover após 3 segundos
  setTimeout(() => {
    const testSplash = document.getElementById('test-splash');
    if (testSplash) {
      testSplash.style.opacity = '0';
      setTimeout(() => testSplash.remove(), 500);
    }
  }, 3000);
};

// Debug de estado
window.debugSplashState = function() {
  console.log('🔍 Estado atual do splash:');
  console.log('- URL:', window.location.href);
  console.log('- Referrer:', document.referrer);
  console.log('- Session Storage:', {
    skipSplash: sessionStorage.getItem('skipSplash'),
    fastLoad: sessionStorage.getItem('fastLoad'),
    skipTimestamp: sessionStorage.getItem('skipSplashTimestamp')
  });
  console.log('- Window flags:', {
    modelReady: window.modelReady,
    lastModelInit: window.lastModelInit
  });
  
  if (window.globalState) {
    console.log('- Global State:', window.globalState.getStats());
  } else {
    console.log('- Global State: não disponível');
  }
};

// Auto-executar debug
setTimeout(() => {
  console.log('🔍 Auto-debug executado após 1s:');
  window.debugSplashState();
}, 1000);

// Mostrar mensagem de debug
console.log('🧪 Debug carregado! Use:');
console.log('- window.testSplash() para testar splash');
console.log('- window.debugSplashState() para ver estado');
console.log('- window.resetSplashState() para resetar');
