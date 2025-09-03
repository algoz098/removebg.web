// Gerenciamento de upload de arquivos
import { validateImageFile, formatFileSize, createImageFromFile } from './utils.js';

export class FileUploadManager {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.selectedFile = null;
    this.listenersSetup = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.listenersSetup) {
      console.warn('⚠️ Event listeners já foram configurados! Ignorando.');
      return;
    }
    
    console.log('🔧 Configurando event listeners...');
    
    // Configurar listeners imediatamente
    this.initializeListeners();
  }

  initializeListeners() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    console.log('🎯 Elementos encontrados:', {
      fileInput: !!fileInput,
      uploadArea: !!uploadArea,
      fileInputType: fileInput?.type,
      uploadAreaTagName: uploadArea?.tagName
    });
    
    if (!fileInput || !uploadArea) {
      console.error('❌ Elementos essenciais não encontrados! Configurando mesmo assim...');
      // Tentar configurar mesmo sem encontrar os elementos
      this.setupBasicListeners();
      return;
    }
    
    // Upload de arquivo
    console.log('✅ Configurando listener para file-input');
    fileInput.addEventListener('change', (e) => {
      console.log('📁 Event change disparado!', e.target.files);
      this.handleFileUpload(e);
    });
    
    // Marcar que o listener foi configurado (para testes)
    fileInput._hasChangeListener = true;
    
    // Configurar listeners de drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('dragover');
      console.log('📂 Drop event!', e.dataTransfer.files);
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.processFile(files[0]);
      }
    });
    
    // Listener para clique na área - mais robusto
    uploadArea.addEventListener('click', (e) => {
      console.log('🖱️ Upload area clicada', e.target);
      e.preventDefault();
      e.stopPropagation();
      
      // Verificar se o clique não foi no input file
      if (e.target !== fileInput) {
        console.log('🔄 Disparando click no fileInput...');
        this.triggerFileInput();
      }
    });
    
    // Fallback listener adicional para debugging
    document.addEventListener('click', (e) => {
      if (e.target && e.target.closest('.upload-area')) {
        console.log('🎯 Clique detectado na upload-area via document listener');
      }
    });
    
    this.listenersSetup = true;
    console.log('✅ Event listeners configurados');
    
    // Teste adicional para debugging no Chrome
    this.testFileInputFunctionality();
  }

  setupBasicListeners() {
    console.log('🔧 Configurando listeners básicos...');
    
    // Tentar novamente em 100ms
    setTimeout(() => {
      const fileInput = document.getElementById('file-input');
      const uploadArea = document.getElementById('upload-area');
      
      if (fileInput && uploadArea) {
        console.log('✅ Elementos encontrados no retry, configurando listeners...');
        this.initializeListeners();
      } else {
        console.error('❌ Elementos ainda não encontrados após retry');
      }
    }, 100);
  }

  triggerFileInput() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      try {
        console.log('🚀 Tentando disparar clique no file input...');
        fileInput.click();
        console.log('✅ Clique disparado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao clicar no fileInput:', error);
        // Fallback: tentar criar novo input temporário
        this.createTemporaryFileInput();
      }
    } else {
      console.error('❌ File input não encontrado');
    }
  }

  createTemporaryFileInput() {
    console.log('🆘 Criando input temporário como fallback...');
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = 'image/*';
    tempInput.style.display = 'none';
    
    tempInput.addEventListener('change', (e) => {
      console.log('📁 Arquivo selecionado via input temporário');
      this.handleFileUpload(e);
      document.body.removeChild(tempInput);
    });
    
    document.body.appendChild(tempInput);
    tempInput.click();
  }

  testFileInputFunctionality() {
    setTimeout(() => {
      const fileInput = document.getElementById('file-input');
      const uploadArea = document.getElementById('upload-area');
      
      console.log('🧪 Teste de funcionalidade:', {
        fileInputExists: !!fileInput,
        fileInputClickable: fileInput ? typeof fileInput.click === 'function' : false,
        uploadAreaExists: !!uploadArea,
        uploadAreaClickable: uploadArea ? typeof uploadArea.click === 'function' : false,
        fileInputVisible: fileInput ? getComputedStyle(fileInput).display !== 'none' : false,
        uploadAreaVisible: uploadArea ? getComputedStyle(uploadArea).display !== 'none' : false
      });
      
      if (fileInput) {
        // Teste de clique programático
        console.log('🔬 Testando clique programático no file input...');
        try {
          fileInput.addEventListener('click', () => {
            console.log('🎯 File input clique detectado via teste!');
          }, { once: true });
        } catch (error) {
          console.error('❌ Erro no teste de clique:', error);
        }
      }
    }, 1000);
  }

  handleFileUpload(event) {
    console.log('🎯 handleFileUpload chamado!', event);
    console.log('📋 Event target:', event.target);
    console.log('📋 Event target files:', event.target.files);
    console.log('📋 Files length:', event.target.files ? event.target.files.length : 'undefined');
    
    const file = event.target.files[0];
    console.log('📁 Arquivo selecionado:', file);
    
    if (file) {
      console.log('✅ Arquivo encontrado, processando...');
      this.processFile(file);
    } else {
      console.error('❌ Nenhum arquivo encontrado no event.target.files[0]');
      console.error('🔍 Files array:', event.target.files);
    }
  }

  async processFile(file) {
    try {
      console.log('🚀 INÍCIO processFile - arquivo:', file.name, file.size);
      
      console.log('📤 Carregando imagem...');
      console.log('🍞 Loading iniciado');
      
      console.log('🔍 Validando arquivo...');
      validateImageFile(file);
      console.log('✅ Arquivo validado com sucesso');
      
      this.selectedFile = file;
      console.log('💾 Arquivo armazenado em this.selectedFile');
      
      console.log('🔄 Chamando uiManager.showPage(2)...');
      this.uiManager.showPage(2);
      console.log('✅ showPage(2) chamado com sucesso');
      
      console.log('⏳ Aguardando 100ms...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🖼️ Chamando showPreview...');
      await this.showPreview(file);
      console.log('✅ showPreview concluído');
      
      console.log(' Imagem carregada com sucesso!');
      this.uiManager.updateStatus('✅ Imagem carregada com sucesso!');
      
      console.log('🎉 SUCESSO - processFile concluído');
      
    } catch (error) {
      console.error('💥 ERRO em processFile:', error);
      console.error('📊 Stack trace:', error.stack);
      console.error('🔍 Error message:', error.message);
      console.error('🔍 Error name:', error.name);
      this.uiManager.updateStatus(`❌ ${error.message}`, 'error');
      throw error; // Re-throw para que o erro seja propagado
    }
  }

  async showPreview(file) {
    try {
      console.log('🖼️ Criando preview para:', file.name);
      
      const { img, url } = await createImageFromFile(file);
      console.log('✅ Imagem criada:', { width: img.width, height: img.height, url: url.substring(0, 50) + '...' });
      
      const preview = document.getElementById('preview');
      const imageSize = document.getElementById('image-size');
      const imageDimensions = document.getElementById('image-dimensions');
      
      console.log('🎯 Elementos encontrados:', {
        preview: !!preview,
        imageSize: !!imageSize,
        imageDimensions: !!imageDimensions
      });
      
      if (preview) {
        console.log('🖼️ Definindo src da imagem preview...');
        preview.src = url;
        preview.dataset.objectUrl = url;
        
        await new Promise((resolve, reject) => {
          preview.onload = () => {
            console.log('✅ Imagem preview carregada com sucesso');
            resolve();
          };
          preview.onerror = (error) => {
            console.error('❌ Erro ao carregar preview:', error);
            reject(error);
          };
        });
      } else {
        console.error('❌ Elemento #preview não encontrado!');
      }
      
      if (imageSize) {
        const formattedSize = formatFileSize(file.size);
        imageSize.textContent = formattedSize;
        console.log('📏 Tamanho definido:', formattedSize);
      }
      
      if (imageDimensions) {
        const dimensions = `${img.width} x ${img.height}px`;
        imageDimensions.textContent = dimensions;
        console.log('📐 Dimensões definidas:', dimensions);
      }
      
      console.log('✅ Preview configurado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao exibir preview:', error);
      throw new Error('Erro ao exibir preview da imagem');
    }
  }

  getSelectedFile() {
    return this.selectedFile;
  }

  setSelectedFile(file) {
    this.selectedFile = file;
  }

  clearSelectedFile() {
    this.selectedFile = null;
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.value = '';
    }
    
    const preview = document.getElementById('preview');
    if (preview && preview.dataset.objectUrl) {
      URL.revokeObjectURL(preview.dataset.objectUrl);
      preview.src = '';
      delete preview.dataset.objectUrl;
    }
  }
}