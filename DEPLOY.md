# Configuração de Deploy - Netlify

Este documento explica como configurar o deploy automático do projeto no Netlify usando GitHub Actions.

## 📋 Pré-requisitos

1. **Conta no Netlify**: [https://netlify.com](https://netlify.com)
2. **Conta no GitHub**: [https://github.com](https://github.com)
3. **Repositório configurado**: Projeto deve estar em um repositório GitHub

## 🔧 Configuração no Netlify

### 1. Criar um novo site

1. Acesse o [Netlify Dashboard](https://app.netlify.com)
2. Clique em "Add new site" → "Deploy manually"
3. Arraste uma pasta qualquer (temporária) para criar o site
4. Anote o **Site ID** que aparece em: Site settings → General → Site details

### 2. Gerar token de acesso

1. Vá para [User settings → Applications](https://app.netlify.com/user/applications)
2. Clique em "New access token"
3. Dê um nome descritivo (ex: "RemoveBG GitHub Actions")
4. Copie o token gerado

## 🔐 Configuração no GitHub

### 1. Adicionar secrets do repositório

No seu repositório GitHub:

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione os seguintes secrets:

```
NETLIFY_AUTH_TOKEN = [seu token do Netlify]
NETLIFY_SITE_ID = [seu Site ID do Netlify]
```

### 2. Verificar configuração

Certifique-se de que os arquivos estão configurados:

- ✅ `.github/workflows/deploy.yml` - Workflow do GitHub Actions
- ✅ `netlify.toml` - Configurações do Netlify
- ✅ `package.json` - Scripts de build

## 🚀 Como funciona

### Workflow automático

O deploy acontece automaticamente quando:

1. **Push para `main`**: Deploy para produção
2. **Pull Request**: Deploy de preview (opcional)

### Processo de deploy

1. **Teste**: Executa todos os testes Playwright
2. **Build**: Compila o projeto com Vite
3. **Deploy**: Publica no Netlify
4. **Notificação**: Comenta no commit/PR com o link

### Comandos executados

```bash
# Testes
npm ci
npx playwright install --with-deps
npm run test

# Build e Deploy
npm ci
npm run build:prod  # Inclui build PWA
```

## 📁 Estrutura de arquivos

```
.github/
  workflows/
    deploy.yml          # GitHub Actions workflow

config/
  netlify.toml         # Backup da configuração

netlify.toml           # Configuração principal do Netlify
package.json           # Scripts de build
```

## 🔍 Troubleshooting

### Build falha

1. Verifique os logs no GitHub Actions
2. Teste localmente: `npm run build:prod`
3. Verifique se todas as dependências estão listadas

### Deploy falha

1. Verifique se os secrets estão configurados corretamente
2. Confirme o Site ID no Netlify
3. Verifique se o token tem permissões suficientes

### Testes falham

1. Execute localmente: `npm run test`
2. Verifique se a imagem de teste existe: `public/screenshots/test.jpeg`
3. Analise os artifacts de teste no GitHub Actions

## 📈 Monitoramento

### GitHub Actions

- Vá para a aba **Actions** do repositório
- Veja o status dos workflows
- Download dos artifacts de teste (se houver falhas)

### Netlify

- Dashboard: [https://app.netlify.com](https://app.netlify.com)
- Logs de deploy
- Analytics e performance
- Configurações de domínio

## 🌐 URLs

Após o deploy, você terá:

- **URL de produção**: `https://[seu-site].netlify.app`
- **URLs de preview**: Para cada PR (se configurado)
- **Deploy logs**: Visíveis no Netlify Dashboard

## 🛠️ Customização

### Modificar o workflow

Edite `.github/workflows/deploy.yml` para:

- Alterar triggers de deploy
- Adicionar mais testes
- Configurar notificações
- Adicionar etapas de build

### Configurações do Netlify

Edite `netlify.toml` para:

- Modificar headers HTTP
- Configurar redirects
- Ajustar cache
- Configurar funções serverless (se necessário)

---

## 📝 Notas importantes

1. **Primeiro deploy**: Pode demorar mais (instalação de dependências)
2. **Cache**: Deploys subsequentes são mais rápidos (cache do npm)
3. **Testes**: Deploy só acontece se os testes passarem
4. **Domínio custom**: Configure no Netlify Dashboard após o primeiro deploy
