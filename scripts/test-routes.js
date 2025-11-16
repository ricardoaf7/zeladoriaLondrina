/**
 * Script de teste de rotas
 * Verifica se todas as rotas estão funcionando corretamente
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const ROUTES_TO_TEST = [
  '/',
  '/api/status',
  '/dashboard-eficiencia',
  '/consulta-coleta',
  '/map-performance',
  '/ocr-import',
  '/api/analytics/kpis',
  '/api/coleta/consulta',
  '/api/map/areas',
  '/api/ocr/process'
];

function testRoute(route) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: route,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          route,
          status: res.statusCode,
          statusText: res.statusMessage,
          success: res.statusCode >= 200 && res.statusCode < 400,
          contentType: res.headers['content-type']
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        route,
        status: 0,
        statusText: 'Connection Error',
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        route,
        status: 0,
        statusText: 'Timeout',
        success: false,
        error: 'Request timeout'
      });
    });

    req.setTimeout(5000);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Iniciando testes de rotas...');
  console.log(`📍 URL base: ${BASE_URL}`);
  console.log('');

  const results = [];
  
  for (const route of ROUTES_TO_TEST) {
    console.log(`⏳ Testando: ${route}`);
    const result = await testRoute(route);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${route} - ${result.status} ${result.statusText}`);
    } else {
      console.log(`❌ ${route} - ${result.status} ${result.statusText}`);
      if (result.error) {
        console.log(`   Erro: ${result.error}`);
      }
    }
  }

  console.log('');
  console.log('📊 Resumo dos testes:');
  console.log('========================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Sucesso: ${successful}/${results.length}`);
  console.log(`❌ Falhas: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('');
    console.log('Rotas com falhas:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.route}: ${r.status} ${r.statusText}`);
    });
  }

  console.log('');
  console.log('🎯 Testes concluídos!');
}

// Verificar se servidor está rodando antes de testar
function checkServer() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/ping',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.setTimeout(3000);
    req.end();
  });
}

// Executar testes
async function main() {
  console.log('🔍 Verificando se servidor está rodando...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Servidor não está rodando em localhost:5000');
    console.log('💡 Inicie o servidor com: npm start');
    process.exit(1);
  }
  
  console.log('✅ Servidor está rodando!');
  await runTests();
}

main().catch(console.error);