# Test Fixtures

Esta pasta contém arquivos de teste para os testes E2E.

## Imagens de Teste

Para executar os testes, você precisará adicionar algumas imagens de teste na pasta `images/`:

### Imagens recomendadas:
- `test-image.jpg` - Imagem padrão para testes básicos
- `large-image.jpg` - Imagem grande para testar performance
- `small-image.png` - Imagem pequena para testar edge cases
- `invalid-image.txt` - Arquivo inválido para testar validação

### Características recomendadas das imagens:
- **test-image.jpg**: 800x600px, pessoa ou objeto com fundo simples
- **large-image.jpg**: 4000x3000px ou maior
- **small-image.png**: 100x100px ou menor

### Como adicionar imagens:
1. Coloque as imagens na pasta `tests/fixtures/images/`
2. Nomeie conforme especificado acima
3. Execute `npm run test:e2e` para verificar se os testes passam

### Formatos suportados:
- JPG/JPEG
- PNG
- WebP
- BMP

### Nota de segurança:
Não commite imagens com conteúdo sensível ou pessoal no repositório.
