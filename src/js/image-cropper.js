// Image Cropper - Ferramenta de corte de imagem
export class ImageCropper {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.originalImage = null;
    this.cropArea = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.isDragging = false;
    this.dragHandle = null;
    this.lastMousePos = { x: 0, y: 0 };
    this.scale = 1;
    this.imageOffset = { x: 0, y: 0 };
    this.imageSize = { width: 0, height: 0 };
    this.isActive = false;
    this.drawPending = false; // Para controlar requestAnimationFrame
    this.isUpdatingInputs = false; // Para evitar loop infinito de atualizações
    
    // Handles para redimensionamento
    this.handles = [
      'top-left', 'top-right', 'bottom-left', 'bottom-right',
      'top', 'bottom', 'left', 'right', 'move'
    ];

    // Bind das funções para os event listeners
    this.boundOnDimensionInputChange = this.onDimensionInputChange.bind(this);
    this.boundValidateDimensionInput = this.validateDimensionInput.bind(this);
  }

  /**
   * Carrega uma imagem a partir de um File e inicializa o cropper
   */
  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const container = document.getElementById('crop-preview');
        if (!container) {
          reject(new Error('Container crop-preview não encontrado'));
          return;
        }
        
        try {
          this.init(img, container);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Versão assíncrona otimizada do loadImage
   */
  async loadImageAsync(file) {
    const img = await this.createImageFromFile(file);
    const container = document.getElementById('crop-preview');
    
    if (!container) {
      throw new Error('Container crop-preview não encontrado');
    }
    
    // Usar requestAnimationFrame para dividir o trabalho
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Inicializar de forma assíncrona
    await this.initAsync(img, container);
  }

  /**
   * Cria uma imagem a partir de um arquivo de forma assíncrona
   */
  async createImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Inicializa o cropper com uma imagem
   */
  init(imageElement, containerElement) {
    this.originalImage = imageElement;
    this.isActive = true;
    
    // Criar canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'crop-canvas';
    this.ctx = this.canvas.getContext('2d');
    
    // Configurar canvas - usar dimensões responsivas
    const containerRect = containerElement.getBoundingClientRect();
    const canvasWidth = Math.min(containerRect.width || 600, 600);
    const canvasHeight = Math.min(canvasWidth * 0.75, 450); // Manter aspect ratio 4:3
    
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    
    // Calcular escala e posição da imagem
    this.calculateImageDimensions();
    
    // Inicializar área de corte (toda a imagem)
    this.resetCropArea();
    
    // Adicionar event listeners
    this.addEventListeners();
    
    // Substituir conteúdo do container pelo canvas
    containerElement.innerHTML = '';
    containerElement.appendChild(this.canvas);
    
    // Desenhar inicial
    this.draw();
    
    console.log('✂️ ImageCropper inicializado', {
      canvasSize: `${this.canvas.width}x${this.canvas.height}`,
      imageSize: `${this.imageSize.width}x${this.imageSize.height}`,
      scale: this.scale
    });
    
    return this;
  }

  /**
   * Versão assíncrona do init que não bloqueia a UI
   */
  async initAsync(imageElement, containerElement) {
    this.originalImage = imageElement;
    this.isActive = true;
    
    // Etapa 1: Criar canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'crop-canvas';
    this.ctx = this.canvas.getContext('2d');
    
    // Permitir que a UI respire
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Etapa 2: Configurar dimensões
    const containerRect = containerElement.getBoundingClientRect();
    const canvasWidth = Math.min(containerRect.width || 600, 600);
    const canvasHeight = Math.min(canvasWidth * 0.75, 450);
    
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    
    // Permitir que a UI respire
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Etapa 3: Calcular dimensões da imagem
    this.calculateImageDimensions();
    this.resetCropArea();
    
    // Permitir que a UI respire
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Etapa 4: Configurar interface
    this.addEventListeners();
    containerElement.innerHTML = '';
    containerElement.appendChild(this.canvas);
    
    // Permitir que a UI respire antes do desenho final
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Etapa 5: Desenho final
    this.draw();
    
    console.log('✂️ ImageCropper inicializado assíncronamente', {
      canvasSize: `${this.canvas.width}x${this.canvas.height}`,
      imageSize: `${this.imageSize.width}x${this.imageSize.height}`,
      scale: this.scale
    });
    
    return this;
  }

  /**
   * Calcula as dimensões e escala da imagem para caber no canvas
   */
  calculateImageDimensions() {
    const canvasAspect = this.canvas.width / this.canvas.height;
    const imageAspect = this.originalImage.naturalWidth / this.originalImage.naturalHeight;
    
    if (imageAspect > canvasAspect) {
      // Imagem mais larga - ajustar pela largura
      this.imageSize.width = this.canvas.width * 0.9; // 90% da largura
      this.imageSize.height = this.imageSize.width / imageAspect;
    } else {
      // Imagem mais alta - ajustar pela altura
      this.imageSize.height = this.canvas.height * 0.9; // 90% da altura
      this.imageSize.width = this.imageSize.height * imageAspect;
    }
    
    // Centralizar imagem
    this.imageOffset.x = (this.canvas.width - this.imageSize.width) / 2;
    this.imageOffset.y = (this.canvas.height - this.imageSize.height) / 2;
    
    // Calcular escala
    this.scale = this.imageSize.width / this.originalImage.naturalWidth;
  }

  /**
   * Reseta a área de corte para toda a imagem
   */
  resetCropArea() {
    // Inicializar com área menor (80% da imagem) para demonstrar o corte
    const cropWidth = this.imageSize.width * 0.8;
    const cropHeight = this.imageSize.height * 0.8;
    const cropX = this.imageOffset.x + (this.imageSize.width - cropWidth) / 2;
    const cropY = this.imageOffset.y + (this.imageSize.height - cropHeight) / 2;
    
    this.cropArea = {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    };
    
    console.log('🔄 Área de corte resetada:', {
      cropArea: this.cropArea,
      imageSize: this.imageSize,
      imageOffset: this.imageOffset
    });
    
    // Atualizar dimensões na UI se estiver ativa
    if (this.isActive) {
      this.updateCropDimensions();
      this.draw();
    }
  }

  /**
   * Define a área de corte para toda a imagem
   */
  setFullCropArea() {
    this.cropArea = {
      x: this.imageOffset.x,
      y: this.imageOffset.y,
      width: this.imageSize.width,
      height: this.imageSize.height
    };
    
    console.log('📐 Área de corte definida para imagem completa:', this.cropArea);
    
    // Atualizar dimensões na UI se estiver ativa
    if (this.isActive) {
      this.updateCropDimensions();
      this.draw();
    }
  }

  /**
   * Adiciona event listeners do mouse e dos inputs de dimensão
   */
  addEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    
    // Cursor do mouse
    this.canvas.addEventListener('mousemove', this.updateCursor.bind(this));
    
    // Event listeners dos inputs de dimensão
    this.addDimensionInputListeners();
  }

  /**
   * Adiciona event listeners para os inputs de dimensão
   */
  addDimensionInputListeners() {
    const widthInput = document.getElementById('crop-width');
    const heightInput = document.getElementById('crop-height');
    
    if (widthInput && heightInput) {
      widthInput.addEventListener('input', this.boundOnDimensionInputChange);
      heightInput.addEventListener('input', this.boundOnDimensionInputChange);
      
      // Eventos de validação
      widthInput.addEventListener('blur', this.boundValidateDimensionInput);
      heightInput.addEventListener('blur', this.boundValidateDimensionInput);
    }
  }

  /**
   * Manipula mudanças nos inputs de dimensão
   */
  onDimensionInputChange() {
    if (this.isUpdatingInputs) return;
    
    const widthInput = document.getElementById('crop-width');
    const heightInput = document.getElementById('crop-height');
    
    if (!widthInput || !heightInput) return;
    
    const newWidth = parseInt(widthInput.value) || 0;
    const newHeight = parseInt(heightInput.value) || 0;
    
    // Validar se as dimensões são válidas
    if (newWidth <= 0 || newHeight <= 0) return;
    
    // Calcular dimensões máximas da imagem original
    const maxRealWidth = Math.round(this.imageSize.width / this.scale);
    const maxRealHeight = Math.round(this.imageSize.height / this.scale);
    
    // Limitar as dimensões ao tamanho da imagem
    const limitedWidth = Math.min(newWidth, maxRealWidth);
    const limitedHeight = Math.min(newHeight, maxRealHeight);
    
    // Se os valores foram limitados, atualizar os inputs
    if (limitedWidth !== newWidth || limitedHeight !== newHeight) {
      this.isUpdatingInputs = true;
      widthInput.value = limitedWidth;
      heightInput.value = limitedHeight;
      this.isUpdatingInputs = false;
    }
    
    // Calcular novas dimensões do canvas
    const canvasWidth = limitedWidth * this.scale;
    const canvasHeight = limitedHeight * this.scale;
    
    this.updateCropAreaDimensions(canvasWidth, canvasHeight);
  }

  /**
   * Valida e corrige os inputs de dimensão
   */
  validateDimensionInput(e) {
    const input = e.target;
    const value = parseInt(input.value);
    
    if (isNaN(value) || value <= 0) {
      // Restaurar valor anterior
      this.updateCropDimensions();
    }
  }

  /**
   * Atualiza as dimensões da área de corte mantendo a posição centralizada
   */
  updateCropAreaDimensions(newWidth, newHeight) {
    const currentCenterX = this.cropArea.x + this.cropArea.width / 2;
    const currentCenterY = this.cropArea.y + this.cropArea.height / 2;
    
    // Calcular nova posição para manter o centro
    const newX = currentCenterX - newWidth / 2;
    const newY = currentCenterY - newHeight / 2;
    
    // Ajustar posição para manter dentro dos limites da imagem
    const adjustedX = Math.max(this.imageOffset.x, Math.min(newX, this.imageOffset.x + this.imageSize.width - newWidth));
    const adjustedY = Math.max(this.imageOffset.y, Math.min(newY, this.imageOffset.y + this.imageSize.height - newHeight));
    
    // Atualizar área de corte
    this.cropArea = {
      x: adjustedX,
      y: adjustedY,
      width: newWidth,
      height: newHeight
    };
    
    // Atualizar dimensões nos inputs (sem disparar eventos)
    this.updateCropDimensions();
    
    // Redesenhar
    this.draw();
  }

  /**
   * Evento de mouse down
   */
  onMouseDown(e) {
    if (!this.isActive) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.lastMousePos = { x, y };
    this.dragHandle = this.getHandleAt(x, y);
    
    if (this.dragHandle) {
      this.isDragging = true;
      this.canvas.style.cursor = this.getCursorForHandle(this.dragHandle);
    }
  }

  /**
   * Evento de mouse move
   */
  onMouseMove(e) {
    if (!this.isActive) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.isDragging && this.dragHandle) {
      const deltaX = x - this.lastMousePos.x;
      const deltaY = y - this.lastMousePos.y;
      
      this.updateCropArea(this.dragHandle, deltaX, deltaY);
      this.updateCropDimensions();
      this.draw();
    }
    
    this.lastMousePos = { x, y };
  }

  /**
   * Evento de mouse up
   */
  onMouseUp() {
    this.isDragging = false;
    this.dragHandle = null;
    this.canvas.style.cursor = 'default';
  }

  /**
   * Atualiza o cursor baseado na posição do mouse
   */
  updateCursor(e) {
    if (!this.isActive || this.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const handle = this.getHandleAt(x, y);
    this.canvas.style.cursor = this.getCursorForHandle(handle);
  }

  /**
   * Identifica qual handle está na posição do mouse
   */
  getHandleAt(x, y) {
    const handleSize = 10;
    const { x: cropX, y: cropY, width, height } = this.cropArea;
    
    // Handles dos cantos
    if (this.isPointInHandle(x, y, cropX, cropY, handleSize)) return 'top-left';
    if (this.isPointInHandle(x, y, cropX + width, cropY, handleSize)) return 'top-right';
    if (this.isPointInHandle(x, y, cropX, cropY + height, handleSize)) return 'bottom-left';
    if (this.isPointInHandle(x, y, cropX + width, cropY + height, handleSize)) return 'bottom-right';
    
    // Handles das bordas
    if (this.isPointInHandle(x, y, cropX + width/2, cropY, handleSize)) return 'top';
    if (this.isPointInHandle(x, y, cropX + width/2, cropY + height, handleSize)) return 'bottom';
    if (this.isPointInHandle(x, y, cropX, cropY + height/2, handleSize)) return 'left';
    if (this.isPointInHandle(x, y, cropX + width, cropY + height/2, handleSize)) return 'right';
    
    // Área de movimento
    if (x >= cropX && x <= cropX + width && y >= cropY && y <= cropY + height) {
      return 'move';
    }
    
    return null;
  }

  /**
   * Verifica se um ponto está dentro de um handle
   */
  isPointInHandle(x, y, handleX, handleY, size) {
    return x >= handleX - size && x <= handleX + size &&
           y >= handleY - size && y <= handleY + size;
  }

  /**
   * Retorna o cursor apropriado para cada handle
   */
  getCursorForHandle(handle) {
    const cursors = {
      'top-left': 'nw-resize',
      'top-right': 'ne-resize',
      'bottom-left': 'sw-resize',
      'bottom-right': 'se-resize',
      'top': 'n-resize',
      'bottom': 's-resize',
      'left': 'w-resize',
      'right': 'e-resize',
      'move': 'move'
    };
    
    return cursors[handle] || 'default';
  }

  /**
   * Atualiza a área de corte baseado no handle arrastado
   */
  updateCropArea(handle, deltaX, deltaY) {
    const minSize = 50; // Tamanho mínimo da área de corte
    let { x, y, width, height } = this.cropArea;
    
    // Limites da imagem
    const minX = this.imageOffset.x;
    const minY = this.imageOffset.y;
    const maxX = this.imageOffset.x + this.imageSize.width;
    const maxY = this.imageOffset.y + this.imageSize.height;
    
    switch (handle) {
      case 'top-left':
        x = Math.max(minX, Math.min(x + deltaX, x + width - minSize));
        y = Math.max(minY, Math.min(y + deltaY, y + height - minSize));
        width = this.cropArea.x + this.cropArea.width - x;
        height = this.cropArea.y + this.cropArea.height - y;
        break;
        
      case 'top-right':
        y = Math.max(minY, Math.min(y + deltaY, y + height - minSize));
        width = Math.max(minSize, Math.min(maxX - x, width + deltaX));
        height = this.cropArea.y + this.cropArea.height - y;
        break;
        
      case 'bottom-left':
        x = Math.max(minX, Math.min(x + deltaX, x + width - minSize));
        width = this.cropArea.x + this.cropArea.width - x;
        height = Math.max(minSize, Math.min(maxY - y, height + deltaY));
        break;
        
      case 'bottom-right':
        width = Math.max(minSize, Math.min(maxX - x, width + deltaX));
        height = Math.max(minSize, Math.min(maxY - y, height + deltaY));
        break;
        
      case 'top':
        y = Math.max(minY, Math.min(y + deltaY, y + height - minSize));
        height = this.cropArea.y + this.cropArea.height - y;
        break;
        
      case 'bottom':
        height = Math.max(minSize, Math.min(maxY - y, height + deltaY));
        break;
        
      case 'left':
        x = Math.max(minX, Math.min(x + deltaX, x + width - minSize));
        width = this.cropArea.x + this.cropArea.width - x;
        break;
        
      case 'right':
        width = Math.max(minSize, Math.min(maxX - x, width + deltaX));
        break;
        
      case 'move':
        const newX = x + deltaX;
        const newY = y + deltaY;
        
        if (newX >= minX && newX + width <= maxX) {
          x = newX;
        }
        if (newY >= minY && newY + height <= maxY) {
          y = newY;
        }
        break;
    }
    
    this.cropArea = { x, y, width, height };
  }

  /**
   * Desenha a imagem e a área de corte
   */
  draw() {
    // Usar requestAnimationFrame para suavizar renderização
    if (this.drawPending) return;
    
    this.drawPending = true;
    requestAnimationFrame(() => {
      this.performDraw();
      this.drawPending = false;
    });
  }

  /**
   * Realiza o desenho real do canvas
   */
  performDraw() {
    // Limpar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar imagem
    this.ctx.drawImage(
      this.originalImage,
      this.imageOffset.x,
      this.imageOffset.y,
      this.imageSize.width,
      this.imageSize.height
    );
    
    // Desenhar overlay escuro
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Limpar área de corte (mostrar imagem original)
    this.ctx.clearRect(
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height
    );
    
    // Redesenhar só a área da imagem que está sendo cortada
    const sourceX = (this.cropArea.x - this.imageOffset.x) / this.scale;
    const sourceY = (this.cropArea.y - this.imageOffset.y) / this.scale;
    const sourceWidth = this.cropArea.width / this.scale;
    const sourceHeight = this.cropArea.height / this.scale;
    
    this.ctx.drawImage(
      this.originalImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height
    );
    
    // Desenhar bordas da área de corte
    this.drawCropBorder();
    
    // Desenhar handles
    this.drawHandles();
    
    // Atualizar informações das dimensões
    this.updateCropDimensions();
  }

  /**
   * Atualiza as informações das dimensões da área de corte na UI
   */
  updateCropDimensions() {
    const widthInput = document.getElementById('crop-width');
    const heightInput = document.getElementById('crop-height');
    
    if (widthInput && heightInput) {
      // Calcular dimensões reais da área de corte
      const realWidth = Math.round(this.cropArea.width / this.scale);
      const realHeight = Math.round(this.cropArea.height / this.scale);
      
      // Calcular dimensões máximas da imagem
      const maxRealWidth = Math.round(this.imageSize.width / this.scale);
      const maxRealHeight = Math.round(this.imageSize.height / this.scale);
      
      // Atualizar inputs sem disparar eventos de mudança
      this.isUpdatingInputs = true;
      widthInput.value = realWidth;
      heightInput.value = realHeight;
      widthInput.max = maxRealWidth;
      heightInput.max = maxRealHeight;
      this.isUpdatingInputs = false;
    }
  }

  /**
   * Desenha a borda da área de corte
   */
  drawCropBorder() {
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    this.ctx.strokeRect(
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height
    );
    
    this.ctx.setLineDash([]);
  }

  /**
   * Desenha os handles de redimensionamento
   */
  drawHandles() {
    const handleSize = 8;
    const { x, y, width, height } = this.cropArea;
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#6c5ce7';
    this.ctx.lineWidth = 2;
    
    // Handles dos cantos
    this.drawHandle(x, y, handleSize);
    this.drawHandle(x + width, y, handleSize);
    this.drawHandle(x, y + height, handleSize);
    this.drawHandle(x + width, y + height, handleSize);
    
    // Handles das bordas
    this.drawHandle(x + width/2, y, handleSize);
    this.drawHandle(x + width/2, y + height, handleSize);
    this.drawHandle(x, y + height/2, handleSize);
    this.drawHandle(x + width, y + height/2, handleSize);
  }

  /**
   * Desenha um handle individual
   */
  drawHandle(x, y, size) {
    this.ctx.fillRect(x - size/2, y - size/2, size, size);
    this.ctx.strokeRect(x - size/2, y - size/2, size, size);
  }

  /**
   * Obtém a imagem cortada como um novo elemento Image
   */
  getCroppedImage() {
    return new Promise((resolve) => {
      // Calcular coordenadas no contexto da imagem original
      const sourceX = (this.cropArea.x - this.imageOffset.x) / this.scale;
      const sourceY = (this.cropArea.y - this.imageOffset.y) / this.scale;
      const sourceWidth = this.cropArea.width / this.scale;
      const sourceHeight = this.cropArea.height / this.scale;
      
      // Criar canvas temporário para a imagem cortada
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      tempCanvas.width = sourceWidth;
      tempCanvas.height = sourceHeight;
      
      // Desenhar área cortada
      tempCtx.drawImage(
        this.originalImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight
      );
      
      // Converter para blob e criar nova imagem
      tempCanvas.toBlob((blob) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          resolve(img);
        };
        img.src = URL.createObjectURL(blob);
      });
    });
  }

  /**
   * Obtém os dados da área cortada como File
   */
  getCroppedFile(filename = 'cropped-image.png') {
    return new Promise((resolve) => {
      console.log('🔍 getCroppedFile - Dados do crop:', {
        cropArea: this.cropArea,
        imageOffset: this.imageOffset,
        scale: this.scale,
        imageSize: this.imageSize,
        originalImageSize: {
          width: this.originalImage.naturalWidth,
          height: this.originalImage.naturalHeight
        }
      });
      
      // Calcular coordenadas no contexto da imagem original
      const sourceX = (this.cropArea.x - this.imageOffset.x) / this.scale;
      const sourceY = (this.cropArea.y - this.imageOffset.y) / this.scale;
      const sourceWidth = this.cropArea.width / this.scale;
      const sourceHeight = this.cropArea.height / this.scale;
      
      console.log('📐 Coordenadas do corte:', {
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight
      });
      
      // Criar canvas temporário para a imagem cortada
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      tempCanvas.width = sourceWidth;
      tempCanvas.height = sourceHeight;
      
      console.log('🖼️ Canvas temporário criado:', {
        width: tempCanvas.width,
        height: tempCanvas.height
      });
      
      // Desenhar área cortada
      tempCtx.drawImage(
        this.originalImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight
      );
      
      // Converter para blob e criar File
      tempCanvas.toBlob((blob) => {
        console.log('💾 Blob criado:', {
          size: blob.size,
          type: blob.type
        });
        
        const file = new File([blob], filename, { type: 'image/png' });
        
        console.log('📄 File criado:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
        
        resolve(file);
      });
    });
  }

  /**
   * Destrói o cropper e libera recursos
   */
  destroy() {
    this.isActive = false;
    
    // Remover event listeners dos inputs
    this.removeDimensionInputListeners();
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.originalImage = null;
  }

  /**
   * Remove event listeners dos inputs de dimensão
   */
  removeDimensionInputListeners() {
    const widthInput = document.getElementById('crop-width');
    const heightInput = document.getElementById('crop-height');
    
    if (widthInput && heightInput) {
      widthInput.removeEventListener('input', this.boundOnDimensionInputChange);
      heightInput.removeEventListener('input', this.boundOnDimensionInputChange);
      widthInput.removeEventListener('blur', this.boundValidateDimensionInput);
      heightInput.removeEventListener('blur', this.boundValidateDimensionInput);
    }
  }
}
