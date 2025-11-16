/**
 * Configuração das rotas de Analytics
 * Setup das rotas de dashboard e analytics
 */

import { Express } from 'express';
import analyticsRouter from './routes/analytics';
import dashboardHtmlRouter from './routes/dashboard-eficiencia-html';

export function setupAnalyticsRoutes(app: Express) {
  // API de Analytics
  app.use('/api/analytics', analyticsRouter);
  
  // Dashboard HTML de Eficiência
  app.use('/dashboard-eficiencia', dashboardHtmlRouter);
  
  console.log('📊 Rotas de Analytics configuradas:');
  console.log('  - GET /api/analytics/kpis');
  console.log('  - GET /api/analytics/equipes');
  console.log('  - GET /api/analytics/servicos');
  console.log('  - GET /api/analytics/tendencias');
  console.log('  - GET /api/analytics/benchmarking');
  console.log('  - GET /api/analytics/alertas');
  console.log('  - GET /api/analytics/executivo');
  console.log('  - GET /dashboard-eficiencia');
}