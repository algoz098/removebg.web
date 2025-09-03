// Script para gerar ícones do PWA programaticamente
function generateIcons() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  sizes.forEach(size => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = size;
    canvas.height = size;
    
    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6c5ce7');
    gradient.addColorStop(1, '#a29bfe');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Adicionar bordas arredondadas
    const radius = size * 0.1;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    // Adicionar ícone central
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎨', size / 2, size / 2);
    
    // Converter para blob e fazer download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `icon-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  });
}

// Executar apenas se estiver no console do navegador
if (typeof window !== 'undefined') {
  console.log('Execute generateIcons() para gerar os ícones');
}
