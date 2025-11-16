#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

console.log('🔍 Validando configurações de segurança...\n');

// Carregar variáveis do .env
dotenv.config();

// Obter variáveis do process.env
const envVars = { ...process.env };

// Variáveis obrigatórias
const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const results = {
  valid: [],
  invalid: [],
  missing: []
};

// Verificar cada variável
required.forEach(varName => {
  const value = envVars[varName];
  
  if (!value) {
    results.missing.push(varName);
    return;
  }
  
  // Validações específicas
  if (varName === 'VITE_SUPABASE_URL') {
    if (value.includes('sua-instancia') || !value.includes('supabase.co')) {
      results.invalid.push(`${varName} (URL padrão não configurada)`);
    } else {
      results.valid.push(varName);
    }
  } else if (varName.includes('_KEY')) {
    if (value.includes('sua-chave') || value.length < 50) {
      results.invalid.push(`${varName} (Chave padrão não configurada)`);
    } else {
      results.valid.push(varName);
    }
  } else {
    results.valid.push(varName);
  }
});

// Relatório
console.log('📋 RELATÓRIO DE SEGURANÇA\n');

if (results.valid.length > 0) {
  console.log(`✅ Variáveis configuradas (${results.valid.length}):`);
  results.valid.forEach(varName => console.log(`   ✓ ${varName}`));
  console.log();
}

if (results.invalid.length > 0) {
  console.log(`❌ Variáveis com problemas (${results.invalid.length}):`);
  results.invalid.forEach(varName => console.log(`   ✗ ${varName}`));
  console.log();
}

if (results.missing.length > 0) {
  console.log(`🔴 Variáveis faltando (${results.missing.length}):`);
  results.missing.forEach(varName => console.log(`   ✗ ${varName}`));
  console.log();
}

// Resumo
const total = results.valid.length + results.invalid.length + results.missing.length;
const successRate = total > 0 ? Math.round((results.valid.length / total) * 100) : 0;

console.log('📊 RESUMO:');
console.log(`   Total de variáveis verificadas: ${total}`);
console.log(`   Variáveis válidas: ${results.valid.length}`);
console.log(`   Taxa de sucesso: ${successRate}%`);

if (results.missing.length === 0 && results.invalid.length === 0) {
  console.log('\n🎉 Todas as variáveis de segurança estão configuradas corretamente!');
  console.log('\n⚠️  Lembre-se de configurar as chaves com valores reais antes da produção!');
  process.exit(0);
} else {
  console.log('\n🚨 Existem problemas de segurança que precisam ser resolvidos!');
  console.log('\n💡 Execute: npm run security:keys -- --show');
  console.log('   Para gerar chaves seguras automaticamente.');
  process.exit(1);
}