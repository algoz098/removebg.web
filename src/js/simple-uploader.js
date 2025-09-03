// Upload simples e direto - sem dependências
console.log('🔧 Carregando sistema de upload simplificado...');

class SimpleUploader {
  constructor() {
    this.setupEventListeners();
    console.log('✅ SimpleUploader inicializado');
  }
  
  setupEventListeners() {
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindEvents());
    } else {
      this.bindEvents();
    }
  }
  
  bindEvents() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    console.log('🎯 Binding eventos simples:', {
      fileInput: !!fileInput,
      uploadArea: !!uploadArea
    });
    
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        console.log('📁 SimpleUploader: Arquivo selecionado!');
        const file = e.target.files[0];
        if (file) {
          this.processFile(file);
        }
      });
    }
    
    if (uploadArea) {
      uploadArea.addEventListener('click', () => {
        console.log('🖱️ SimpleUploader: Área clicada');
        if (fileInput) fileInput.click();
      });
      
      // Drag and drop
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.background = '#e0e0ff';
      });
      
      uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.background = '';
      });
      
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.background = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.processFile(files[0]);
        }
      });
    }
  }
  
  async processFile(file) {
    try {
      console.log('🚀 SimpleUploader: Processando', file.name);
      
      // Validação simples
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }
      
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande (máximo 10MB)');
      }
      
      // Mostrar página 2
      this.showPage(2);
      
      // Criar preview
      await this.createPreview(file);
      
      console.log('✅ SimpleUploader: Processamento concluído');
      
    } catch (error) {
      console.error('❌ SimpleUploader erro:', error);
      alert(error.message);
    }
  }
  
  showPage(pageNumber) {
    console.log(`🔄 SimpleUploader: Mudando para página ${pageNumber}`);
    
    // Esconder todas as páginas
    for (let i = 1; i <= 3; i++) {
      const page = document.getElementById(`page-${i}`);
      if (page) {
        page.style.display = 'none';
      }
    }
    
    // Mostrar página desejada
    const targetPage = document.getElementById(`page-${pageNumber}`);
    if (targetPage) {
      targetPage.style.display = 'block';
      console.log(`✅ Página ${pageNumber} exibida`);
    }
    
    // Atualizar indicadores
    this.updateIndicator(pageNumber);
  }
  
  updateIndicator(currentPage) {
    for (let i = 1; i <= 3; i++) {
      const step = document.querySelector(`[data-step="${i}"]`);
      if (step) {
        step.classList.remove('active', 'completed');
        if (i < currentPage) {
          step.classList.add('completed');
        } else if (i === currentPage) {
          step.classList.add('active');
        }
      }
    }
  }
  
  async createPreview(file) {
    console.log('🖼️ SimpleUploader: Criando preview...');
    
    const preview = document.getElementById('preview');
    const imageSize = document.getElementById('image-size');
    const imageDimensions = document.getElementById('image-dimensions');
    
    if (preview) {
      const url = URL.createObjectURL(file);
      preview.src = url;
      preview.dataset.objectUrl = url;
      
      // Aguardar carregamento
      await new Promise((resolve, reject) => {
        preview.onload = resolve;
        preview.onerror = reject;
      });
      
      console.log('✅ Preview carregado');
      
      // Atualizar dimensões
      if (imageDimensions) {
        imageDimensions.textContent = `${preview.naturalWidth} x ${preview.naturalHeight}px`;
      }
    }
    
    // Atualizar tamanho
    if (imageSize) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      imageSize.textContent = `${mb} MB`;
    }
  }
}

// Inicializar uploader simples
window.simpleUploader = new SimpleUploader();

// Função global simplificada
window.forceSimpleUpload = () => {
  const fileInput = document.getElementById('file-input');
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    window.simpleUploader.processFile(fileInput.files[0]);
  } else {
    console.log('Nenhum arquivo selecionado');
  }
};

console.log('✅ Sistema de upload simplificado carregado');
console.log('💡 Use window.forceSimpleUpload() para processar arquivo selecionado');
