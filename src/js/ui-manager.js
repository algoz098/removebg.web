// Gerenciamento da interface do usuário
import { formatFileSize } from './utils.js';
import { modelPreloader } from './model-preloader.js';

export class UIManager {
  constructor() {
    this.currentPage = 1;
    this.statusElement = document.getElementById('status');
  }

  /**
   * Mostra uma página específica
   */
  showPage(pageNumber) {
    console.log(`🔄 UIManager.showPage(${pageNumber}) chamado`);
    
    // Lista de todas as páginas possíveis
    const pageIds = ['page-1', 'page-2', 'page-crop', 'page-3', 'page-resize', 'page-4'];
    
    // Esconder todas as páginas
    pageIds.forEach(pageId => {
      const page = document.getElementById(pageId);
      if (page) {
        page.style.display = 'none';
        console.log(`🫥 Página ${pageId} ocultada - display: ${page.style.display}`);
      } else {
        console.log(`❌ Página ${pageId} não encontrada`);
      }
    });

    // Determinar qual página mostrar
    let targetPageId;
    if (pageNumber === 'crop' || pageNumber === 2.5) {
      targetPageId = 'page-crop';
    } else if (pageNumber === 'resize' || pageNumber === 3.5) {
      targetPageId = 'page-resize';
    } else {
      targetPageId = `page-${pageNumber}`;
    }

    // Mostrar página atual
    const currentPageElement = document.getElementById(targetPageId);
    if (currentPageElement) {
      currentPageElement.style.display = 'block';
      console.log(`✅ Página ${targetPageId} exibida - display: ${currentPageElement.style.display}`);
      
      // Verificar se realmente está visível
      const styles = window.getComputedStyle(currentPageElement);
      console.log(`📊 Estilos da página ${targetPageId}:`, {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity
      });
    } else {
      console.error(`❌ Elemento ${targetPageId} não encontrado!`);
      return;
    }

    // Atualizar indicador de progresso
    console.log(`🔄 Atualizando indicador de progresso para página ${pageNumber}`);
    this.updatePageIndicator(pageNumber);
    this.currentPage = pageNumber;

    // Se chegou na página 2 (preview), tentar pré-carregar modelo se ainda não foi feito
    if (pageNumber === 2 && !modelPreloader.isReady() && !modelPreloader.isPreloading) {
      setTimeout(() => {
        console.log('🧠 Preparando modelo de IA para processamento mais rápido...');
        modelPreloader.startPreloading();
      }, 1000);
    }
    
    console.log(`✅ Mudança para página ${pageNumber} concluída com sucesso`);
  }

  /**
   * Atualiza o indicador de progresso das páginas
   */
  updatePageIndicator(currentPage) {
    // Mapear páginas para steps
    const pageToStep = {
      1: 1,
      2: 2,
      'crop': 2.5,
      2.5: 2.5,
      3: 3,
      'resize': 3.5,
      3.5: 3.5,
      4: 4
    };
    
    const currentStep = pageToStep[currentPage] || currentPage;
    
    // Atualizar todos os steps
    [1, 2, 2.5, 3, 3.5, 4].forEach(step => {
      const stepElement = document.querySelector(`[data-step="${step}"]`);
      if (stepElement) {
        stepElement.classList.remove('active', 'completed');
        
        if (step < currentStep) {
          stepElement.classList.add('completed');
        } else if (step === currentStep) {
          stepElement.classList.add('active');
        }
      }
    });
    
    // Atualizar linhas de progresso
    document.querySelectorAll('.step-line').forEach((line, index) => {
      const stepNumber = index === 0 ? 1 : (index === 1 ? 2 : 2.5);
      line.classList.toggle('completed', stepNumber < currentStep);
    });
  }

  /**
   * Atualiza a barra de progresso
   */
  updateProgress(percentage, text) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText && text) {
      progressText.textContent = text;
    }
  }

  /**
   * Mostra/esconde seções de processamento e resultado
   */
  toggleProcessingSections(showProcessing = true) {
    const processingSection = document.getElementById('processing-section');
    const resultSection = document.getElementById('result-section');
    
    if (processingSection) {
      processingSection.style.display = showProcessing ? 'block' : 'none';
    }
    
    if (resultSection) {
      resultSection.style.display = showProcessing ? 'none' : 'block';
    }
  }

  /**
   * Exibe mensagem de status
   */
  updateStatus(message, type = 'info', duration = 3000) {
    if (!this.statusElement) return;

    this.statusElement.textContent = message;
    this.statusElement.className = `show ${type}`;

    // Log para debugging
    if (type === 'error') {
      console.error('❌', message);
    } else if (type === 'success') {
      console.log('✅', message);
    } else {
      console.log('ℹ️', message);
    }

    setTimeout(() => {
      this.statusElement.classList.remove('show');
    }, duration);
  }

  /**
   * Limpa o preview da imagem
   */
  clearPreview() {
    const preview = document.getElementById('preview');
    const imageSize = document.getElementById('image-size');
    const imageDimensions = document.getElementById('image-dimensions');
    
    if (preview) preview.src = '';
    if (imageSize) imageSize.textContent = '';
    if (imageDimensions) imageDimensions.textContent = '';
  }

  /**
   * Limpa os resultados
   */
  clearResults() {
    const result = document.getElementById('result');
    if (result) {
      result.innerHTML = '';
    }
  }

  /**
   * Atualiza as dimensões do crop na interface
   */
  updateCropDimensions(width, height) {
    const dimensionsElement = document.getElementById('crop-dimensions');
    if (dimensionsElement) {
      dimensionsElement.textContent = `${Math.round(width)} × ${Math.round(height)}px`;
    }
  }

  /**
   * Mostra a página de cropping
   */
  showCropPage() {
    this.showPage('crop');
  }

  /**
   * Volta da página de cropping para preview
   */
  backToPreview() {
    this.showPage(2);
  }
}
