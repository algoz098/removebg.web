#!/bin/bash

echo "🚀 Building PWA..."

# Build do projeto
npm run build

# Copiar arquivos PWA para dist
echo "📁 Copying PWA files..."
cp manifest.json dist/
cp sw.js dist/
cp pwa.js dist/
cp style.css dist/
cp -r icons dist/
cp -r screenshots dist/

# Verificar se os arquivos foram copiados
echo "✅ PWA files copied:"
ls -la dist/manifest.json dist/sw.js dist/pwa.js 2>/dev/null || echo "❌ Some PWA files missing"
ls -la dist/icons/ 2>/dev/null || echo "❌ Icons directory missing"

echo "🎉 PWA build completed!"
echo "👉 Run 'npm run preview' to test the production build"
