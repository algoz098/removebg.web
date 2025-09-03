// Sistema de notificações toast
export class ToastManager {
  constructor() {
    this.container = this.createToastContainer();
    document.body.appendChild(this.container);
  }

  createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    return container;
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      loading: '🔄'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;

    // Estilos do toast
    toast.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 16px;
      background: ${this.getBackgroundColor(type)};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      max-width: 320px;
      min-width: 280px;
      word-wrap: break-word;
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    `;

    // Estilos específicos para mensagem para permitir quebra de linha
    const messageEl = toast.querySelector('.toast-message');
    messageEl.style.cssText = `
      flex: 1;
      line-height: 1.4;
    `;

    // Animação de entrada
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .toast-loading .toast-icon {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    
    if (!document.querySelector('#toast-styles')) {
      style.id = 'toast-styles';
      document.head.appendChild(style);
    }

    this.container.appendChild(toast);

    // Auto-remover após duração especificada (exceto para loading)
    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    // Retornar referência para poder remover manualmente
    return toast;
  }

  remove(toast) {
    if (toast && toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  getBackgroundColor(type) {
    const colors = {
      info: '#3498db',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c',
      loading: '#9b59b6'
    };
    return colors[type] || colors.info;
  }

  // Métodos de conveniência
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  loading(message) {
    return this.show(message, 'loading', 0); // Não remove automaticamente
  }

  /**
   * Cria um toast de progresso que pode ser facilmente atualizado
   */
  progress(initialMessage) {
    const toast = this.loading(initialMessage);
    
    // Adicionar método de atualização diretamente no toast
    toast.updateProgress = (message, percentage = null) => {
      let content = message;
      
      if (percentage !== null && percentage >= 0) {
        content += ` (${percentage}%)`;
        const progressBar = this.createProgressBar(percentage);
        content += progressBar;
      }
      
      console.log('🔄 Atualizando toast com:', { message, percentage, content });
      return this.updateToast(toast, content);
    };
    
    return toast;
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

  /**
   * Atualiza o conteúdo de um toast existente
   */
  updateToast(toast, message) {
    if (!toast) {
      console.warn('⚠️ Toast não encontrado para atualizar');
      return false;
    }
    
    const messageElement = toast.querySelector('.toast-message');
    if (messageElement) {
      messageElement.innerHTML = message;
      console.log('✅ Toast atualizado com sucesso');
      return true;
    } else {
      console.warn('⚠️ Elemento .toast-message não encontrado no toast');
      return false;
    }
  }
}

// Instância global
export const toast = new ToastManager();
