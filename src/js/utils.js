// Utilitários e funções auxiliares

/**
 * Formata o tamanho do arquivo em bytes para formato legível
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WEBP.');
  }
  
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo 10MB.');
  }
  
  return true;
}

/**
 * Cria um elemento de imagem a partir de um arquivo
 */
export function createImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      resolve({ img, url });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erro ao carregar a imagem'));
    };
    
    img.src = url;
  });
}

/**
 * Cria um link de download para um blob
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
