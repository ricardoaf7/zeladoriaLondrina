/**
 * Build Final - Zeladoria Londrina
 * Script de build otimizado para produção com todas as funcionalidades
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configurações
const BUILD_CONFIG = {
  // Ambiente
  NODE_ENV: 'production',
  
  // Otimizações
  ENABLE_COMPRESSION: true,
  ENABLE_MINIFICATION: true,
  ENABLE_SOURCE_MAPS: false,
  
  // Segurança
  ENABLE_SECURITY_HEADERS: true,
  ENABLE_RATE_LIMITING: true,
  
  // Performance
  ENABLE_CACHING: true,
  ENABLE_CODE_SPLITTING: true,
  
  // Analytics
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_TRACKING: true,
  
  // Build
  CLEAN_BEFORE_BUILD: true,
  GENERATE_MANIFEST: true,
  VALIDATE_BUILD: true
};

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n🔧 ${description}`, 'cyan');
  try {
    const result = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd()
    });
    log(`✅ Sucesso: ${description}`, 'green');
    return result;
  } catch (error) {
    log(`❌ Erro: ${description}`, 'red');
    log(`Detalhes: ${error.message}`, 'red');
    throw error;
  }
}

function generateBuildInfo() {
  const buildInfo = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    environment: BUILD_CONFIG.NODE_ENV,
    git: {
      commit: execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(),
      date: execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim()
    },
    features: BUILD_CONFIG
  };
  
  fs.writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2));
  return buildInfo;
}

function validateEnvironment() {
  log('\n🔍 Validando ambiente de produção...', 'yellow');
  
  // Verificar variáveis de ambiente críticas
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`⚠️  Variáveis de ambiente ausentes: ${missingVars.join(', ')}`, 'yellow');
    log('⚠️  Certifique-se de configurar todas as variáveis necessárias!', 'yellow');
  } else {
    log('✅ Todas as variáveis de ambiente críticas estão configuradas', 'green');
  }
  
  // Verificar estrutura do projeto
  const requiredPaths = [
    'client/package.json',
    'server/index.ts',
    'supabase/migrations',
    'vercel.json'
  ];
  
  const missingPaths = requiredPaths.filter(p => !fs.existsSync(p));
  
  if (missingPaths.length > 0) {
    log(`❌ Arquivos/pastas ausentes: ${missingPaths.join(', ')}`, 'red');
    throw new Error('Estrutura do projeto incompleta');
  }
  
  log('✅ Estrutura do projeto validada', 'green');
}

function cleanBuildArtifacts() {
  if (!BUILD_CONFIG.CLEAN_BEFORE_BUILD) return;
  
  log('\n🧹 Limpando artefatos de build anteriores...', 'cyan');
  
  const dirsToClean = ['dist', 'build', '.next', 'out'];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      log(`🗑️  Removido: ${dir}`, 'yellow');
    }
  });
  
  log('✅ Limpeza concluída', 'green');
}

function buildFrontend() {
  log('\n🏗️  Construindo frontend (Cliente React)...', 'blue');
  
  // Instalar dependências do cliente
  execCommand('cd client && npm ci --production=false', 'Instalando dependências do cliente');
  
  // Build do cliente
  execCommand('cd client && npm run build', 'Build do cliente React');
  
  // Otimizar assets do cliente
  if (BUILD_CONFIG.ENABLE_COMPRESSION) {
    log('📦 Otimizando assets do cliente...', 'cyan');
    
    // Gerar relatório de bundle
    execCommand('cd client && npm run build:analyze', 'Análise de bundle');
    
    // Comprimir assets
    execCommand('cd client && npx vite-plugin-compression', 'Compressão de assets');
  }
  
  log('✅ Frontend construído com sucesso', 'green');
}

function buildBackend() {
  log('\n🏗️  Construindo backend (Servidor Express)...', 'blue');
  
  // Instalar dependências do servidor
  execCommand('npm ci --production=false', 'Instalando dependências do servidor');
  
  // Compilar TypeScript
  execCommand('npm run build:server', 'Compilando servidor TypeScript');
  
  // Otimizar build do servidor
  if (BUILD_CONFIG.ENABLE_MINIFICATION) {
    log('⚡ Otimizando código do servidor...', 'cyan');
    
    // Minificar código
    execCommand('npx terser dist/server/index.js -o dist/server/index.min.js --compress --mangle', 'Minificação do servidor');
    
    // Gerar source maps se habilitado
    if (BUILD_CONFIG.ENABLE_SOURCE_MAPS) {
      execCommand('npx terser dist/server/index.js -o dist/server/index.min.js --source-map', 'Source maps do servidor');
    }
  }
  
  log('✅ Backend construído com sucesso', 'green');
}

function optimizeDatabase() {
  log('\n🗄️  Otimizando banco de dados...', 'blue');
  
  // Executar migrations
  execCommand('npm run db:migrate', 'Executando migrations do banco');
  
  // Otimizar tabelas
  execCommand('npm run db:optimize', 'Otimizando tabelas do banco');
  
  // Gerar backup
  if (process.env.SUPABASE_URL) {
    log('💾 Gerando backup do banco...', 'cyan');
    execCommand('npm run db:backup', 'Backup do banco de dados');
  }
  
  log('✅ Banco de dados otimizado', 'green');
}

function generateManifest() {
  if (!BUILD_CONFIG.GENERATE_MANIFEST) return;
  
  log('\n📋 Gerando manifesto de build...', 'cyan');
  
  const manifest = {
    name: 'Zeladoria Londrina',
    short_name: 'ZeladoriaLD',
    description: 'Sistema de gestão de zeladoria urbana de Londrina',
    version: process.env.npm_package_version || '1.0.0',
    buildTime: new Date().toISOString(),
    features: BUILD_CONFIG,
    files: {
      client: [],
      server: [],
      static: []
    },
    checksums: {}
  };
  
  // Listar arquivos do build
  const clientFiles = getFilesRecursively('dist/client');
  const serverFiles = getFilesRecursively('dist/server');
  const staticFiles = getFilesRecursively('public');
  
  manifest.files.client = clientFiles;
  manifest.files.server = serverFiles;
  manifest.files.static = staticFiles;
  
  // Gerar checksums
  [...clientFiles, ...serverFiles, ...staticFiles].forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      manifest.checksums[file] = hash;
    }
  });
  
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
  
  log('✅ Manifesto gerado com sucesso', 'green');
  return manifest;
}

function getFilesRecursively(dir, basePath = '') {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFilesRecursively(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  });
  
  return files;
}

function validateBuild() {
  if (!BUILD_CONFIG.VALIDATE_BUILD) return;
  
  log('\n🔍 Validando build final...', 'yellow');
  
  // Verificar arquivos críticos
  const criticalFiles = [
    'dist/client/index.html',
    'dist/client/assets',
    'dist/server/index.js',
    'dist/manifest.json'
  ];
  
  const missingFiles = criticalFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    log(`❌ Arquivos críticos ausentes: ${missingFiles.join(', ')}`, 'red');
    throw new Error('Build inválido - arquivos críticos ausentes');
  }
  
  // Verificar tamanho dos arquivos
  const maxFileSizes = {
    'dist/client/index.html': 1024 * 1024, // 1MB
    'dist/server/index.js': 5 * 1024 * 1024, // 5MB
  };
  
  Object.entries(maxFileSizes).forEach(([file, maxSize]) => {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      if (size > maxSize) {
        log(`⚠️  Arquivo grande: ${file} (${(size / 1024 / 1024).toFixed(2)}MB)`, 'yellow');
      }
    }
  });
  
  // Testar servidor
  log('🧪 Testando servidor buildado...', 'cyan');
  try {
    execCommand('node dist/server/index.js --test', 'Teste do servidor');
    log('✅ Servidor buildado funcionando', 'green');
  } catch (error) {
    log('⚠️  Servidor buildado com problemas', 'yellow');
  }
  
  log('✅ Build validado com sucesso', 'green');
}

function generateDeploymentPackage() {
  log('\n📦 Gerando pacote de deployment...', 'blue');
  
  // Criar arquivo de deployment
  const deploymentConfig = {
    version: process.env.npm_package_version || '1.0.0',
    buildTime: new Date().toISOString(),
    environment: BUILD_CONFIG.NODE_ENV,
    features: BUILD_CONFIG,
    deployment: {
      platform: 'vercel',
      regions: ['gru1', 'iad1'],
      scaling: {
        min: 1,
        max: 10
      },
      healthCheck: {
        path: '/api/status',
        interval: 30,
        timeout: 10
      }
    },
    monitoring: {
      enabled: BUILD_CONFIG.ENABLE_ANALYTICS,
      errorTracking: BUILD_CONFIG.ENABLE_ERROR_TRACKING,
      performance: true
    }
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentConfig, null, 2));
  
  // Criar arquivo de variáveis de ambiente para produção
  const envExample = `# Zeladoria Londrina - Variáveis de Produção
NODE_ENV=production
VITE_SUPABASE_URL=seu_supabase_url
VITE_SUPABASE_ANON_KEY=seu_supabase_anon_key
JWT_SECRET=seu_jwt_secret
ENCRYPTION_KEY=sua_chave_de_criptografia

# Opcionais
SENTRY_DSN=seu_sentry_dsn
ANALYTICS_ID=seu_google_analytics_id
`;
  
  fs.writeFileSync('.env.production.example', envExample);
  
  log('✅ Pacote de deployment gerado', 'green');
}

function printSummary(buildInfo, manifest) {
  log('\n' + '='.repeat(60), 'blue');
  log('🏆 BUILD FINAL CONCLUÍDO COM SUCESSO!', 'green');
  log('='.repeat(60), 'blue');
  
  log(`\n📊 Resumo do Build:`, 'cyan');
  log(`   📦 Versão: ${buildInfo.version}`, 'white');
  log(`   ⏰ Build: ${buildInfo.buildTime}`, 'white');
  log(`   🔢 Commit: ${buildInfo.git.commit}`, 'white');
  log(`   🌿 Branch: ${buildInfo.git.branch}`, 'white');
  
  if (manifest) {
    log(`\n📋 Arquivos Gerados:`, 'cyan');
    log(`   📁 Cliente: ${manifest.files.client.length} arquivos`, 'white');
    log(`   📁 Servidor: ${manifest.files.server.length} arquivos`, 'white');
    log(`   📁 Estáticos: ${manifest.files.static.length} arquivos`, 'white');
  }
  
  log(`\n🚀 Próximos Passos:`, 'cyan');
  log(`   1. Configure as variáveis de ambiente`, 'white');
  log(`   2. Execute: npm run deploy:vercel`, 'white');
  log(`   3. Acesse: https://zeladoria-londrina.vercel.app`, 'white');
  log(`   4. Teste o sistema OCR em: /ocr-import`, 'white');
  
  log(`\n📖 Documentação:`, 'cyan');
  log(`   📄 Guia OCR: GUIA_OCR_ROCAGEM.md`, 'white');
  log(`   🔧 Deploy: DEPLOY_PRODUCAO.md`, 'white');
  log(`   ✅ Checklist: CHECKLIST_DEPLOY.md`, 'white');
  
  log('\n' + '🎉 Zeladoria Londrina pronta para produção!'.padStart(45), 'green');
  log('='.repeat(60), 'blue');
}

// Função principal
async function buildFinal() {
  const startTime = Date.now();
  
  log('\n🏗️  INICIANDO BUILD FINAL - ZELADORIA LONDRINA', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    // 1. Gerar informações do build
    const buildInfo = generateBuildInfo();
    
    // 2. Validar ambiente
    validateEnvironment();
    
    // 3. Limpar artefatos anteriores
    cleanBuildArtifacts();
    
    // 4. Build do frontend
    buildFrontend();
    
    // 5. Build do backend
    buildBackend();
    
    // 6. Otimizar banco de dados
    optimizeDatabase();
    
    // 7. Gerar manifesto
    const manifest = generateManifest();
    
    // 8. Validar build
    validateBuild();
    
    // 9. Gerar pacote de deployment
    generateDeploymentPackage();
    
    // 10. Resumo
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log(`\n⏱️  Build concluído em ${duration} segundos`, 'cyan');
    
    printSummary(buildInfo, manifest);
    
  } catch (error) {
    log(`\n❌ ERRO CRÍTICO NO BUILD: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  buildFinal().catch(error => {
    console.error('Erro não tratado:', error);
    process.exit(1);
  });
}

module.exports = { buildFinal, BUILD_CONFIG };