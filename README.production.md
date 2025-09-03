# RemoveBG WebApp - Versão de Produção

Uma aplicação web moderna para remoção automática de fundo de imagens usando IA, totalmente no navegador. **Versão otimizada para produção**.

## ✨ Características da Versão de Produção

- 🚀 **Otimizado para Performance**: Código minificado e logs de debug removidos
- 📦 **Bundle Optimizado**: Chunks separados para vendor e aplicação
- 🔄 **Service Worker**: Cache inteligente e funcionamento offline
- 📱 **PWA Ready**: Instalável como aplicativo nativo
- 🧹 **Código Limpo**: Removidos arquivos de debug e teste
- ⚡ **Loading Rápido**: Splash screen otimizada e cache eficiente

## 📁 Estrutura do Projeto (Produção)

```
removebg.web/
├── 📄 index.html                    # Página principal (otimizada)
├── 📄 sobre.html                    # Página sobre o projeto
├── 📄 package.json                  # Scripts de produção
├── 📄 vite.config.js               # Configuração Vite
├── 📁 public/                      # Arquivos estáticos
│   ├── manifest.json              # PWA manifest
│   ├── _redirects                 # Netlify redirects
│   ├── icons/                     # Ícones PWA
│   └── screenshots/               # Screenshots PWA
├── 📁 src/                        # Código fonte
│   ├── 📁 css/                    # Estilos CSS
│   │   ├── main.css              # Estilos principais
│   │   ├── splash.css            # Splash screen
│   │   ├── layout.css            # Layout geral
│   │   ├── buttons.css           # Botões
│   │   ├── upload.css            # Área de upload
│   │   ├── cropper.css           # Cropper de imagem
│   │   ├── progress.css          # Barra de progresso
│   │   ├── result.css            # Tela de resultado
│   │   └── sobre.css             # Página sobre
│   └── 📁 js/                     # JavaScript modules
│       ├── main.js               # Aplicação principal
│       ├── splash-manager.js     # Gerenciador splash
│       ├── global-state.js       # Estado global
│       ├── ui-manager.js         # Interface
│       ├── file-upload.js        # Upload de arquivos
│       ├── background-processor.js # Processamento IA
│       ├── image-cropper.js      # Cropper de imagem
│       ├── model-preloader.js    # Pré-carregamento modelo
│       ├── cache-manager.js      # Gerenciamento cache
│       ├── navigation-manager.js # Navegação PWA
│       ├── pwa.js               # PWA features
│       ├── sw.js                # Service Worker
│       ├── toast.js             # Notificações
│       └── utils.js             # Utilitários
└── 📁 config/                     # Configurações
    ├── netlify.toml              # Config Netlify
    └── vite.config.js           # Config Vite específica
```

## 🚀 Instalação e Uso

### Requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação
```bash
# Clonar repositório
git clone [url-do-repositorio]
cd removebg.web

# Instalar dependências
npm install
```

### Desenvolvimento
```bash
# Servidor de desenvolvimento
npm run dev
```

### Build de Produção
```bash
# Build completo para produção
npm run build:prod

# Preview do build
npm run preview

# Analisar bundle
npm run analyze
```

## 🔧 Configuração

### Environment Variables
Não há variáveis de ambiente necessárias. A aplicação funciona 100% no browser.

### Configuração Vite
O arquivo `vite.config.js` está otimizado para produção:
- Code splitting automático
- Minificação com Terser
- Otimização de assets
- Bundle analysis

## 📦 Deployment

### Netlify (Recomendado)
```bash
npm run build:prod
# Upload da pasta dist/ para Netlify
```

### Outros Hosts
A pasta `dist/` gerada pelo build contém todos os arquivos necessários para hospedagem estática.

## 🔄 PWA Features

- **Instalável**: Pode ser instalado como app nativo
- **Offline**: Funciona sem internet após primeira visita
- **Cache Inteligente**: Atualização automática de recursos
- **Splash Screen**: Carregamento visual otimizado

## 🧪 IA e Performance

- **Modelo IA**: @imgly/background-removal v1.4.5
- **Pré-carregamento**: Modelo carregado em background
- **Cache Avançado**: Recursos IA cachados localmente
- **Processamento Client-side**: Sem envio de dados para servidor

## 📱 Compatibilidade

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Privacidade

- **100% Client-side**: Imagens nunca saem do dispositivo
- **Sem tracking**: Não coleta dados pessoais
- **Sem servidor**: Processamento local apenas

## 🛠️ Manutenção

### Estrutura Limpa
- Arquivos de debug removidos
- Console.log removidos da produção
- Código otimizado para performance
- Estrutura organizada para escalabilidade

### Monitoramento
- Service Worker registra eventos de cache
- Error boundaries para captura de erros
- Performance monitoring via Web Vitals

## 📄 Licença

MIT License - veja arquivo LICENSE para detalhes.

---

**Versão de Produção** - Otimizada para performance e manutenibilidade.
