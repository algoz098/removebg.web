// Model Preloader - Versão Simplificada
import { removeBackground } from '@imgly/background-removal';
import { cacheManager } from './cache-manager.js';

class ModelPreloader {
  constructor() {
    this.isModelLoaded = false;
    this.isPreloading = false;
    this.preloadPromise = null;
  }

  /**
   * Verifica se o modelo está pronto
   */
  isReady() {
    return this.isModelLoaded;
  }

  /**
   * Inicia o pré-carregamento do modelo
   */
  async startPreloading() {
    if (this.isPreloading || this.isModelLoaded) {
      return this.preloadPromise;
    }

    console.log('🤖 Iniciando pré-carregamento do modelo...');
    this.isPreloading = true;
    this.preloadPromise = this.preloadModel();
    return this.preloadPromise;
  }

  /**
   * Pré-carrega o modelo
   */
  async preloadModel() {
    try {
      console.log('🧠 Carregando modelo de IA...');
      
      // Inicializar cache se disponível
      try {
        await cacheManager.init();
        console.log('💾 Cache manager inicializado');
      } catch (error) {
        console.log('⚠️ Cache manager não disponível:', error.message);
      }

      // Criar imagem mínima para inicializar
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

      console.log('🚀 Fazendo chamada de teste do modelo...');
      
      // Fazer chamada simples para inicializar
      const result = await removeBackground(blob, {
        publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
        debug: false
      });
      
      this.isModelLoaded = true;
      this.isPreloading = false;
      
      console.log('✅ Modelo pré-carregado com sucesso!');
      return result;
      
    } catch (error) {
      this.isPreloading = false;
      console.warn('⚠️ Falha no pré-carregamento do modelo:', error);
      // Não é um erro crítico, modelo ainda pode carregar na demanda
    }
  }

  /**
   * Aguarda o modelo estar pronto
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
   * Inicia pré-carregamento com delay
   */
  schedulePreload(delay = 2000) {
    setTimeout(() => {
      this.startPreloading();
    }, delay);
  }
}

// Instância global
export const modelPreloader = new ModelPreloader();

// Expor método de teste globalmente para debug
window.testToastProgress = () => modelPreloader.testProgress();
