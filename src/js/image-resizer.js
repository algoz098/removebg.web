// Gerenciador de redimensionamento de imagens
export class ImageResizer {
  constructor() {
    this.originalImage = null;
    this.currentWidth = 0;
    this.currentHeight = 0;
    this.aspectRatio = 1;
    this.maintainAspect = true;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Inputs de dimensões
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const maintainAspectCheckbox = document.getElementById('maintain-aspect');

    if (widthInput) {
      widthInput.addEventListener('input', (e) => {
        this.onWidthChange(e.target.value);
      });
    }

    if (heightInput) {
      heightInput.addEventListener('input', (e) => {
        this.onHeightChange(e.target.value);
      });
    }

    if (maintainAspectCheckbox) {
      maintainAspectCheckbox.addEventListener('change', (e) => {
        this.maintainAspect = e.target.checked;
      });
    }

    // Botões de preset
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const width = parseInt(e.target.dataset.width);
        const height = parseInt(e.target.dataset.height);
        this.applyPreset(width, height);
      });
    });
  }

  /**
   * Inicializa o redimensionador com uma imagem
   */
  async initWithImage(imageBlob) {
    try {
      this.originalImage = await this.createImageFromBlob(imageBlob);
      this.currentWidth = this.originalImage.width;
      this.currentHeight = this.originalImage.height;
      this.aspectRatio = this.currentWidth / this.currentHeight;
      
      this.updatePreview();
      this.updateCurrentSizeInfo();
      this.updateInputs();
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar redimensionador:', error);
      return false;
    }
  }

  /**
   * Cria uma imagem a partir de um blob
   */
  createImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Atualiza o preview da imagem
   */
  updatePreview() {
    const previewImg = document.getElementById('resize-preview-img');
    if (previewImg && this.originalImage) {
      previewImg.src = this.originalImage.src;
    }
  }

  /**
   * Atualiza as informações do tamanho atual
   */
  updateCurrentSizeInfo() {
    const currentSizeElement = document.getElementById('current-size');
    if (currentSizeElement) {
      currentSizeElement.textContent = `${this.currentWidth} × ${this.currentHeight} px`;
    }
  }

  /**
   * Atualiza os inputs com os valores atuais
   */
  updateInputs() {
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    
    if (widthInput) widthInput.value = this.currentWidth;
    if (heightInput) heightInput.value = this.currentHeight;
  }

  /**
   * Manipula mudança na largura
   */
  onWidthChange(value) {
    const width = parseInt(value) || 0;
    
    if (width > 0) {
      this.currentWidth = width;
      
      if (this.maintainAspect) {
        this.currentHeight = Math.round(width / this.aspectRatio);
        const heightInput = document.getElementById('resize-height');
        if (heightInput) heightInput.value = this.currentHeight;
      }
    }
  }

  /**
   * Manipula mudança na altura
   */
  onHeightChange(value) {
    const height = parseInt(value) || 0;
    
    if (height > 0) {
      this.currentHeight = height;
      
      if (this.maintainAspect) {
        this.currentWidth = Math.round(height * this.aspectRatio);
        const widthInput = document.getElementById('resize-width');
        if (widthInput) widthInput.value = this.currentWidth;
      }
    }
  }

  /**
   * Aplica um preset de tamanho
   */
  applyPreset(width, height) {
    this.currentWidth = width;
    this.currentHeight = height;
    this.updateInputs();
  }

  /**
   * Redimensiona a imagem
   */
  async resizeImage(imageBlob) {
    if (!this.currentWidth || !this.currentHeight) {
      throw new Error('Dimensões inválidas');
    }

    try {
      // Criar canvas para redimensionamento
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = this.currentWidth;
      canvas.height = this.currentHeight;

      // Criar imagem temporária
      const img = await this.createImageFromBlob(imageBlob);

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, this.currentWidth, this.currentHeight);

      // Converter para blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha ao criar blob da imagem redimensionada'));
          }
        }, 'image/png');
      });

    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error);
      throw error;
    }
  }

  /**
   * Obtém as dimensões atuais
   */
  getCurrentDimensions() {
    return {
      width: this.currentWidth,
      height: this.currentHeight
    };
  }

  /**
   * Valida se as dimensões são válidas
   */
  validateDimensions() {
    if (!this.currentWidth || !this.currentHeight) {
      return {
        valid: false,
        message: 'Por favor, insira dimensões válidas'
      };
    }

    if (this.currentWidth < 1 || this.currentHeight < 1) {
      return {
        valid: false,
        message: 'Dimensões devem ser maiores que 0'
      };
    }

    if (this.currentWidth > 10000 || this.currentHeight > 10000) {
      return {
        valid: false,
        message: 'Dimensões muito grandes (máximo 10000px)'
      };
    }

    return {
      valid: true,
      message: 'Dimensões válidas'
    };
  }
}
