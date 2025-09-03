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
    
    // Handles para redimensionamento
    this.handles = [
      'top-left', 'top-right', 'bottom-left', 'bottom-right',
      'top', 'bottom', 'left', 'right', 'move'
    ];
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
    
      cropArea: this.cropArea,
      imageSize: this.imageSize,
      imageOffset: this.imageOffset
    });
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
    
  }

  /**
   * Adiciona event listeners do mouse
   */
  addEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    
    // Cursor do mouse
    this.canvas.addEventListener('mousemove', this.updateCursor.bind(this));
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
          size: blob.size,
          type: blob.type
        });
        
        const file = new File([blob], filename, { type: 'image/png' });
        
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
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.originalImage = null;
  }
}
