#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

console.log('🔐 GERADOR DE CHAVES CRIPTOGRÁFICAS\n');

// Funções auxiliares
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function updateEnvFile(filePath, jwtSecret, encryptionKey) {
  try {
    let content = '';
    
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }

    // Substituir ou adicionar chaves
    const lines = content.split('\n');
    const newLines = [];
    let jwtUpdated = false;
    let encryptionUpdated = false;

    lines.forEach(line => {
      if (line.startsWith('JWT_SECRET=')) {
        newLines.push(`JWT_SECRET=${jwtSecret}`);
        jwtUpdated = true;
      } else if (line.startsWith('ENCRYPTION_KEY=')) {
        newLines.push(`ENCRYPTION_KEY=${encryptionKey}`);
        encryptionUpdated = true;
      } else {
        newLines.push(line);
      }
    });

    if (!jwtUpdated) {
      newLines.push(`JWT_SECRET=${jwtSecret}`);
    }
    
    if (!encryptionUpdated) {
      newLines.push(`ENCRYPTION_KEY=${encryptionKey}`);
    }

    fs.writeFileSync(filePath, newLines.join('\n'));
    return true;
  } catch (err) {
    console.error('❌ Erro ao atualizar arquivo:', err.message);
    return false;
  }
}

// Gerar chaves
const jwtSecret = generateSecureKey(32);
const encryptionKey = generateSecureKey(32);

console.log('✅ Chaves geradas com sucesso!');
console.log(`\n📄 JWT_SECRET: ${jwtSecret.substring(0, 16)}...`);
console.log(`📄 ENCRYPTION_KEY: ${encryptionKey.substring(0, 16)}...`);

// Atualizar arquivo .env
const envPath = path.join(process.cwd(), '.env');
const updated = updateEnvFile(envPath, jwtSecret, encryptionKey);

if (updated) {
  console.log('\n✅ Arquivo .env atualizado com as novas chaves!');
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   - Guarde estas chaves em local seguro');
  console.log('   - Não compartilhe as chaves completas');
  console.log('   - Em produção, use um gerenciador de segredos');
  
  console.log('\n🔒 Segurança:');
  console.log('   - Ambas as chaves têm 256 bits de entropia');
  console.log('   - São criptograficamente seguras para produção');
  console.log('   - Use-as apenas em ambientes seguros');
} else {
  console.log('\n❌ Erro ao atualizar arquivo .env');
  process.exit(1);
}