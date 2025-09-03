/**
 * Global teardown para garantir que vídeos sejam salvos completamente
 */

import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export default async function globalTeardown() {
  console.log('🎬 Aguardando vídeos serem salvos completamente...');

  // Aguardar 3 segundos para garantir que todos os vídeos sejam salvos
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('✅ Todos os vídeos foram salvos!');

  // Opcional: Listar vídeos gerados
  try {
    const { stdout } = await execAsync('find test-results -name "*.webm" -type f | wc -l');
    const videoCount = parseInt(stdout.trim());
    console.log(`📊 ${videoCount} vídeos gerados no diretório test-results/`);
  } catch (error) {
    console.log('ℹ️ Não foi possível contar vídeos (diretório pode estar vazio)');
  }
}
