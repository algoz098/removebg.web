# RemoveBG WebApp

Webapp para remoção automática de fundo de imagens totalmente no navegador usando @imgly/background-removal.

## Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev      # Iniciar servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

### Testes
```bash
npm test         # Executar testes E2E (headless)
npm run test:headed  # Testes com interface gráfica
npm run test:ui      # Interface de debug interativa
npm run test:debug   # Debug passo a passo
npm run test:install # Instalar browsers do Playwright
npm run test:clean   # Limpar resultados de teste
npm run test:report  # Ver relatório dos testes
```

### Build para Produção
```bash
npm run build:prod  # Build completo com PWA
npm run clean        # Limpar diretório dist
```

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Build**: Vite
- **Testes**: Playwright
- **AI**: @imgly/background-removal
- **PWA**: Service Worker + Manifest

## Funcionalidades

- ✅ Remoção de fundo automática
- ✅ Upload via clique ou drag & drop
- ✅ Cropping de imagem
- ✅ Download em PNG
- ✅ Progressive Web App
- ✅ Processamento totalmente local (sem backend)

## Desenvolvimento

1. **Instalar dependências**:
   ```bash
   npm install
   npm run test:install
   ```

2. **Iniciar desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Executar testes**:
   ```bash
   npm test
   ```

4. **Build para produção**:
   ```bash
   npm run build:prod
   ```

## Licença

MIT
