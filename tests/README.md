# Testes E2E - RemoveBG Web App

Sistema de testes End-to-End (E2E) configurado com Playwright para testar o fluxo completo da aplicação RemoveBG.

## 📋 Índice

- [Instalação](#instalação)
- [Estrutura](#estrutura)
- [Comandos](#comandos)
- [Escrevendo Testes](#escrevendo-testes)
- [Page Objects](#page-objects)
- [Fixtures](#fixtures)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

## 🚀 Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Instalar navegadores do Playwright
```bash
npm run test:install
# ou
npx playwright install
```

### 3. Adicionar imagens de teste
Coloque imagens de teste na pasta `tests/fixtures/images/`:
- `test-image.jpg` - Imagem padrão (800x600px recomendado)
- `large-image.jpg` - Imagem grande (4000x3000px+)
- `small-image.png` - Imagem pequena (100x100px)

## 📁 Estrutura

```
tests/
├── e2e/                    # Arquivos de teste
│   └── example-structure.spec.js
├── page-objects/           # Page Object Models
│   ├── MainPage.js
│   └── AboutPage.js
├── utils/                  # Utilitários e helpers
│   └── test-helpers.js
├── fixtures/               # Dados de teste
│   ├── images/            # Imagens para testes
│   └── README.md
├── config/                 # Configurações
│   ├── global-setup.js
│   ├── global-teardown.js
│   └── test-config.js
└── commands.js            # Comandos personalizados
```

## 🎮 Comandos

### Comandos básicos (package.json)
```bash
# Executar todos os testes
npm run test:e2e

# Interface visual de testes
npm run test:e2e:ui

# Modo debug
npm run test:e2e:debug

# Com navegador visível
npm run test:e2e:headed

# Instalar navegadores
npm run test:e2e:install
```

### Comandos personalizados
```bash
# Ajuda completa
node tests/commands.js help

# Executar arquivo específico
node tests/commands.js file upload.spec.js

# Executar suíte específica
node tests/commands.js suite "Upload e Processamento"

# Executar em navegador específico
node tests/commands.js browser chromium

# Gerar relatório
node tests/commands.js report

# Limpar resultados anteriores
node tests/commands.js clean

# Verificar configuração
node tests/commands.js check
```

## ✍️ Escrevendo Testes

### Estrutura básica de um teste
```javascript
import { test, expect } from '@playwright/test';
import { MainPage } from '../page-objects/MainPage.js';
import { uploadTestImage, waitForImageProcessing } from '../utils/test-helpers.js';

test.describe('Nome da Suíte', () => {
  test('deve fazer algo específico', async ({ page }) => {
    const mainPage = new MainPage(page);
    
    // Navegar para a página
    await mainPage.goto();
    
    // Interagir com elementos
    await uploadTestImage(page);
    
    // Verificar resultado
    expect(await mainPage.isImageUploaded()).toBe(true);
  });
});
```

### Suítes de teste recomendadas
- **Upload e Processamento**: Testes de upload de imagens e remoção de fundo
- **Funcionalidade de Crop**: Testes da ferramenta de recorte
- **Funcionalidade de Resize**: Testes de redimensionamento
- **Navegação**: Testes de navegação entre páginas
- **Responsividade**: Testes em diferentes dispositivos
- **PWA Features**: Testes de funcionalidades PWA
- **Performance**: Testes de performance
- **Acessibilidade**: Testes de acessibilidade

## 🎭 Page Objects

Os Page Objects encapsulam a interação com elementos da UI:

```javascript
// Exemplo de uso
const mainPage = new MainPage(page);
await mainPage.goto();
await mainPage.uploadImage('path/to/image.jpg');
await mainPage.processImage();
expect(await mainPage.isImageProcessed()).toBe(true);
```

### MainPage
- `goto()` - Navegar para home
- `uploadImage(path)` - Upload de imagem
- `processImage()` - Processar imagem
- `downloadImage()` - Download resultado
- `startCrop()` - Iniciar crop
- `startResize()` - Iniciar resize

### AboutPage
- `goto()` - Navegar para sobre
- `goBack()` - Voltar para home
- `getTitle()` - Obter título da página

## 📦 Fixtures

### Imagens de teste
Coloque imagens na pasta `tests/fixtures/images/`:

```
tests/fixtures/images/
├── test-image.jpg      # Imagem padrão
├── large-image.jpg     # Imagem grande
├── small-image.png     # Imagem pequena
└── invalid-image.txt   # Arquivo inválido
```

### Utilitários disponíveis
- `uploadTestImage()` - Upload automático
- `waitForImageProcessing()` - Aguardar processamento
- `verifyImageProcessed()` - Verificar resultado
- `downloadAndVerifyImage()` - Download e verificação
- `testResponsiveness()` - Teste de responsividade
- `verifyPWAFeatures()` - Verificar PWA

## 🔄 CI/CD

### GitHub Actions
O arquivo `.github/workflows/e2e-tests.yml` configura:

- **Testes principais**: Node.js 18 e 20
- **Testes de acessibilidade**: Separados
- **Testes de performance**: Separados  
- **Cross-browser**: Chromium, Firefox, WebKit

### Variáveis de ambiente
- `CI=true` - Modo CI
- `NODE_ENV=ci` - Configuração CI

## 🛠️ Troubleshooting

### Problemas comuns

1. **Navegadores não instalados**
   ```bash
   npx playwright install
   ```

2. **Imagens de teste não encontradas**
   - Verifique se existem imagens em `tests/fixtures/images/`
   - Consulte `tests/fixtures/README.md`

3. **Testes lentos**
   - Use `--workers=1` para debug
   - Verifique timeouts em `playwright.config.js`

4. **Falhas intermitentes**
   - Aumente timeouts
   - Use `--retries=2`
   - Verifique seletores estáveis

### Debug

```bash
# Modo debug com pausa
npm run test:e2e:debug

# Com navegador visível
npm run test:e2e:headed

# Interface visual
npm run test:e2e:ui

# Trace viewer
npx playwright show-trace trace.zip
```

### Relatórios

```bash
# Gerar e abrir relatório HTML
npx playwright show-report

# Ver resultados de CI
# Artifacts ficam disponíveis no GitHub Actions
```

## 📚 Recursos Adicionais

- [Documentação do Playwright](https://playwright.dev/)
- [Guia de Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## 🤝 Contribuindo

1. Escreva testes para novas funcionalidades
2. Use Page Objects para interações
3. Adicione utilitários reutilizáveis
4. Mantenha testes independentes
5. Use dados de teste apropriados
6. Documente testes complexos

---

**Próximos passos:**
1. Instalar dependências: `npm run test:install`
2. Adicionar imagens de teste
3. Implementar testes específicos
4. Configurar CI/CD se necessário
