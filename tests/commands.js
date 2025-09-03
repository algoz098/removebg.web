/**
 * Comandos personalizados para testes E2E
 * Facilita a execução de tarefas comuns
 */

import { execSync } from 'child_process';
import path from 'path';

class TestCommands {
  
  /**
   * Instala dependências e navegadores do Playwright
   */
  static install() {
    console.log('🔧 Instalando dependências do Playwright...');
    execSync('npm install', { stdio: 'inherit' });
    execSync('npx playwright install', { stdio: 'inherit' });
    console.log('✅ Instalação concluída!');
  }

  /**
   * Executa todos os testes
   */
  static runAll() {
    console.log('🧪 Executando todos os testes E2E...');
    execSync('npx playwright test', { stdio: 'inherit' });
  }

  /**
   * Executa testes em modo UI
   */
  static runUI() {
    console.log('🎭 Abrindo interface de testes...');
    execSync('npx playwright test --ui', { stdio: 'inherit' });
  }

  /**
   * Executa testes em modo debug
   */
  static debug() {
    console.log('🐛 Executando testes em modo debug...');
    execSync('npx playwright test --debug', { stdio: 'inherit' });
  }

  /**
   * Executa testes com visualização (headed)
   */
  static headed() {
    console.log('👀 Executando testes com navegador visível...');
    execSync('npx playwright test --headed', { stdio: 'inherit' });
  }

  /**
   * Executa testes de um arquivo específico
   */
  static runFile(fileName) {
    console.log(`🎯 Executando testes do arquivo: ${fileName}`);
    execSync(`npx playwright test ${fileName}`, { stdio: 'inherit' });
  }

  /**
   * Executa testes de uma suíte específica
   */
  static runSuite(suiteName) {
    console.log(`📋 Executando suíte: ${suiteName}`);
    execSync(`npx playwright test --grep "${suiteName}"`, { stdio: 'inherit' });
  }

  /**
   * Executa testes em um navegador específico
   */
  static runBrowser(browser) {
    console.log(`🌐 Executando testes no navegador: ${browser}`);
    execSync(`npx playwright test --project=${browser}`, { stdio: 'inherit' });
  }

  /**
   * Gera relatório HTML
   */
  static report() {
    console.log('📊 Abrindo relatório de testes...');
    execSync('npx playwright show-report', { stdio: 'inherit' });
  }

  /**
   * Limpa resultados de testes anteriores
   */
  static clean() {
    console.log('🧹 Limpando resultados anteriores...');
    execSync('rm -rf test-results playwright-report', { stdio: 'inherit' });
    console.log('✅ Limpeza concluída!');
  }

  /**
   * Executa testes em modo CI
   */
  static ci() {
    console.log('🚀 Executando testes em modo CI...');
    this.clean();
    execSync('NODE_ENV=ci npx playwright test --reporter=junit', { stdio: 'inherit' });
  }

  /**
   * Atualiza screenshots de referência
   */
  static updateScreenshots() {
    console.log('📸 Atualizando screenshots de referência...');
    execSync('npx playwright test --update-snapshots', { stdio: 'inherit' });
  }

  /**
   * Verifica se o projeto está pronto para testes
   */
  static check() {
    console.log('🔍 Verificando configuração...');
    
    const checks = [
      { name: 'Playwright instalado', command: 'npx playwright --version' },
      { name: 'Navegadores instalados', command: 'npx playwright install --dry-run' },
      { name: 'Configuração válida', command: 'npx playwright test --list' }
    ];

    for (const check of checks) {
      try {
        execSync(check.command, { stdio: 'pipe' });
        console.log(`✅ ${check.name}`);
      } catch (error) {
        console.log(`❌ ${check.name}`);
        console.log(`   Erro: ${error.message}`);
      }
    }
  }

  /**
   * Mostra ajuda com comandos disponíveis
   */
  static help() {
    console.log(`
🎭 Comandos de Teste E2E RemoveBG

Instalação:
  npm run test:install        - Instala Playwright e dependências
  
Execução:
  npm run test:e2e           - Executa todos os testes
  npm run test:e2e:ui        - Interface visual de testes
  npm run test:e2e:debug     - Modo debug
  npm run test:e2e:headed    - Com navegador visível
  
Comandos personalizados:
  node tests/commands.js install      - Instalação completa
  node tests/commands.js run-all      - Todos os testes
  node tests/commands.js ui           - Interface visual
  node tests/commands.js debug        - Modo debug
  node tests/commands.js headed       - Navegador visível
  node tests/commands.js file <nome>  - Arquivo específico
  node tests/commands.js suite <nome> - Suíte específica
  node tests/commands.js browser <br> - Navegador específico
  node tests/commands.js report       - Abrir relatório
  node tests/commands.js clean        - Limpar resultados
  node tests/commands.js ci           - Modo CI/CD
  node tests/commands.js update-ss    - Atualizar screenshots
  node tests/commands.js check        - Verificar configuração
  node tests/commands.js help         - Esta ajuda

Exemplos:
  node tests/commands.js file upload.spec.js
  node tests/commands.js suite "Upload e Processamento"
  node tests/commands.js browser chromium
    `);
  }
}

// CLI para execução direta
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'install':
      TestCommands.install();
      break;
    case 'run-all':
      TestCommands.runAll();
      break;
    case 'ui':
      TestCommands.runUI();
      break;
    case 'debug':
      TestCommands.debug();
      break;
    case 'headed':
      TestCommands.headed();
      break;
    case 'file':
      TestCommands.runFile(arg);
      break;
    case 'suite':
      TestCommands.runSuite(arg);
      break;
    case 'browser':
      TestCommands.runBrowser(arg);
      break;
    case 'report':
      TestCommands.report();
      break;
    case 'clean':
      TestCommands.clean();
      break;
    case 'ci':
      TestCommands.ci();
      break;
    case 'update-ss':
      TestCommands.updateScreenshots();
      break;
    case 'check':
      TestCommands.check();
      break;
    case 'help':
    default:
      TestCommands.help();
      break;
  }
}

export default TestCommands;
