// Processamento de remoção de fundo
import { removeBackground } from '@imgly/background-removal';
import { downloadBlob } from './utils.js';
import { modelPreloader } from './model-preloader.js';
import { cacheManager } from './cache-manager.js';
import { globalState } from './global-state.js';

export class BackgroundProcessor {
  constructor(uiManager) {
    this.uiManager = uiManager;
  }

  /**
   * Remove o fundo da imagem
   */
  async processImage(file, displayName = null) {
    try {
      this.uiManager.updateProgress(0, 'Iniciando processamento...');
      
      // Verificar se modelo foi pré-carregado no splash
      if (window.modelReady && window.lastModelInit) {
        const timeSinceInit = Date.now() - window.lastModelInit;
        this.uiManager.updateProgress(30, 'Modelo já inicializado, processando...');
      } else {
        this.uiManager.updateProgress(10, 'Inicializando modelo...');
      }
      
      // Simular progresso durante o processamento
      const progressInterval = setInterval(() => {
        const currentProgress = parseInt(document.getElementById('progress-fill')?.style.width || '30');
        if (currentProgress < 85) {
          this.uiManager.updateProgress(currentProgress + 8, 'Analisando imagem...');
        }
      }, 150);

      // Monitorar apenas se houve requisições HTTP (não interceptar mais, já está interceptado)
      let httpRequestCount = 0;
      const startTime = Date.now();

      // Processar imagem (fetch já está interceptado permanentemente)
      const imageBlob = await removeBackground(file, {
        publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
        debug: false
      });
      
      const processingTime = Date.now() - startTime;
      
      clearInterval(progressInterval);
      this.uiManager.updateProgress(100, 'Processamento concluído!');

      // Relatório de performance simplificado
      if (window.modelReady) {
        if (processingTime < 1000) {
        } else {
        }
      } else {
      }
      
      // Log de sucesso
      
      // Armazenar resultado no estado global
      globalState.setProcessedImageBlob(imageBlob);
      
      // Mostrar resultado - usar displayName se fornecido
      await this.showResult(file, imageBlob, displayName);
      
      return imageBlob;
      
    } catch (error) {
      this.uiManager.updateStatus(`❌ Erro ao processar imagem: ${error.message}`, 'error');
      throw error;
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
   * Exibe o resultado da remoção de fundo
   */
  async showResult(processedFile, processedBlob, displayName = null) {
    const result = document.getElementById('result');
    if (!result) return;

    // Limpar resultado anterior
    result.innerHTML = '';

    // Criar comparação lado a lado
    const comparison = document.createElement('div');
    comparison.className = 'result-comparison';

    // Determinar o nome para exibir
    const beforeLabel = displayName || '📸 Original';

    // Imagem original (ou cortada)
    const originalSection = document.createElement('div');
    originalSection.className = 'result-item';
    originalSection.innerHTML = `
      <h4>${beforeLabel}</h4>
      <img src="${URL.createObjectURL(processedFile)}" alt="Imagem Original" />
    `;

    // Imagem processada
    const processedSection = document.createElement('div');
    processedSection.className = 'result-item';
    processedSection.innerHTML = `
      <h4>✨ Sem Fundo</h4>
      <img src="${URL.createObjectURL(processedBlob)}" alt="Imagem Sem Fundo" />
    `;

    comparison.appendChild(originalSection);
    comparison.appendChild(processedSection);

    // Seção de download
    const downloadSection = document.createElement('div');
    downloadSection.className = 'download-section';

    const downloadButton = document.createElement('button');
    downloadButton.className = 'download-btn';
    downloadButton.innerHTML = '💾 Baixar Imagem';
    downloadButton.onclick = () => this.downloadImage(processedBlob, processedFile.name);

    downloadSection.appendChild(downloadButton);

    result.appendChild(comparison);
    result.appendChild(downloadSection);

    // Esconder seção de processamento e mostrar resultado
    this.uiManager.toggleProcessingSections(false);
  }

  /**
   * Faz download da imagem processada
   */
  downloadImage(blob, originalName) {
    const filename = originalName.replace(/\.[^/.]+$/, '') + '_no_bg.png';
    downloadBlob(blob, filename);
    
    // Log de download
    this.uiManager.updateStatus('✅ Download iniciado!');
  }
}
