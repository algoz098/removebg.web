# RemoveBG WebApp

Uma aplicação web moderna para remoção automática de fundo de imagens usando IA, totalmente no navegador.

## 📁 Estrutura do Projeto

```
removebg.web/
├── 📄 index.html                    # Página principal
├── 📄 sobre.html                    # Página sobre o projeto
├── 📄 package.json                  # Dependências e scripts
├── 📄 vite.config.js               # Configuração do Vite
├── 📄 README.md                     # Este arquivo
├── 📄 NETLIFY.md                    # Instruções de deploy no Netlify
├── 
├── 📁 src/                          # Código fonte
│   ├── 📁 css/                      # Estilos CSS modulares
│   │   ├── base.css                 # Reset e estilos base
│   │   ├── buttons.css              # Estilos dos botões
│   │   ├── upload.css               # Área de upload
│   │   ├── progress.css             # Barras de progresso
│   │   ├── result.css               # Seção de resultado
│   │   ├── layout.css               # Layout e responsivo
│   │   ├── sobre.css                # Estilos da página sobre
│   │   └── main.css                 # CSS principal (importa todos)
│   │
│   ├── 📁 js/                       # JavaScript modular
│   │   ├── main.js                  # Aplicação principal
│   │   ├── ui-manager.js            # Gerenciamento da UI
│   │   ├── file-upload.js           # Upload de arquivos
│   │   ├── background-processor.js  # Processamento de imagens
│   │   ├── utils.js                 # Utilitários e helpers
│   │   ├── pwa.js                   # Funcionalidades PWA
│   │   └── sw.js                    # Service Worker
│   │
│   └── 📁 assets/                   # Recursos estáticos
│       ├── manifest.json            # Manifest PWA
│       ├── icon-base.svg           # Ícone base SVG
│       ├── icons/                   # Ícones PWA
│       └── screenshots/             # Screenshots para PWA
│
├── 📁 config/                       # Arquivos de configuração
│   ├── vite.config.js              # Configuração Vite
│   └── netlify.toml                 # Configuração Netlify
│
├── 📁 scripts/                      # Scripts de build e utilitários
│   ├── build-pwa.sh               # Script de build PWA
│   ├── generate-icons.js          # Gerador de ícones
│   ├── create-basic-icons.js      # Criação de ícones básicos
│   └── create-real-icons.js       # Criação de ícones avançados
│
├── 📁 public/                       # Arquivos públicos (Netlify)
├── 📁 dist/                         # Build de produção
└── 📁 node_modules/                 # Dependências npm
```

## 🚀 Funcionalidades

- ✨ Remoção de fundo usando IA (@imgly/background-removal)
- 📱 Progressive Web App (PWA)
- 🎨 Interface moderna e responsiva
- 📦 Drag & Drop para upload
- 💾 Download da imagem processada
- 🔄 Processamento em tempo real
- 📊 Indicador de progresso
- 🌐 Funciona offline (com Service Worker)
- 📄 Página sobre informativa com detalhes do projeto

## 📄 Páginas

### Página Principal (`/`)
- Interface principal do aplicativo
- Upload de imagens por clique ou drag & drop
- Processamento e visualização de resultados
- Download da imagem processada

### Página Sobre (`/sobre.html`)
- Informações detalhadas sobre o projeto
- Como funciona o algoritmo de remoção
- Características e tecnologias utilizadas
- Formatos suportados
- Design responsivo e moderno

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Bundler**: Vite
- **IA**: @imgly/background-removal
- **PWA**: Service Worker, Web App Manifest
- **Deploy**: Netlify

## 📋 Pré-requisitos

- Node.js 16+
- npm ou yarn

## 🔧 Instalação e Uso

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

### Build de Produção

```bash
# Build básico
npm run build

# Build PWA (inclui manifest e service worker)
npm run build:pwa

# Build para Netlify (cria pasta de deploy)
npm run build:netlify
```

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run build:pwa` - Build PWA completo
- `npm run build:netlify` - Build para deploy no Netlify
- `npm run preview` - Preview do build
- `npm run generate-icons` - Gerar ícones PWA

## 🏗️ Arquitetura

### Módulos CSS

O CSS está organizado em módulos para melhor manutenção:

- **base.css**: Reset, tipografia e estilos fundamentais
- **buttons.css**: Todos os estilos de botões
- **upload.css**: Área de upload e preview
- **progress.css**: Barras de progresso e indicadores
- **result.css**: Seção de resultados e comparação
- **layout.css**: Layout, páginas e responsividade

### Módulos JavaScript

O JavaScript segue uma arquitetura modular:

- **main.js**: Classe principal que coordena tudo
- **ui-manager.js**: Gerencia navegação e UI
- **file-upload.js**: Upload e validação de arquivos
- **background-processor.js**: Processamento de imagens
- **utils.js**: Funções utilitárias reutilizáveis
- **pwa.js**: Funcionalidades PWA
- **sw.js**: Service Worker para cache offline

### Fluxo da Aplicação

1. **Upload** - Usuário seleciona/arrasta imagem
2. **Validação** - Arquivo é validado (tipo, tamanho)
3. **Preview** - Exibe preview da imagem original
4. **Processamento** - Remove fundo usando IA
5. **Resultado** - Mostra comparação antes/depois
6. **Download** - Permite baixar imagem processada

## 🚀 Deploy

### Netlify (Recomendado)

```bash
# Preparar deploy
npm run deploy:prepare

# O build será criado na pasta netlify-deploy-YYYYMMDD-HHMMSS/
# Faça upload dessa pasta no Netlify
```

### Deploy Manual

```bash
# Build de produção
npm run build:pwa

# Upload da pasta dist/ para seu hosting
```

## 🔧 Configuração

### Vite (vite.config.js)

- Configurado para desenvolvimento e produção
- Otimizações de bundle
- Configuração de assets
- Minificação com Terser

### PWA (manifest.json)

- Configuração completa para PWA
- Ícones para diferentes dispositivos
- Configurações de display e tema

### Service Worker (sw.js)

- Cache inteligente de assets
- Estratégias de cache diferentes por tipo
- Funcionalidade offline

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## � Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🐛 Problemas Conhecidos

- Arquivos muito grandes (>10MB) podem causar lentidão
- Alguns formatos de imagem podem não ser suportados
- Processamento pode ser lento em dispositivos menos potentes

## 🚀 Roadmap

- [ ] Suporte a mais formatos de imagem
- [ ] Otimização de performance
- [ ] Modo escuro
- [ ] Histórico de processamentos
- [ ] API para processamento em lote

## 📱 Funcionalidades PWA

- **Instalação**: Adicione à tela inicial como app nativo
- **Cache offline**: Use o app mesmo sem conexão com internet
- **Notificações de atualização**: Seja notificado quando novas versões estiverem disponíveis
- **Otimizado para mobile**: Experiência nativa em dispositivos móveis
- **Ícones adaptativos**: Ícones que se adaptam ao tema do dispositivo

## 🧭 Navegação

### Página Inicial
- Interface principal para upload e processamento de imagens
- Sistema de páginas com indicadores de progresso
- Área de drag & drop para upload de arquivos
- Visualização de resultados lado a lado

### Página de Informações
- Explicação detalhada sobre o que é o RemoveBG
- Documentação sobre como funciona o algoritmo
- Lista de tecnologias utilizadas
- Informações sobre privacidade e segurança
- Características técnicas do projeto

## 🚀 Como usar

1. Abra o aplicativo no navegador
2. **Navegue pelo menu**: Use o menu superior para alternar entre Início e Informações
3. **Instale como PWA** (opcional): Clique em "Instalar" quando aparecer a notificação
4. Na página Início, clique na área de upload ou arraste uma imagem
5. Clique em "Remover Fundo"
5. Aguarde o processamento
6. Compare o resultado e faça o download

## 🛠️ Tecnologias

- **HTML5 Canvas**: Para processamento de imagem
- **JavaScript ES6+**: Lógica de processamento
- **CSS3**: Interface moderna com gradientes e animações
- **Service Worker**: Cache e funcionamento offline
- **Web App Manifest**: Configuração PWA
- **Algoritmos de visão computacional**: Detecção de bordas e segmentação por cor

## 📦 Executar localmente

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Algoritmo

O algoritmo de remoção de fundo utiliza:

1. **Detecção de cor de fundo**: Análise dos cantos da imagem
2. **Segmentação por similaridade**: Comparação de pixels com threshold ajustável
3. **Refinamento de bordas**: Suavização usando análise de vizinhança
4. **Canal alfa**: Aplicação de transparência gradual nas bordas

## 📱 PWA Features

### Service Worker
- Cache de assets estáticos (HTML, CSS, JS, ícones)
- Cache dinâmico para imagens e recursos
- Estratégias de cache: Cache First para assets, Network First para conteúdo dinâmico
- Limpeza automática de cache antigo

### Manifest
- Configuração completa para instalação
- Ícones adaptativos em múltiplos tamanhos
- Tema e cores personalizadas
- Screenshots para app stores

### Offline Support
- Funciona completamente offline após primeiro carregamento
- Indicador visual de status de rede
- Cache inteligente com limite de tamanho

## 🎯 Casos de uso

- Criação de avatares para redes sociais
- Preparação de imagens para e-commerce
- Design gráfico e criação de colagens
- Remoção rápida de fundos sem usar softwares complexos

## 📝 Notas

Esta é uma versão inicial com algoritmos básicos de processamento de imagem. Para resultados ainda melhores, futuramente pode ser integrado com modelos de IA como U²-Net ou MODNet via TensorFlow.js.

## 📄 Licença

MIT License - Sinta-se livre para usar e modificar.
