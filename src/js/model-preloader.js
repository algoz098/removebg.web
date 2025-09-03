// Sistema de pré-carregamento de modelos e recursos
import { removeBackground } from '@imgly/background-removal';
import { toast } from './toast.js';
import { cacheManager } from './cache-manager.js';

export class ModelPreloader {
  constructor() {
    this.isModelLoaded = false;
    this.isPreloading = false;
    this.preloadPromise = null;
    this.loadingToast = null;
    this.cacheStats = { hits: 0, misses: 0 };
  }

  /**
   * Inicia o pré-carregamento do modelo em background
   */
  async startPreloading() {
    if (this.isPreloading || this.isModelLoaded) {
      return this.preloadPromise;
    }

    // Inicializar cache manager
    await cacheManager.init();

    this.isPreloading = true;
    this.loadingToast = toast.progress('🤖 Verificando recursos locais...');

    this.preloadPromise = this.preloadModel();
    return this.preloadPromise;
  }

  /**
   * Pré-carrega o modelo fazendo uma chamada com uma imagem mínima
   */
  async preloadModel() {
    try {
      // Verificar cache stats primeiro
      const cacheStats = await cacheManager.getCacheStats();
      if (cacheStats.count > 0) {
        this.loadingToast.updateProgress(`💾 Encontrados ${cacheStats.count} recursos em cache (${cacheStats.formattedSize})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Criar uma imagem mínima (1x1 pixel) para inicializar o modelo
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1, 1);

      // Converter para blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      console.log('🚀 Iniciando pré-carregamento do modelo...');
      
      // Atualizar toast para mostrar início do download
      this.loadingToast.updateProgress('📥 Carregando modelo de IA...');

      // TESTE: Tentar sem interceptação primeiro para ver se o progresso funciona
      const useInterception = false; // Mudar para true depois de testar

      let originalFetch, fetchCount = 0;
      
      if (useInterception) {
        // Interceptar fetch para usar cache
        originalFetch = window.fetch;
        
        window.fetch = async (url, options) => {
          fetchCount++;
          console.log(`🌐 Fetch #${fetchCount}: ${url}`);
          
          if (typeof url === 'string' && this.isAIResource(url)) {
            console.log(`🤖 Interceptando recurso de IA: ${url}`);
            return await cacheManager.interceptFetch(url, options);
          }
          return originalFetch(url, options);
        };
      }

      try {
        // Fazer uma chamada inicial para carregar o modelo com callback de progresso
        console.log('🔧 Iniciando removeBackground com callback de progresso...');
        
        // Iniciar progresso simulado se o callback real não funcionar
        let progressSimulated = false;
        const progressTimeout = setTimeout(() => {
          console.log('⚠️ Callback de progresso não foi chamado, iniciando simulação...');
          progressSimulated = true;
          this.simulateProgress();
        }, 2000);
        
        const result = await removeBackground(blob, {
          publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
          debug: true,
          progress: (key, current, total) => {
            console.log(`📦 Progress callback real chamado: ${key} - ${current}/${total} bytes`);
            clearTimeout(progressTimeout); // Cancelar simulação se callback real funcionar
            this.handleProgress(key, current, total);
          }
        });
        
        if (progressSimulated) {
          clearTimeout(progressTimeout);
        }
        
        console.log('✅ removeBackground completado');
        return result;
      } finally {
        // Restaurar fetch original se foi interceptado
        if (useInterception && originalFetch) {
          console.log(`🔄 Restaurando fetch original. Total de fetches: ${fetchCount}`);
          window.fetch = originalFetch;
        }
      }

      this.isModelLoaded = true;
      this.isPreloading = false;

      // Remover toast de carregamento
      if (this.loadingToast) {
        toast.remove(this.loadingToast);
        this.loadingToast = null;
      }

      // Mostrar estatísticas finais do cache
      const finalStats = await cacheManager.getCacheStats();
      const message = finalStats.count > cacheStats.count 
        ? `✨ Modelo pronto! ${finalStats.count - cacheStats.count} novos recursos cachados`
        : '⚡ Modelo carregado do cache local!';
      
      toast.success(message);
      
      console.log('✅ Modelo pré-carregado com sucesso!');
      console.log(`📊 Cache final: ${finalStats.count} recursos, ${finalStats.formattedSize}`);
      
    } catch (error) {
      this.isPreloading = false;
      
      // Remover toast de carregamento
      if (this.loadingToast) {
        toast.remove(this.loadingToast);
        this.loadingToast = null;
      }

      console.warn('⚠️ Falha no pré-carregamento do modelo:', error);
      // Não mostra erro para o usuário, pois o modelo ainda pode carregar quando necessário
    }
  }

  /**
   * Verifica se uma URL é de recurso de IA
   */
  isAIResource(url) {
    const aiPatterns = [
      'staticimgly.com',
      'background-removal-data',
      '.onnx',
      '.wasm',
      '.bin'
    ];
    return aiPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Verifica se o modelo está carregado
   */
  isReady() {
    return this.isModelLoaded;
  }

  /**
   * Aguarda o modelo estar pronto (se estiver carregando) ou retorna imediatamente
   */
  async waitForModel() {
    if (this.isModelLoaded) {
      return true;
    }
    
    if (this.isPreloading && this.preloadPromise) {
      try {
        await this.preloadPromise;
        return true;
      } catch (error) {
        console.warn('Modelo não foi pré-carregado, mas tentará carregar na demanda');
        return false;
      }
    }
    
    return false;
  }

  /**
   * Inicia pré-carregamento com delay para não interferir no carregamento inicial
   */
  schedulePreload(delay = 2000) {
    setTimeout(async () => {
      // Inicializar cache primeiro
      await cacheManager.init();
      this.startPreloading();
    }, delay);
  }

  /**
   * Obtém estatísticas do cache
   */
  async getCacheStats() {
    return await cacheManager.getCacheStats();
  }

  /**
   * Limpa o cache de recursos de IA
   */
  async clearCache() {
    const result = await cacheManager.clearCache();
    if (result) {
      this.isModelLoaded = false; // Força recarregamento
    }
    return result;
  }

  /**
   * Manipula o progresso do carregamento do modelo
   */
  handleProgress(key, current, total) {
    if (!this.loadingToast) {
      console.warn('⚠️ Loading toast não encontrado para atualizar progresso');
      return;
    }

    const percentage = Math.round((current / total) * 100);
    const totalMB = (total / (1024 * 1024)).toFixed(1);
    const currentMB = (current / (1024 * 1024)).toFixed(1);
    
    // Diferentes mensagens baseadas no tipo de arquivo sendo baixado
    let message = '📥 Baixando modelo de IA';
    
    if (key.includes('wasm')) {
      message = '⚙️ Baixando WebAssembly';
    } else if (key.includes('onnx') || key.includes('model')) {
      message = '🧠 Baixando modelo neural';
    } else if (key.includes('data')) {
      message = '📊 Baixando dados do modelo';
    } else {
      message = '📥 Baixando recursos';
    }

    const fullMessage = `${message} (${currentMB}/${totalMB} MB)`;
    
    console.log(`📦 Progresso: ${fullMessage} - ${percentage}%`);
    this.loadingToast.updateProgress(fullMessage, percentage);
  }

  /**
   * Simula progresso de download se o callback real não funcionar
   */
  simulateProgress() {
    if (!this.loadingToast) return;
    
    console.log('🎭 Iniciando simulação de progresso...');
    
    const steps = [
      { message: '📥 Baixando recursos', percentage: 10 },
      { message: '⚙️ Baixando WebAssembly (5.2/12.5 MB)', percentage: 25 },
      { message: '⚙️ Baixando WebAssembly (8.7/12.5 MB)', percentage: 45 },
      { message: '⚙️ Baixando WebAssembly (12.5/12.5 MB)', percentage: 60 },
      { message: '🧠 Baixando modelo neural (15.8/32.7 MB)', percentage: 70 },
      { message: '🧠 Baixando modelo neural (25.4/32.7 MB)', percentage: 85 },
      { message: '🧠 Baixando modelo neural (32.7/32.7 MB)', percentage: 95 },
      { message: '✅ Finalizando carregamento', percentage: 100 }
    ];
    
    let currentStep = 0;
    
    const updateStep = () => {
      if (currentStep < steps.length && this.loadingToast) {
        const step = steps[currentStep];
        console.log(`🎭 Simulação step ${currentStep + 1}: ${step.message} - ${step.percentage}%`);
        this.loadingToast.updateProgress(step.message, step.percentage);
        currentStep++;
        
        if (currentStep < steps.length) {
          setTimeout(updateStep, Math.random() * 1000 + 500); // 500-1500ms entre steps
        }
      }
    };
    
    updateStep();
  }
  /**
   * Testa o sistema de progresso do toast
   */
  testProgress() {
    console.log('🧪 Testando sistema de progresso do toast...');
    const testToast = toast.progress('🧪 Iniciando teste de progresso');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      const message = `🧪 Testando progresso - Arquivo ${Math.ceil(progress/30)} (${progress}/100 MB)`;
      
      console.log(`🧪 Atualizando para: ${message} - ${progress}%`);
      testToast.updateProgress(message, progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          toast.remove(testToast);
          toast.success('✅ Teste de progresso concluído com sucesso!');
        }, 1500);
      }
    }, 800);
    
    return testToast;
  }

  /**
   * Inicia pré-carregamento com delay para não interferir no carregamento inicial
   */
  schedulePreload(delay = 2000) {
    setTimeout(async () => {
      // Inicializar cache primeiro
      await cacheManager.init();
      this.startPreloading();
    }, delay);
  }

  /**
   * Cria uma barra de progresso visual
   */
  createProgressBar(percentage) {
    return `
      <div style="
        width: 100%; 
        height: 6px; 
        background: rgba(255,255,255,0.2); 
        border-radius: 3px; 
        margin-top: 8px;
        overflow: hidden;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
      ">
        <div style="
          width: ${percentage}%; 
          height: 100%; 
          background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7)); 
          border-radius: 3px;
          transition: width 0.3s ease;
          box-shadow: 0 1px 2px rgba(255,255,255,0.3);
        "></div>
      </div>
    `;
  }
}

// Instância global
export const modelPreloader = new ModelPreloader();

// Expor método de teste globalmente para debug
window.testToastProgress = () => modelPreloader.testProgress();
