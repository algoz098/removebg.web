// Gerenciamento da interface do usuário
import { formatFileSize } from './utils.js';

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
    
    // Verificar se todas as páginas existem
    const pages = {};
    for (let i = 1; i <= 3; i++) {
      pages[i] = document.getElementById(`page-${i}`);
      console.log(`📄 Página ${i}:`, !!pages[i]);
    }
    
    // Esconder todas as páginas
    for (let i = 1; i <= 3; i++) {
      const page = pages[i];
      if (page) {
        page.style.display = 'none';
        console.log(`�️ Página ${i} ocultada (display: none)`);
      } else {
        console.error(`❌ Página ${i} não encontrada no DOM!`);
      }
    }

    // Mostrar página atual
    const currentPageElement = pages[pageNumber];
    if (currentPageElement) {
      currentPageElement.style.display = 'block';
      console.log(`✅ Página ${pageNumber} exibida (display: block)`);
      
      // Verificar se realmente está visível
      const styles = window.getComputedStyle(currentPageElement);
      console.log(`📊 Estilos da página ${pageNumber}:`, {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity
      });
    } else {
      console.error(`❌ Elemento page-${pageNumber} não encontrado!`);
      return;
    }

    // Atualizar indicador de progresso
    console.log(`🔄 Atualizando indicador de progresso para página ${pageNumber}`);
    this.updatePageIndicator(pageNumber);
    this.currentPage = pageNumber;

    // Se chegou na página 2 (preview), tentar pré-carregar modelo se ainda não foi feito
    if (pageNumber === 2 && !modelPreloader.isReady() && !modelPreloader.isPreloading) {
      setTimeout(() => {
        toast.info('🧠 Preparando modelo de IA para processamento mais rápido...', 3000);
        modelPreloader.startPreloading();
      }, 1000);
    }
    
    console.log(`✅ Mudança para página ${pageNumber} concluída com sucesso`);
  }

  /**
   * Atualiza o indicador de progresso das páginas
   */
  updatePageIndicator(currentPage) {
    for (let i = 1; i <= 3; i++) {
      const step = document.querySelector(`[data-step="${i}"]`);
      const line = step?.nextElementSibling;
      
      if (step) {
        step.classList.remove('active', 'completed');
        
        if (i < currentPage) {
          step.classList.add('completed');
        } else if (i === currentPage) {
          step.classList.add('active');
        }
      }
      
      if (line && line.classList.contains('step-line')) {
        line.classList.toggle('completed', i < currentPage);
      }
    }
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

    // Também mostrar como toast para melhor visibilidade
    if (type === 'error') {
      toast.error(message);
    } else if (type === 'success') {
      toast.success(message);
    } else {
      toast.info(message);
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
}
