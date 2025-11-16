/**
 * Script de verificação de deployment
 * Verifica se todas as rotas estão funcionando corretamente no deploy
 */

const https = require('https');
const http = require('http');

// Configurações
const DEPLOY_URL = 'https://zeladoria-londrina.vercel.app';
const TIMEOUT = 10000; // 10 segundos

// Rotas para testar
const ROUTES_TO_TEST = [
  {
    path: '/',
    expectedStatus: 200,
    description: 'Página inicial'
  },
  {
    path: '/dashboard-eficiencia',
    expectedStatus: 200,
    description: 'Dashboard de eficiência'
  },
  {
    path: '/consulta-coleta',
    expectedStatus: 200,
    description: 'Consulta de coleta'
  },
  {
    path: '/map-performance',
    expectedStatus: 200,
    description: 'Mapa de performance'
  },
  {
    path: '/ocr-import',
    expectedStatus: 200,
    description: 'Importação OCR'
  },
  {
    path: '/api/status',
    expectedStatus: 200,
    description: 'Status da API'
  },
  {
    path: '/api/analytics/kpis',
    expectedStatus: 200,
    description: 'KPIs de analytics'
  },
  {
    path: '/api/coleta/consulta',
    expectedStatus: 200,
    description: 'API de consulta de coleta'
  },
  {
    path: '/api/map/areas',
    expectedStatus: 200,
    description: 'API de áreas do mapa'
  },
  {
    path: '/ping',
    expectedStatus: 200,
    description: 'Health check'
  }
];

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      timeout: options.timeout || TIMEOUT,
      headers: {
        'User-Agent': 'Zeladoria-Deployment-Checker/1.0'
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data.substring(0, 200), // Primeiros 200 chars
          success: true
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        statusText: 'Connection Error',
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        statusText: 'Timeout',
        error: 'Request timeout',
        success: false
      });
    });

    req.end();
  });
}

// Função principal de teste
async function testRoute(route) {
  const url = `${DEPLOY_URL}${route.path}`;
  console.log(`⏳ Testando: ${route.description}`);
  console.log(`   URL: ${url}`);
  
  const startTime = Date.now();
  const response = await makeRequest(url);
  const duration = Date.now() - startTime;
  
  const result = {
    ...route,
    url,
    duration,
    actualStatus: response.status,
    success: response.success && response.status === route.expectedStatus,
    response
  };
  
  if (result.success) {
    console.log(`✅ SUCESSO - ${response.status} (${duration}ms)`);
  } else {
    console.log(`❌ FALHA - ${response.status} ${response.statusText} (${duration}ms)`);
    if (response.error) {
      console.log(`   Erro: ${response.error}`);
    }
  }
  
  return result;
}

// Função para verificar se há dados no mapa
async function checkMapData() {
  console.log('');
  console.log('🗺️  Verificando dados do mapa...');
  
  try {
    const response = await makeRequest(`${DEPLOY_URL}/api/map/areas`);
    
    if (response.success && response.status === 200) {
      try {
        const data = JSON.parse(response.data);
        const areas = data.data || [];
        console.log(`📍 Encontradas ${areas.length} áreas no mapa`);
        
        if (areas.length > 0) {
          // Verificar se há coordenadas
          const areasWithCoords = areas.filter(area => area.lat && area.lng).length;
          console.log(`📍 ${areasWithCoords} áreas têm coordenadas`);
          
          // Mostrar amostra de áreas
          if (areas.length > 0) {
            console.log('📋 Amostra de áreas:');
            areas.slice(0, 3).forEach((area, index) => {
              console.log(`   ${index + 1}. ${area.endereco || area.tipo} - ${area.bairro} (${area.metragem_m2}m²)`);
            });
          }
        } else {
          console.log('⚠️  Nenhuma área encontrada no mapa');
        }
      } catch (parseError) {
        console.log('⚠️  Erro ao analisar dados do mapa:', parseError.message);
      }
    } else {
      console.log('❌ Falha ao buscar dados do mapa');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar dados do mapa:', error.message);
  }
}

// Função principal
async function main() {
  console.log('🔍 Verificação de Deployment - Zeladoria Londrina');
  console.log('================================================');
  console.log(`URL: ${DEPLOY_URL}`);
  console.log(`Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log('');
  
  // Testar todas as rotas
  console.log('🧪 Testando rotas...');
  console.log('');
  
  const results = [];
  for (const route of ROUTES_TO_TEST) {
    const result = await testRoute(route);
    results.push(result);
    console.log('');
  }
  
  // Verificar dados do mapa
  await checkMapData();
  
  // Resumo final
  console.log('');
  console.log('📊 Resumo Final');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = Math.round(totalDuration / results.length);
  
  console.log(`✅ Sucesso: ${successful}/${results.length}`);
  console.log(`❌ Falhas: ${failed}/${results.length}`);
  console.log(`⏱️  Tempo médio: ${avgDuration}ms`);
  console.log(`⏱️  Tempo total: ${totalDuration}ms`);
  
  if (failed > 0) {
    console.log('');
    console.log('Rotas com falhas:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.description} (${r.path}): ${r.actualStatus} ${r.response?.statusText || 'Unknown'}`);
    });
  }
  
  console.log('');
  if (failed === 0) {
    console.log('🎉 TODAS AS ROTAS ESTÃO FUNCIONANDO!');
  } else {
    console.log('⚠️  ALGUMAS ROTAS ESTÃO COM PROBLEMAS');
  }
  
  console.log('');
  console.log('✅ Verificação concluída!');
}

// Executar
main().catch(error => {
  console.error('❌ Erro durante a verificação:', error);
  process.exit(