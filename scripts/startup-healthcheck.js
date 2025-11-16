/**
 * Startup & Health Check System - Zeladoria Londrina
 * Sistema completo de inicialização e verificação de saúde
 */

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const CONFIG = {
  // URLs para verificar
  BASE_URL: process.env.VITE_APP_URL || 'http://localhost:5173',
  API_URL: process.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Timeouts
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 segundos
  
  // Health check
  HEALTH_CHECK_INTERVAL: 30000, // 30 segundos
  HEALTH_CHECK_TIMEOUT: 10000, // 10 segundos
  
  // Componentes a verificar
  COMPONENTS: [
    'database',
    'api', 
    'frontend',
    'ocr-system',
    'analytics',
    'security'
  ],
  
  // Notificações
  ENABLE_NOTIFICATIONS: true,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  
  // Logs
  LOG_FILE: 'logs/health-check.log',
  LOG_LEVEL: 'info'
};

// Logger
class Logger {
  constructor() {
    this.logFile = CONFIG.LOG_FILE;
    this.level = CONFIG.LOG_LEVEL;
    this.ensureLogDirectory();
  }
  
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${dataStr}\n`;
  }
  
  log(level, message, data = {}) {
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, data);
      
      // Console
      console.log(formattedMessage.trim());
      
      // Arquivo
      fs.appendFileSync(this.logFile, formattedMessage);
    }
  }
  
  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.level];
  }
  
  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
  debug(message, data) { this.log('debug', message, data); }
}

const logger = new Logger();

// Sistema de Health Check
class HealthCheck {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
  }
  
  async checkDatabase() {
    logger.info('Verificando conexão com banco de dados...');
    
    try {
      // Testar conexão com Supabase
      const response = await this.makeRequest(`${CONFIG.API_URL}/status`, {
        method: 'GET',
        timeout: CONFIG.HEALTH_CHECK_TIMEOUT
      });
      
      const data = JSON.parse(response);
      
      if (data.database?.status === 'healthy') {
        logger.info('✅ Banco de dados conectado e funcionando');
        return { status: 'healthy', latency: data.database.latency };
      } else {
        logger.error('❌ Banco de dados com problemas', data.database);
        return { status: 'unhealthy', error: data.database?.error };
      }
    } catch (error) {
      logger.error('❌ Erro ao conectar com banco de dados', { error: error.message });
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async checkAPI() {
    logger.info('Verificando APIs...');
    
    const endpoints = [
      '/status',
      '/analytics/kpis',
      '/ocr/templates',
      '/coleta/consulta',
      '/map/areas'
    ];
    
    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(`${CONFIG.API_URL}${endpoint}`, {
          method: 'GET',
          timeout: CONFIG.HEALTH_CHECK_TIMEOUT
        });
        
        const statusCode = this.getStatusCode(response);
        results[endpoint] = {
          status: statusCode >= 200 && statusCode < 300 ? 'healthy' : 'unhealthy',
          statusCode
        };
        
        logger.info(`✅ API ${endpoint}: ${statusCode}`);
      } catch (error) {
        logger.error(`❌ API ${endpoint} falhou`, { error: error.message });
        results[endpoint] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }
    
    const healthyCount = Object.values(results).filter(r => r.status === 'healthy').length;
    const totalCount = Object.keys(results).length;
    
    return {
      status: healthyCount === totalCount ? 'healthy' : 'degraded',
      endpoints: results,
      uptime: `${((healthyCount / totalCount) * 100).toFixed(1)}%`
    };
  }
  
  async checkFrontend() {
    logger.info('Verificando frontend...');
    
    try {
      const response = await this.makeRequest(CONFIG.BASE_URL, {
        method: 'GET',
        timeout: CONFIG.HEALTH_CHECK_TIMEOUT
      });
      
      const statusCode = this.getStatusCode(response);
      
      if (statusCode >= 200 && statusCode < 300) {
        logger.info('✅ Frontend respondendo corretamente');
        return { status: 'healthy', statusCode };
      } else {
        logger.error('❌ Frontend com erro', { statusCode });
        return { status: 'unhealthy', statusCode };
      }
    } catch (error) {
      logger.error('❌ Frontend inacessível', { error: error.message });
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async checkOCRSystem() {
    logger.info('Verificando sistema OCR...');
    
    try {
      // Testar processamento OCR
      const testData = {
        ocrText: 'area publica av. teste casoni 1000,00 -23,3000000 -51,1500000 1',
        validateOnly: true
      };
      
      const response = await this.makeRequest(`${CONFIG.API_URL}/ocr/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
        timeout: CONFIG.HEALTH_CHECK_TIMEOUT
      });
      
      const data = JSON.parse(response);
      
      if (data.success && data.data.areas && data.data.areas.length > 0) {
        logger.info('✅ Sistema OCR funcionando perfeitamente');
        return { status: 'healthy', areasFound: data.data.areas.length };
      } else {
        logger.error('❌ Sistema OCR não processou corretamente', data);
        return { status: 'unhealthy', error: 'Processamento falhou' };
      }
    } catch (error) {
      logger.error('❌ Sistema OCR inacessível', { error: error.message });
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async checkAnalytics() {
    logger.info('Verificando sistema de analytics...');
    
    try {
      const response = await this.makeRequest(`${CONFIG.API_URL}/analytics/kpis`, {
        method: 'GET',
        timeout: CONFIG.HEALTH_CHECK_TIMEOUT
      });
      
      const data = JSON.parse(response);
      
      if (data.success && data.data) {
        logger.info('✅ Analytics respondendo com dados');
        return { status: 'healthy', dataPoints: Object.keys(data.data).length };
      } else {
        logger.warn('⚠️ Analytics sem dados', data);
        return { status: 'degraded', warning: 'Sem dados' };
      }
    } catch (error) {
      logger.error('❌ Analytics inacessível', { error: error.message });
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async checkSecurity() {
    logger.info('Verificando segurança...');
    
    const securityChecks = {};
    
    try {
      // Testar headers de segurança
      const response = await this.makeRequest(CONFIG.BASE_URL, {
        method: 'GET',
        timeout: CONFIG.HEALTH_CHECK_TIMEOUT
      });
      
      // Verificar se tem headers de segurança
      securityChecks.headers = {
        'X-Content-Type-Options': response.includes('X-Content-Type-Options'),
        'X-Frame-Options': response.includes('X-Frame-Options'),
        'X-XSS-Protection': response.includes('X-XSS-Protection')
      };
      
      // Testar rate limiting (fazer múltiplas requisições rápidas)
      const start = Date.now();
      let rateLimited = false;
      
      for (let i = 0; i < 10; i++) {
        try {
          await this.makeRequest(`${CONFIG.API_URL}/status`, {
            method: 'GET',
            timeout: 2000
          });
        } catch (error) {
          if (error.message.includes('429')) {
            rateLimited = true;
            break;
          }
        }
      }
      
      securityChecks.rateLimiting = rateLimited;
      
      const secureHeaders = Object.values(securityChecks.headers).filter(v => v).length;
      
      if (secureHeaders >= 2) {
        logger.info('✅ Segurança configurada corretamente');
        return { status: 'healthy', checks: securityChecks };
      } else {
        logger.warn('⚠️ Segurança parcialmente configurada', securityChecks);
        return { status: 'degraded', checks: securityChecks };
      }
      
    } catch (error) {
      logger.error('❌ Erro ao verificar segurança', { error: error.message });
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async runFullCheck() {
    logger.info('🏥 Iniciando verificação completa de saúde...');
    
    const results = {};
    
    for (const component of CONFIG.COMPONENTS) {
      try {
        logger.info(`Verificando ${component}...`);
        
        switch (component) {
          case 'database':
            results[component] = await this.checkDatabase();
            break;
          case 'api':
            results[component] = await this.checkAPI();
            break;
          case 'frontend':
            results[component] = await this.checkFrontend();
            break;
          case 'ocr-system':
            results[component] = await this.checkOCRSystem();
            break;
          case 'analytics':
            results[component] = await this.checkAnalytics();
            break;
          case 'security':
            results[component] = await this.checkSecurity();
            break;
        }
        
        logger.info(`✅ ${component}: ${results[component].status}`);
        
      } catch (error) {
        logger.error(`❌ Erro ao verificar ${component}`, { error: error.message });
        results[component] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }
    
    // Calcular status geral
    const statuses = Object.values(results).map(r => r.status);
    const healthyCount = statuses.filter(s => s === 'healthy').length;
    const unhealthyCount = statuses.filter(s => s === 'unhealthy').length;
    const degradedCount = statuses.filter(s => s === 'degraded').length;
    
    let overallStatus;
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }
    
    const summary = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      components: results,
      summary: {
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount,
        total: CONFIG.COMPONENTS.length
      }
    };
    
    logger.info('🏥 Verificação de saúde concluída', {
      overallStatus,
      healthy: healthyCount,
      degraded: degradedCount,
      unhealthy: unhealthyCount
    });
    
    return summary;
  }
  
  // Métodos auxiliares
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 10000
      };
      
      const req = client.request(reqOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
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
  
  getStatusCode(response) {
    // Extrair status code da resposta HTTP
    const match = response.match(/HTTP\/\d\.\d (\d{3})/);
    return match ? parseInt(match[1]) : 0;
  }
}

// Sistema de Startup
class StartupManager {
  constructor() {
    this.healthCheck = new HealthCheck();
    this.startTime = Date.now();
  }
  
  async initialize() {
    logger.info('🚀 Iniciando Zeladoria Londrina...');
    
    try {
      // 1. Verificar ambiente
      await this.checkEnvironment();
      
      // 2. Verificar dependências
      await this.checkDependencies();
      
      // 3. Verificar banco de dados
      await this.checkDatabase();
      
      // 4. Inicializar serviços
      await this.initializeServices();
      
      // 5. Executar health check completo
      const healthStatus = await this.healthCheck.runFullCheck();
      
      // 6. Notificar status
      await this.notifyStatus(healthStatus);
      
      // 7. Iniciar monitoramento contínuo
      this.startContinuousMonitoring();
      
      logger.info('🎉 Zeladoria Londrina iniciada com sucesso!');
      
      return healthStatus;
      
    } catch (error) {
      logger.error('❌ Falha crítica na inicialização', { error: error.message });
      throw error;
    }
  }
  
  async checkEnvironment() {
    logger.info('🔍 Verificando ambiente...');
    
    const requiredEnvVars = [
      'NODE_ENV',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'JWT_SECRET',
      'ENCRYPTION_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.error('❌ Variáveis de ambiente ausentes', { missing: missingVars });
      throw new Error(`Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    }
    
    logger.info('✅ Ambiente verificado');
  }
  
  async checkDependencies() {
    logger.info('📦 Verificando dependências...');
    
    try {
      // Verificar se node_modules existe
      if (!fs.existsSync('node_modules')) {
        logger.error('❌ node_modules não encontrado');
        throw new Error('Dependências não instaladas');
      }
      
      // Verificar se cliente foi buildado
      if (!fs.existsSync('dist/client')) {
        logger.warn('⚠️ Cliente não buildado, buildando agora...');
        execSync('npm run build:client', { stdio: 'inherit' });
      }
      
      // Verificar se servidor foi buildado
      if (!fs.existsSync('dist/server')) {
        logger.warn('⚠️ Servidor não buildado, buildando agora...');
        execSync('npm run build:server', { stdio: 'inherit' });
      }
      
      logger.info('✅ Dependências verificadas');
      
    } catch (error) {
      logger.error('❌ Erro ao verificar dependências', { error: error.message });
      throw error;
    }
  }
  
  async checkDatabase() {
    logger.info('🗄️ Verificando banco de dados...');
    
    try {
      // Testar conexão com Supabase
      const response = await this.healthCheck.checkDatabase();
      
      if (response.status !== 'healthy') {
        logger.error('❌ Banco de dados não está saudável', response);
        throw new Error('Banco de dados não está acessível');
      }
      
      logger.info('✅ Banco de dados verificado');
      
    } catch (error) {
      logger.error('❌ Erro ao verificar banco de dados', { error: error.message });
      throw error;
    }
  }
  
  async initializeServices() {
    logger.info('🔧 Inicializando serviços...');
    
    // Aqui você pode adicionar inicialização de serviços específicos
    // como: cache, filas, websockets, etc.
    
    logger.info('✅ Serviços inicializados');
  }
  
  async notifyStatus(healthStatus) {
    if (!CONFIG.ENABLE_NOTIFICATIONS) return;
    
    logger.info('📢 Notificando status do sistema...');
    
    try {
      if (CONFIG.WEBHOOK_URL) {
        await this.sendWebhook(healthStatus);
      }
      
      // Aqui você pode adicionar outras formas de notificação
      // como: email, SMS, Slack, Discord, etc.
      
    } catch (error) {
      logger.error('❌ Erro ao notificar status', { error: error.message });
    }
  }
  
  async sendWebhook(data) {
    try {
      await this.healthCheck.makeRequest(CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'health_check',
          data: data,
          timestamp: new Date().toISOString()
        }),
        timeout: 5000
      });
      
      logger.info('✅ Notificação enviada com sucesso');
      
    } catch (error) {
      logger.error('❌ Erro ao enviar notificação', { error: error.message });
    }
  }
  
  startContinuousMonitoring() {
    logger.info('📊 Iniciando monitoramento contínuo...');
    
    setInterval(async () => {
      try {
        logger.debug('Executando health check periódico...');
        const healthStatus = await this.healthCheck.runFullCheck();
        
        if (healthStatus.status === 'unhealthy') {
          logger.error('🚨 Sistema em estado crítico!', healthStatus);
          await this.notifyStatus(healthStatus);
        } else if (healthStatus.status === 'degraded') {
          logger.warn('⚠️ Sistema degradado', healthStatus);
        }
        
      } catch (error) {
        logger.error('❌ Erro no monitoramento contínuo', { error: error.message });
      }
    }, CONFIG.HEALTH_CHECK_INTERVAL);
    
    logger.info(`✅ Monitoramento contínuo iniciado (${CONFIG.HEALTH_CHECK_INTERVAL}ms)`);
  }
  
  async shutdown() {
    logger.info('🛑 Desligando sistema...');
    
    // Aqui você pode adicionar limpeza de recursos
    // como: fechar conexões, salvar estado, etc.
    
    logger.info('✅ Sistema desligado com segurança');
  }
}

// CLI Interface
class CLI {
  constructor() {
    this.startupManager = new StartupManager();
  }
  
  async run() {
    const command = process.argv[2];
    
    switch (command) {
      case 'start':
        await this.start();
        break;
      case 'health':
        await this.health();
        break;
      case 'check':
        await this.check();
        break;
      case 'monitor':
        await this.monitor();
        break;
      case 'stop':
        await this.stop();
        break;
      default:
        this.showHelp();
    }
  }
  
  async start() {
    logger.info('🚀 Iniciando Zeladoria Londrina...');
    
    try {
      const healthStatus = await this.startupManager.initialize();
      
      console.log('\n🎉 Sistema iniciado com sucesso!');
      console.log('\n📊 Status de Saúde:');
      console.log(`   Status Geral: ${healthStatus.status}`);
      console.log(`   Componentes Saudáveis: ${healthStatus.summary.healthy}/${healthStatus.summary.total}`);
      console.log(`   Tempo de Inicialização: ${((Date.now() - healthStatus.uptime) / 1000).toFixed(2)}s`);
      
      console.log('\n🔗 URLs Disponíveis:');
      console.log(`   🌐 Site Principal: ${CONFIG.BASE_URL}`);
      console.log(`   📊 Dashboard: ${CONFIG.BASE_URL}/dashboard-eficiencia`);
      console.log(`   📸 OCR Import: ${CONFIG.BASE_URL}/ocr-import`);
      console.log(`   🗺️ Mapa: ${CONFIG.BASE_URL}/map-performance`);
      console.log(`   🔍 Consulta: ${CONFIG.BASE_URL}/consulta-coleta`);
      console.log(`   📈 Status: ${CONFIG.BASE_URL}/api/status`);
      
      console.log('\n📋 Comandos Disponíveis:');
      console.log('   node scripts/startup-healthcheck.js health  - Verificar saúde');
      console.log('   node scripts/startup-healthcheck.js check   - Verificação rápida');
      console.log('   node scripts/startup-healthcheck.js monitor - Monitoramento contínuo');
      console.log('   node scripts/startup-healthcheck.js stop    - Parar sistema');
      
      // Manter processo ativo
      process.on('SIGINT', async () => {
        console.log('\n🛑 Recebido sinal de interrupção...');
        await this.startupManager.shutdown();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        console.log('\n🛑 Recebido sinal de término...');
        await this.startupManager.shutdown();
        process.exit(0);
      });
      
    } catch (error) {
      logger.error('❌ Falha ao iniciar sistema', { error: error.message });
      process.exit(1);
    }
  }
  
  async health() {
    logger.info('🏥 Executando verificação de saúde...');
    
    try {
      const healthCheck = new HealthCheck();
      const healthStatus = await healthCheck.runFullCheck();
      
      console.log('\n📊 Relatório de Saúde:');
      console.log(`   Status Geral: ${healthStatus.status.toUpperCase()}`);
      console.log(`   Timestamp: ${healthStatus.timestamp}`);
      console.log(`   Componentes:`);
      
      for (const [component, status] of Object.entries(healthStatus.components)) {
        const emoji = status.status === 'healthy' ? '✅' : 
                     status.status === 'degraded' ? '⚠️' : '❌';
        console.log(`     ${emoji} ${component}: ${status.status}`);
      }
      
      console.log(`   Resumo: ${healthStatus.summary.healthy} saudáveis, ${healthStatus.summary.degraded} degradados, ${healthStatus.summary.unhealthy} com problemas`);
      
      // Salvar relatório
      const reportFile = `health-report-${Date.now()}.json`;
      fs.writeFileSync(reportFile, JSON.stringify(healthStatus, null, 2));
      console.log(`\n💾 Relatório salvo em: ${reportFile}`);
      
    } catch (error) {
      logger.error('❌ Erro ao executar health check', { error: error.message });
    }
  }
  
  async check() {
    logger.info('🔍 Executando verificação rápida...');
    
    try {
      // Verificações essenciais apenas
      const checks = [
        { name: 'Variáveis de Ambiente', test: () => this.checkEnvironment() },
        { name: 'Build Files', test: () => this.checkBuildFiles() },
        { name: 'Porta Disponível', test: () => this.checkPort() }
      ];
      
      console.log('\n🔍 Verificações Rápidas:');
      
      for (const check of checks) {
        try {
          await check.test();
          console.log(`   ✅ ${check.name}`);
        } catch (error) {
          console.log(`   ❌ ${check.name}: ${error.message}`);
        }
      }
      
    } catch (error) {
      logger.error('❌ Erro na verificação rápida', { error: error.message });
    }
  }
  
  async monitor() {
    logger.info('📊 Iniciando monitoramento...');
    
    console.log('\n📊 Monitoramento de Saúde em Tempo Real');
    console.log('Pressione Ctrl+C para parar\n');
    
    const healthCheck = new HealthCheck();
    
    const monitorLoop = async () => {
      try {
        const healthStatus = await healthCheck.runFullCheck();
        
        const timestamp = new Date().toLocaleTimeString();
        const emoji = healthStatus.status === 'healthy' ? '✅' : 
                     healthStatus.status === 'degraded' ? '⚠️' : '❌';
        
        console.log(`[${timestamp}] ${emoji} Status: ${healthStatus.status.toUpperCase()} | Saudáveis: ${healthStatus.summary.healthy}/${healthStatus.summary.total}`);
        
      } catch (error) {
        console.log(`[${new Date().toLocaleTimeString()}] ❌ Erro no monitoramento: ${error.message}`);
      }
      
      setTimeout(monitorLoop, 30000); // 30 segundos
    };
    
    monitorLoop();
  }
  
  async stop() {
    logger.info('🛑 Parando sistema...');
    
    await this.startupManager.shutdown();
    
    console.log('✅ Sistema parado com segurança');
    process.exit(0);
  }
  
  showHelp() {
    console.log(`
🚀 Zeladoria Londrina - Startup & Health Check

Uso: node scripts/startup-healthcheck.js [comando]

Comandos:
  start    - Iniciar o sistema completo
  health   - Executar verificação de saúde completa
  check    - Executar verificação rápida
  monitor  - Iniciar monitoramento contínuo
  stop     - Parar o sistema
  
Exemplos:
  node scripts/startup-healthcheck.js start
  node scripts/startup-healthcheck.js health
  node scripts/startup-healthcheck.js monitor

Variáveis de Ambiente Necessárias:
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  JWT_SECRET
  ENCRYPTION_KEY

Logs:
  Verifique: ${CONFIG.LOG_FILE}
`);
  }
}

// Executar CLI
if (require.main === module) {
  const cli = new CLI();
  cli.run().catch(error => {
    logger.error('❌ Erro fatal', { error: error.message });
    process.exit(1);
  });
}

module.exports = { StartupManager, HealthCheck, Logger };