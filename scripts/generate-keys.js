#!/usr/bin/env node

/**
 * Gerador de chaves criptográficas seguras
 * Gera chaves JWT e de criptografia de forma automática e segura
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import colors from 'colors';

// Cores para output
const success = colors.green;
const error = colors.red;
const warning = colors.yellow;
const info = colors.blue;

/**
 * Gera uma chave criptográfica segura
 */
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Gera um JWT Secret seguro
 */
function generateJwtSecret() {
  return generateSecureKey(32); // 256 bits
}

/**
 * Gera uma chave de criptografia segura
 */
function generateEncryptionKey() {
  return generateSecureKey(32); // 256 bits para AES-256
}

/**
 * Lê o arquivo .env existente
 */
function readEnvFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  } catch (err) {
    console.error(error(`❌ Erro ao ler arquivo ${filePath}:`), err.message);
    return null;
  }
}

/**
 * Atualiza ou cria arquivo .env com as novas chaves
 */
function updateEnvFile(filePath, jwtSecret, encryptionKey) {
  try {
    let content = '';
    let existingContent = '';
    let backupCreated = false;

    // Ler conteúdo existente se houver
    if (fs.existsSync(filePath)) {
      existingContent = fs.readFileSync(filePath, 'utf8');
      
      // Criar backup
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, existingContent);
      backupCreated = true;
      console.log(warning(`💾 Backup criado: ${backupPath}`));
    }

    // Gerar novo conteúdo
    const lines = existingContent.split('\n');
    let jwtUpdated = false;
    let encryptionUpdated = false;

    // Processar linhas existentes
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Pular linhas de comentário
      if (trimmedLine.startsWith('#') || trimmedLine === '') {
        content += line + '\n';
        return;
      }

      // Atualizar JWT_SECRET
      if (trimmedLine.startsWith('JWT_SECRET=')) {
        content += `JWT_SECRET=${jwtSecret}\n`;
        jwtUpdated = true;
        return;
      }

      // Atualizar ENCRYPTION_KEY
      if (trimmedLine.startsWith('ENCRYPTION_KEY=')) {
        content += `ENCRYPTION_KEY=${encryptionKey}\n`;
        encryptionUpdated = true;
        return;
      }

      // Manter outras linhas
      content += line + '\n';
    });

    // Adicionar chaves se não existirem
    if (!jwtUpdated) {
      content += `JWT_SECRET=${jwtSecret}\n`;
    }
    
    if (!encryptionUpdated) {
      content += `ENCRYPTION_KEY=${encryptionKey}\n`;
    }

    // Escrever arquivo
    fs.writeFileSync(filePath, content);
    
    console.log(success(`✅ Arquivo ${filePath} atualizado com sucesso!`));
    if (backupCreated) {
      console.log(warning('📝 As chaves antigas foram salvas no backup.'));
    }
    
    return true;

  } catch (err) {
    console.error(error(`❌ Erro ao atualizar arquivo ${filePath}:`), err.message);
    return false;
  }
}

/**
 * Mostra as chaves geradas de forma segura
 */
function displayKeys(jwtSecret, encryptionKey, options = {}) {
  console.log(info('\n🔑 CHAVES GERADAS COM SUCESSO!\n'));
  
  if (options.showKeys) {
    console.log(success('JWT_SECRET:'));
    console.log(`${jwtSecret}\n`);
    
    console.log(success('ENCRYPTION_KEY:'));
    console.log(`${encryptionKey}\n`);
    
    console.log(warning('⚠️  IMPORTANTE: Copie essas chaves e guarde em local seguro!'));
  } else {
    console.log(success('✅ JWT_SECRET: Gerada com sucesso (256 bits)'));
    console.log(success('✅ ENCRYPTION_KEY: Gerada com sucesso (256 bits)'));
    console.log(info(`📁 Arquivo atualizado: ${options.filePath}`));
  }
  
  console.log(info('\n🔒 Segurança:'));
  console.log('   - Ambas as chaves têm 256 bits de entropia');
  console.log('   - São criptograficamente seguras para produção');
  console.log('   - Use-as apenas em ambientes seguros');
  
  if (!options.showKeys) {
    console.log(warning('\n📝 Para ver as chaves geradas, use o comando:'));
    console.log('   node scripts/generate-keys.js --show');
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log(info('🔐 GERADOR DE CHAVES CRIPTOGRÁFICAS\n'));
    
    // Parse argumentos
    const args = process.argv.slice(2);
    const showKeys = args.includes('--show') || args.includes('-s');
    const force = args.includes('--force') || args.includes('-f');
    const help = args.includes('--help') || args.includes('-h');
    
    if (help) {
      console.log(info('Uso: node scripts/generate-keys.js [opções]'));
      console.log('\nOpções:');
      console.log('  --show, -s      Mostrar as chaves geradas no console');
      console.log('  --force, -f     Forçar atualização mesmo se chaves existirem');
      console.log('  --help, -h      Mostrar esta ajuda');
      console.log('\nExemplos:');
      console.log('  node scripts/generate-keys.js');
      console.log('  node scripts/generate-keys.js --show');
      console.log('  node scripts/generate-keys.js --force --show');
      return;
    }
    
    // Verificar se existe arquivo .env
    const envPath = path.join(process.cwd(), '.env');
    const envLocalPath = path.join(process.cwd(), 'client', '.env.local');
    
    let targetPath = envPath;
    let targetType = 'backend';
    
    if (!fs.existsSync(envPath) && fs.existsSync(envLocalPath)) {
      targetPath = envLocalPath;
      targetType = 'frontend';
    }
    
    if (!fs.existsSync(targetPath)) {
      console.log(error(`❌ Arquivo .env não encontrado em ${targetPath}`));
      console.log(info('Por favor, crie o arquivo .env primeiro:'));
      console.log('   cp .env.example .env');
      return;
    }
    
    // Verificar se já existem chaves
    const existingContent = readEnvFile(targetPath);
    const hasJwtSecret = existingContent && existingContent.includes('JWT_SECRET=') && 
                        !existingContent.includes('JWT_SECRET=sua-chave');
    const hasEncryptionKey = existingContent && existingContent.includes('ENCRYPTION_KEY=') && 
                             !existingContent.includes('ENCRYPTION_KEY=sua-chave');
    
    if ((hasJwtSecret || hasEncryptionKey) && !force) {
      console.log(warning('⚠️  Chaves já existem no arquivo!'));
      console.log(info('Use --force para substituir as chaves existentes.'));
      console.log(info('Isso invalidará todos os tokens atuais e dados criptografados.'));
      return;
    }
    
    // Gerar chaves
    console.log(info('Gerando chaves criptográficas seguras...'));
    const jwtSecret = generateJwtSecret();
    const encryptionKey = generateEncryptionKey();
    
    // Atualizar arquivo
    const updated = updateEnvFile(targetPath, jwtSecret, encryptionKey);
    
    if (updated) {
      displayKeys(jwtSecret, encryptionKey, {
        showKeys,
        filePath: targetPath
      });
      
      console.log(info(`\n🎯 Arquivo ${targetType} atualizado: ${targetPath}`));
      console.log(success('\n✅ Processo concluído com sucesso!'));
      
      // Verificar se precisa atualizar o outro ambiente
      if (targetType === 'backend' && fs.existsSync(envLocalPath)) {
        console.log(info('\n💡 Detectado ambiente frontend também.'));
        console.log(info('Execute: node scripts/generate-keys.js --show'));
        console.log(info('E copie as chaves manualmente para client/.env.local'));
      }
    }
    
  } catch (err) {
    console.error(error('❌ Erro durante a geração de chaves:'), err.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateSecureKey,
  generateJwtSecret,
  generateEncryptionKey
};