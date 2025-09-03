const fs = require('fs');
const { createCanvas } = require('canvas');

// Se canvas não estiver disponível, usar método alternativo
function createIcon(size) {
  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6c5ce7');
    gradient.addColorStop(1, '#a29bfe');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Texto/emoji central
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(size * 0.4)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎨', size / 2, size / 2);
    
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.log('Canvas não disponível, criando ícone básico');
    return createBasicIcon(size);
  }
}

function createBasicIcon(size) {
  // Criar um PNG mínimo válido (1x1 pixel transparente)
  const header = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
    0, 0, 0, 13, // IHDR chunk length
    73, 72, 68, 82, // IHDR
    0, 0, 0, 1, 0, 0, 0, 1, // width=1, height=1
    8, 6, 0, 0, 0, // bit depth=8, color type=6 (RGBA), compression=0, filter=0, interlace=0
    31, 21, 196, 132, // IHDR CRC
    0, 0, 0, 11, // IDAT chunk length
    73, 68, 65, 84, // IDAT
    120, 156, 99, 248, 15, 0, 0, 1, 0, 1, // compressed data
    53, 175, 155, 202, // IDAT CRC
    0, 0, 0, 0, // IEND chunk length
    73, 69, 78, 68, // IEND
    174, 66, 96, 130 // IEND CRC
  ]);
  return header;
}

// Criar ícones
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  try {
    const iconData = createIcon(size);
    fs.writeFileSync(`icons/icon-${size}x${size}.png`, iconData);
    console.log(`Ícone ${size}x${size} criado`);
  } catch (error) {
    console.error(`Erro ao criar ícone ${size}x${size}:`, error.message);
  }
});

console.log('Processo de criação de ícones concluído');
