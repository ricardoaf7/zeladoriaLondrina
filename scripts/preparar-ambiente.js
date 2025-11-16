/**
 * Script de preparação do ambiente
 * Prepara tudo para começar a trabalhar amanhã
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando ambiente para trabalho...\n');

// 1. Verificar estrutura de pastas
console.log('📁 Verificando estrutura de pastas...');
const pastasImportantes = [
  'client/src/components',
  'client/src/pages', 
  'server/data',
  'scripts',
  'dist'
];

pastasImportantes.forEach(pasta => {
  const caminho = path.join(__dirname, '..', pasta);
  if (fs.existsSync(caminho)) {
    console.log(`✅ ${pasta} - OK`);
  } else {
    console.log(`❌ ${pasta} - Criando...`);
    fs.mkdirSync(caminho, { recursive: true });
  }
});

// 2. Verificar arquivos essenciais
console.log('\n📄 Verificando arquivos essenciais...');
const arquivosImportantes = [
  'package.json',
  'vercel.json',
  'client/src/App.tsx',
  'client/src/main.tsx',
  'server/index.ts',
  'server/routes.ts'
];

arquivosImportantes.forEach(arquivo => {
  const caminho = path.join(__dirname, '..', arquivo);
  if (fs.existsSync(caminho)) {
    console.log(`✅ ${arquivo} - OK`);
  } else {
    console.log(`❌ ${arquivo} - Faltando!`);
  }
});

// 3. Verificar dependências
console.log('\n📦 Verificando dependências...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const dependencias = Object.keys(packageJson.dependencies || {});
  const devDependencias = Object.keys(packageJson.devDependencies || {});
  
  console.log(`✅ Dependências principais: ${dependencias.length}`);
  console.log(`✅ Dependências de dev: ${devDependencias.length}`);
  
  // Verificar dependências críticas
  const criticas = ['react', 'react-dom', 'express', 'leaflet', 'tailwindcss'];
  criticas.forEach(dep => {
    if (dependencias.includes(dep) || devDependencias.includes(dep)) {
      console.log(`✅ ${dep} - Instalado`);
    } else {
      console.log(`❌ ${dep} - Faltando!`);
    }
  });
} catch (error) {
  console.log('❌ Erro ao ler package.json:', error.message);
}

// 4. Criar arquivos de dados se não existirem
console.log('\n💾 Criando arquivos de dados iniciais...');

const dadosAreas = [
  {
    id: 1,
    endereco: "Rua Paraná, 123",
    bairro: "Centro",
    tipo: "area_publica",
    metragem_m2: 500,
    lat: -23.3045,
    lng: -51.1692,
    status: "pendente",
    ultima_rocagem: null,
    observacoes: "Área teste - Centro"
  },
  {
    id: 2,
    endereco: "Av. Higienópolis, 456",
    bairro: "Higienópolis",
    tipo: "praça",
    metragem_m2: 750,
    lat: -23.3123,
    lng: -51.1587,
    status: "em_andamento",
    ultima_rocagem: "2024-11-10",
    observacoes: "Praça principal - Em roçagem"
  },
  {
    id: 3,
    endereco: "Rua Amazonas, 789",
    bairro: "Parque das Nações",
    tipo: "canteiros",
    metragem_m2: 320,
    lat: -23.3089,
    lng: -51.1456,
    status: "concluido",
    ultima_rocagem: "2024-11-05",
    observacoes: "Canteiros centrais - Concluído"
  }
];

const caminhoDados = path.join(__dirname, '..', 'server', 'data', 'areas-simples.json');
if (!fs.existsSync(caminhoDados)) {
  fs.writeFileSync(caminhoDados, JSON.stringify(dadosAreas, null, 2));
  console.log('✅ Criado: areas-simples.json com dados de teste');
} else {
  console.log('✅ areas-simples.json já existe');
}

// 5. Criar template de componente simplificado
console.log('\n🧩 Criando template de componente...');
const templateComponente = `import React from 'react';

interface SimpleDashboardProps {
  areas: any[];
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ areas }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Simplificado</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total de Áreas</h3>
          <p className="text-3xl font-bold text-blue-600">{areas.length}</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Concluídas</h3>
          <p className="text-3xl font-bold text-green-600">
            {areas.filter(a => a.status === 'concluido').length}
          </p>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {areas.filter(a => a.status === 'pendente').length}
          </p>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Áreas Recentes</h3>
        <div className="space-y-2">
          {areas.slice(0, 3).map(area => (
            <div key={area.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">{area.endereco}</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-200">{area.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
`;

const caminhoTemplate = path.join(__dirname, '..', 'client', 'src', 'components', 'SimpleDashboard.tsx');
if (!fs.existsSync(caminhoTemplate)) {
  fs.writeFileSync(caminhoTemplate, templateComponente);
  console.log('✅ Criado: SimpleDashboard.tsx');
} else {
  console.log('✅ SimpleDashboard.tsx já existe');
}

// 6. Verificar configurações do Vercel
console.log('\n⚡ Verificando configurações do Vercel...');
const caminhoVercel = path.join(__dirname, '..', 'vercel.json');
if (fs.existsSync(caminhoVercel)) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(caminhoVercel, 'utf8'));
    console.log(`✅ Configuração Vercel encontrada`);
    console.log(`   - Nome: ${vercelConfig.name || 'Não definido'}`);
    console.log(`   - Framework: ${vercelConfig.framework || 'Não definido'}`);
    console.log(`   - Rotas: ${vercelConfig.routes?.length || 0} configuradas`);
  } catch (error) {
    console.log('❌ Erro ao ler vercel.json:', error.message);
  }
} else {
  console.log('❌ vercel.json não encontrado!');
}

// 7. Criar script de desenvolvimento rápido
console.log('\n📝 Criando script de desenvolvimento...');
const scriptDev = `#!/bin/bash
# Script rápido para desenvolvimento

echo "🚀 Iniciando desenvolvimento..."

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Há mudanças não commitadas"
  read -p "Deseja fazer stash? (s/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    git stash
  fi
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

# Build rápido
echo "🏗️  Fazendo build..."
npm run build

# Testar localmente
echo "🧪 Testando localmente..."
npm run dev &
DEV_PID=$!

echo "🌐 Servidor rodando em http://localhost:5173"
echo "💡 Pressione Ctrl+C para parar"

# Aguardar interrupção
trap "kill $DEV_PID 2>/dev/null" EXIT
wait $DEV_PID
`;

const caminhoScriptDev = path.join(__dirname, 'start-dev.sh');
fs.writeFileSync(caminhoScriptDev, scriptDev);
fs.chmodSync(caminhoScriptDev, '755');
console.log('✅ Criado: start-dev.sh (script de desenvolvimento)');

// 8. Resumo final
console.log('\n' + '='.repeat(50));
console.log('🎯 RESUMO DA PREPARAÇÃO');
console.log('='.repeat(50));
console.log('✅ Ambiente preparado com sucesso!');
console.log('✅ Arquivos de dados criados');
console.log('✅ Template de componente pronto');
console.log('✅ Script de desenvolvimento criado');
console.log('✅ Configurações verificadas');
console.log('');
console.log('🚀 PRÓXIMOS PASSOS:');
console.log('1. Execute: npm install');
console.log('2. Execute: npm run build');
console.log('3. Execute: npm run dev');
console.log('4. Acesse: http://localhost:5173');
console.log('');
console.log('💡 Use: ./scripts/start-dev.sh para iniciar rápido');
console.log('🎯 Boa sorte amanhã! Você consegue! 💪');