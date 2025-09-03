// Debug do sistema de toast e progresso
import { toast } from './toast.js';

console.log('🔧 Debug do toast carregado...');

// Função para testar o toast básico
window.testBasicToast = () => {
  console.log('🧪 Testando toast básico...');
  
  toast.info('ℹ️ Toast de info');
  setTimeout(() => toast.success('✅ Toast de sucesso'), 1000);
  setTimeout(() => toast.warning('⚠️ Toast de aviso'), 2000);
  setTimeout(() => toast.error('❌ Toast de erro'), 3000);
  
  return 'Toasts básicos enviados';
};

// Função para testar toast de loading
window.testLoadingToast = () => {
  console.log('🧪 Testando toast de loading...');
  
  const loadingToast = toast.loading('🔄 Carregando...');
  console.log('Loading toast criado:', loadingToast);
  
  setTimeout(() => {
    console.log('Removendo loading toast...');
    toast.remove(loadingToast);
    toast.success('✅ Loading finalizado!');
  }, 3000);
  
  return loadingToast;
};

// Função para testar toast de progresso
window.testProgressToast = () => {
  console.log('🧪 Testando toast de progresso...');
  
  const progressToast = toast.progress('📥 Iniciando download...');
  console.log('Progress toast criado:', progressToast);
  console.log('Método updateProgress disponível:', typeof progressToast.updateProgress);
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    const message = `📥 Baixando arquivo`;
    console.log(`Atualizando progresso: ${message} - ${progress}%`);
    
    const result = progressToast.updateProgress(message, progress);
    console.log('Resultado da atualização:', result);
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        toast.remove(progressToast);
        toast.success('✅ Download concluído!');
      }, 1000);
    }
  }, 1000);
  
  return progressToast;
};

// Função para testar com barra de progresso visual
window.testProgressBar = () => {
  console.log('🧪 Testando barra de progresso visual...');
  
  const progressToast = toast.progress('📊 Processando dados...');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    const message = `📊 Processando dados (${progress.toFixed(0)}/100 MB)`;
    
    console.log(`Progresso: ${progress}% - Mensagem: ${message}`);
    progressToast.updateProgress(message, progress);
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        toast.remove(progressToast);
        toast.success('🎉 Processamento concluído!');
      }, 1500);
    }
  }, 600);
  
  return progressToast;
};

console.log('✅ Debug functions loaded:');
console.log('- window.testBasicToast()');
console.log('- window.testLoadingToast()');
console.log('- window.testProgressToast()');
console.log('- window.testProgressBar()');
console.log('- window.testToastProgress() (from model-preloader)');
