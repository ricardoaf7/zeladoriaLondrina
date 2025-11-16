/**
 * Health Check System - Zeladoria Londrina
 * Sistema de verificação de saúde em ESM
 */

import http from 'http';
import https from 'https';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const CONFIG = {
  BASE_URL: process.env.VITE_APP_URL || 'http://localhost:5173',
  API_URL: process.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  LOG_FILE: 'logs/health-check.log'
};

// Logger simples
class Logger {
  constructor() {
    this.ensureLogDirectory();
  }
  
  ensureLogDirectory() {
    const logDir = path.dirname(CONFIG.LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${Object.keys(data).length > 0 ? JSON.stringify(data) : ''}\n`;
    
    console.log(logMessage.trim());
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage);
  }
  
  info(message, data) { this.log('info', message, data); }
  error(message, data) { this.log('error', message, data); }
  success(message, data) { this.log('success', message, data); }
}

const logger = new Logger();

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || CONFIG.TIMEOUT
    };
    
    const req = client.request(reqOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Função para testar o status da aplicação
async function checkStatus() {
  logger.info('🏥 Iniciando verificação de saúde...');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    overall: 'unknown'
  };
  
  try {
    // 1. Testar API Status
    logger.info('Verificando API status...');
    try {
      const response = await makeRequest(`${CONFIG.API_URL}/status`);
      results.checks.api = {
        status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
        statusCode: response.statusCode,
        responseTime: Date.now() - results.timestamp
      };
      logger.success('✅ API está respondendo');
    } catch (error) {
      results.checks.api = {
        status: 'unhealthy',
        error: error.message
      };
      logger.error('❌ API não está respondendo', { error: error.message });
    }
    
    // 2. Testar Frontend
    logger.info('Verificando frontend...');
    try {
      const response = await makeRequest(CONFIG.BASE_URL);
      results.checks.frontend = {
        status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
        statusCode: response.statusCode
      };
      logger.success('✅ Frontend está acessível');
    } catch (error) {
      results.checks.frontend = {
        status: 'unhealthy',
        error: error.message
      };
      logger.error('❌ Frontend não está acessível', { error: error.message });
    }
    
    // 3. Testar OCR Endpoint
    logger.info('Verificando sistema OCR...');
    try {
      const testData = {
        ocrText: 'area publica av. teste casoni 1000,00 -23,3000000 -51,1500000 1',
        validateOnly: true
      };
      
      const response = await makeRequest(`${CONFIG.API_URL}/ocr/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const data = JSON.parse(response.data);
      results.checks.ocr = {
        status: data.success ? 'healthy' : 'unhealthy',
        areasFound: data.data?.areas?.length || 0
      };
      logger.success('✅ Sistema OCR está funcionando');
    } catch (error) {
      results.checks.ocr = {
        status: 'unhealthy',
        error: error.message
      };
      logger.error('❌ Sistema OCR não está funcionando', { error: error.message });
    }
    
    // 4. Testar Analytics
    logger.info('Verificando analytics...');
    try {
      const response = await makeRequest(`${CONFIG.API_URL}/analytics/kpis`);
      results.checks.analytics = {
        status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
        statusCode: response.statusCode
      };
      logger.success('✅ Analytics está respondendo');
    } catch (error) {
      results.checks.analytics = {
        status: 'unhealthy',
        error: error.message
      };
      logger.error('❌ Analytics não está respondendo', { error: error.message });
    }
    
    // 5. Testar Mapa
    logger.info('Verificando mapa...');
    try {
      const response = await makeRequest(`${CONFIG.API_URL}/map/areas`);
      results.checks.map = {
        status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
        statusCode: response.statusCode
      };
      logger.success('✅ Mapa está respondendo');
    } catch (error) {
      results.checks.map = {
        status: 'unhealthy',
        error: error.message
      };
      logger.error('❌ Mapa não está respondendo', { error: error.message });
    }
    
    // Calcular status geral
    const statuses = Object.values(results.checks).map(check => check.status);
    const healthyCount = statuses.filter(status => status === 'healthy').length;
    const unhealthyCount = statuses.filter(status => status === 'unhealthy').length;
    
    if (unhealthyCount > 0) {
      results.overall = unhealthyCount >= 3 ? 'critical' : 'degraded';
    } else {
      results.overall = 'healthy';
    }
    
    results.summary = {
      total: statuses.length,
      healthy: healthyCount,
      unhealthy: unhealthyCount,
      degraded: statuses.filter(status => status === 'degraded').length
    };
    
    logger.info('🏥 Verificação de saúde concluída');
    logger.info(`📊 Status geral: ${results.overall.toUpperCase()}`);
    logger.info(`✅ Saudáveis: ${healthyCount}/${statuses.length}`);
    
    if (unhealthyCount > 0) {
      logger.error(`❌ Com problemas: ${unhealthyCount}/${statuses.length}`);
    }
    
    return results;
    
  } catch (error) {
    logger.error('❌ Erro crítico na verificação', { error: error.message });
    results.overall = 'error';
    results.error = error.message;
    return results;
  }
}

// Função principal
async function main() {
  console.log('🚀 Health Check - Zeladoria Londrina');
  console.log('=' .repeat(50));
  
  try {
    const results = await checkStatus();
    
    console.log('\n📋 Relatório de Saúde:');
    console.log(`   Status: ${results.overall.toUpperCase()}`);
    console.log(`   Timestamp: ${results.timestamp}`);
    
    console.log('\n🔍 Detalhes por Componente:');
    for (const [component, check] of Object.entries(results.checks)) {
      const emoji = check.status === 'healthy' ? '✅' : '❌';
      console.log(`   ${emoji} ${component}: ${check.status}`);
      if (check.error) {
        console.log(`      Erro: ${check.error}`);
      }
    }
    
    console.log('\n📈 Resumo:');
    console.log(`   Total verificado: ${results.summary.total}`);
    console.log(`   Saudáveis: ${results.summary.healthy}`);
    console.log(`   Com problemas: ${results.summary.unhealthy}`);
    
    // Salvar relatório
    const reportFile = `health-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Relatório salvo em: ${reportFile}`);
    
    // Exit code baseado no status
    if (results.overall === 'healthy') {
      process.exit(0);
    } else if (results.overall === 'degraded') {
      process.exit(1);
    } else {
      process.exit(2);
    }
    
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(3);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkStatus, logger };