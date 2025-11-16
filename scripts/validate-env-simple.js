#!/usr/bin/env node

/**
 * Script de validação de variáveis de ambiente - Versão Simplificada
 * Verifica se todas as variáveis obrigatórias estão configuradas corretamente
 */

import fs from 'fs';
import path from 'path';

// Cores para output (sem dependência externa)
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`
};

const success = colors.green;
const error = colors.red;
const warning = colors.yellow;
const info = colors.blue;

// Configurações
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const WARNING_ENV_VARS = [
  'REDIS_URL',
  'WEATHER_API_KEY',
  'MAP_API_KEY'
];

// Funções auxiliares
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function isValidJwtSecret(secret) {
  return secret && secret.length >= 32 && !secret.includes('sua-chave');
}

function isValidSupabaseKey(key) {
  return key && key.startsWith('eyJ') && key.length > 50;
}

function checkEnvironmentVariables() {
  const results = {
    valid: [],
    invalid: [],
    missing: [],
    warnings: []
  };

  // Verificar variáveis obrigatórias
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    
    if (!value) {
      results.missing.push(varName);
      return;
    }

    // Validações específicas
    switch (varName) {
      case 'VITE_SUPABASE_URL':
        if (!isValidUrl(value) || !value.includes('supabase.co')) {
          results.invalid.push(`${varName} (URL inválida ou não é do Supabase)`);
        } else {
          results.valid.push(varName);
        }
        break;

      case 'VITE_SUPABASE_ANON_KEY':
        if (!isValidSupabaseKey(value)) {
          results.invalid.push(`${varName} (Chave JWT inválida)`);
        } else {
          results.valid.push(varName);
        }
        break;

      case 'SUPABASE_SERVICE_ROLE_KEY':
        if (!isValidSupabaseKey(value)) {
          results.invalid.push(`${varName} (Chave de serviço inválida)`);
        } else {
          results.valid.push(varName);
        }
        break;

      case 'JWT_SECRET':
        if (!isValidJwtSecret(value)) {
          results.invalid.push(`${varName} (Muito curta ou usa valor padrão)`);
        } else {
          results.valid.push(varName);
        }
        break;

      default:
        results.valid.push(varName);
    }
  });

  // Verificar variáveis de aviso
  WARNING_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      results.warnings.push(varName);
    }
  });

  return results;
}

function generateReport(results) {
  console.log(info('📋 RELATÓRIO DE VALIDAÇÃO\n'));

  // Variáveis válidas
  if (results.valid.length > 0) {
    console.log(success(`✅ Variáveis válidas (${results.valid.length}):`));
    results.valid.forEach(varName => {
      console.log(`   ${success('✓')} ${varName}`);
    });
    console.log();
  }

  // Variáveis inválidas
  if (results.invalid.length > 0) {
    console.log(error(`❌ Variáveis com problemas (${results.invalid.length}):`));
    results.invalid.forEach(varName => {
      console.log(`   ${error('✗')} ${varName}`);
    });
    console.log();
  }

  // Variáveis ausentes
  if (results.missing.length > 0) {
    console.log(error(`🔴 Variáveis obrigatórias faltando (${results.missing.length}):`));
    results.missing.forEach(varName => {
      console.log(`   ${error('✗')} ${varName}`);
    });
    console.log();
  }

  // Avisos
  if (results.warnings.length > 0) {
    console.log(warning(`⚠️  Variáveis opcionais faltando (${results.warnings.length}):`));
    results.warnings.forEach(varName => {
      console.log(`   ${warning('!')} ${varName}`);
    });
    console.log();
  }

  // Resumo
  const total = results.valid.length + results.invalid.length + results.missing.length;
  const successRate = total > 0 ? Math.round((results.valid.length / total) * 100) : 0;

  console.log(info('📊 RESUMO:'));
  console.log(`   Total de variáveis verificadas: ${total}`);
  console.log(`   Variáveis válidas: ${results.valid.length}`);
  console.log(`   Taxa de sucesso: ${successRate}%`);

  if (results.missing.length === 0 && results.invalid.length === 0) {
    console.log(success('\n🎉 Todas as variáveis obrigatórias estão configuradas corretamente!'));
  } else {
    console.log(error('\n🚨 Existem problemas que precisam ser resolvidos antes de iniciar o servidor.'));
  }
}

function createEnvFromExample() {
  const envPath = path.join(process.cwd(), '.env');
  const examplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    console.log(info('📄 Arquivo .env não encontrado. Criando a partir do exemplo...'));
    
    try {
      const exampleContent = fs.readFileSync(examplePath, 'utf8');
      fs.writeFileSync(envPath, exampleContent);
      console.log(success('✅ Arquivo .env criado com sucesso!'));
      console.log(warning('⚠️  Por favor, edite o arquivo .env com seus valores reais antes de continuar.'));
      return true;
    } catch (err) {
      console.error(error(`❌ Erro ao criar arquivo .env:`), err.message);
      return false;
    }
  }
  
  return false;
}

// Função principal
async function main() {
  try {
    // Verificar se .env existe
    if (!fs.existsSync(path.join(process.cwd(), '.env'))) {
      const created = createEnvFromExample();
      if (created) {
        process.exit(1);
      }
    }

    // Carregar variáveis de ambiente
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (value && !value.startsWith('#')) {
            process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
          }
        }
      });
    }

    // Executar validação
    const results = checkEnvironmentVariables();
    generateReport(results);

    // Verificar se há erros críticos
    const hasCriticalErrors = results.missing.length > 0 || results.invalid.length > 0;

    if (hasCriticalErrors) {
      console.log(error('\n🛑 Validação falhou! Corrija os erros acima antes de iniciar o servidor.'));
      process.exit(1);
    } else {
      console.log(success('\n✅ Validação concluída com sucesso!'));
      process.exit(0);
    }

  } catch (err) {
    console.error(error('❌ Erro durante a validação:'), err.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkEnvironmentVariables, REQUIRED_ENV_VARS };