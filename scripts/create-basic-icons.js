const fs = require('fs');

function createBasicPNG(size) {
  // Criar um PNG mínimo válido com pixel transparente
  // Este é um PNG 1x1 válido que pode ser usado como placeholder
  const pngData = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
    0, 0, 0, 13, // IHDR chunk length
    73, 72, 68, 82, // IHDR
    0, 0, 0, 1, 0, 0, 0, 1, // width=1, height=1
    8, 6, 0, 0, 0, // bit depth=8, color type=6 (RGBA), compression=0, filter=0, interlace=0
    31, 21, 196, 132, // IHDR CRC
    0, 0, 0, 11, // IDAT chunk length
    73, 68, 65, 84, // IDAT
    120, 156, 99, 248, 15, 0, 0, 1, 0, 1, // compressed data (transparent pixel)
    53, 175, 155, 202, // IDAT CRC
    0, 0, 0, 0, // IEND chunk length
    73, 69, 78, 68, // IEND
    174, 66, 96, 130 // IEND CRC
  ]);
  return pngData;
}

// Criar ícones básicos válidos
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  try {
    const iconData = createBasicPNG(size);
    fs.writeFileSync(`icons/icon-${size}x${size}.png`, iconData);
    console.log(`Ícone básico ${size}x${size} criado`);
  } catch (error) {
    console.error(`Erro ao criar ícone ${size}x${size}:`, error.message);
  }
});

console.log('Ícones PNG básicos válidos criados com sucesso!');
