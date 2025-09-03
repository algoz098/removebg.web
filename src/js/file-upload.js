// Gerenciamento de upload de arquivos
import { validateImageFile, formatFileSize, createImageFromFile } from './utils.js';
import { toast } from './toast.js';

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
    
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    console.log('🎯 Elementos encontrados:', {
      fileInput: !!fileInput,
      uploadArea: !!uploadArea
    });
    
    // Upload de arquivo
    if (fileInput) {
      console.log('✅ Configurando listener para file-input');
      fileInput.addEventListener('change', (e) => {
        console.log('📁 Event change disparado!', e.target.files);
        this.handleFileUpload(e);
      });
    } else {
      console.error('❌ Elemento #file-input não encontrado!');
    }
    
    // Drag and drop
    if (uploadArea) {
      console.log('✅ Configurando listeners para upload-area');
      
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });

      uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        console.log('📂 Drop event!', e.dataTransfer.files);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.processFile(files[0]);
        }
      });
      
      // Listener para clique na área
      uploadArea.addEventListener('click', (e) => {
        console.log('🖱️ Upload area clicada');
        e.preventDefault();
        
        if (fileInput) {
          console.log('🔄 Disparando click no fileInput...');
          fileInput.click();
        }
      });
    } else {
      console.error('❌ Elemento #upload-area não encontrado!');
    }
    
    this.listenersSetup = true;
    console.log('✅ Event listeners configurados');
  }

  handleFileUpload(event) {
    console.log('🎯 handleFileUpload chamado!', event);
    const file = event.target.files[0];
    console.log('📁 Arquivo selecionado:', file);
    if (file) {
      console.log('✅ Arquivo encontrado, processando...');
      this.processFile(file);
    } else {
      console.error('❌ Nenhum arquivo encontrado no event.target.files[0]');
    }
  }

  async processFile(file) {
    try {
      console.log('🚀 INÍCIO processFile - arquivo:', file.name, file.size);
      
      const loadingToast = toast.loading('📤 Carregando imagem...');
      console.log('🍞 Toast de loading criado');
      
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
      
      toast.remove(loadingToast);
      console.log('🗑️ Toast de loading removido');
      
      toast.success('📸 Imagem carregada com sucesso!');
      this.uiManager.updateStatus('✅ Imagem carregada com sucesso!');
      
      console.log('🎉 SUCESSO - processFile concluído');
      
    } catch (error) {
      console.error('💥 ERRO em processFile:', error);
      console.error('📊 Stack trace:', error.stack);
      toast.error(`❌ ${error.message}`);
      this.uiManager.updateStatus(`❌ ${error.message}`, 'error');
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