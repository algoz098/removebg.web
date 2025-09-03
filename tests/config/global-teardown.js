/**
 * Teardown global executado após todos os testes
 * Aqui você pode fazer limpeza, gerar relatórios, etc.
 */

async function globalTeardown() {
  console.log('🧹 Iniciando limpeza global dos testes E2E...');
  
  // Aqui você pode adicionar:
  // - Limpeza de banco de dados
  // - Limpeza de arquivos temporários
  // - Geração de relatórios
  // - Envio de métricas
  
  console.log('✅ Limpeza global concluída');
}

export default globalTeardown;
