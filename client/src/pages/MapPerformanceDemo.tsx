/**
 * Página de Demonstração de Performance do Mapa Otimizado
 * Mostra o mapa em ação com diferentes cargas de dados e métricas em tempo real
 */

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Zap, 
  Activity, 
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

import OptimizedDashboard from './OptimizedDashboard';
import PerformanceDemo from '@/components/PerformanceDemo';
import OptimizedMap from '@/components/OptimizedMap';
import MapPerformanceMonitor from '@/components/MapPerformanceMonitor';
import { useMapClustering, useMapPerformance } from '@/hooks/useMapClustering';

export function MapPerformanceDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMetrics, setShowMetrics] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [testMode, setTestMode] = useState<'normal' | 'stress' | 'extreme'>('normal');

  // Hooks do mapa
  const {
    points,
    visiblePoints,
    isLoading,
    error,
    updateBounds,
    refreshData,
    clearCache
  } = useMapClustering({
    enableCache: true,
    maxPointsPerRequest: testMode === 'extreme' ? 5000 : testMode === 'stress' ? 2000 : 1000,
    debounceMs: 300
  });

  const performance = useMapPerformance();

  /**
   * Manipula início do teste de performance
   */
  const handleTestStart = useCallback((pointCount: number) => {
    console.log(`🧪 Iniciando teste com ${pointCount} pontos...`);
    performance.updateMetrics({
      renderTime: 0,
      pointCount,
      clusterCount: 0,
      cacheHitRate: 0
    });
  }, [performance]);

  /**
   * Manipula fim do teste de performance
   */
  const handleTestEnd = useCallback((results: any[]) => {
    console.log(`✅ Teste concluído com ${results.length} resultados`);
    
    // Análise dos resultados
    const avgRenderTime = results.reduce((sum, r) => sum + r.renderTime, 0) / results.length;
    const avgFPS = results.reduce((sum, r) => sum + r.fps, 0) / results.length;
    const bestScore = Math.max(...results.map(r => {
      let score = 100;
      if (r.renderTime > 1000) score -= 30;
      else if (r.renderTime > 500) score -= 20;
      if (r.fps < 30) score -= 25;
      return Math.max(0, score);
    }));

    console.log(`📊 Resultados: ${avgRenderTime.toFixed(0)}ms média, ${avgFPS.toFixed(1)}fps média, ${bestScore}% melhor score`);
  }, []);

  /**
   * Configura modo de teste
   */
  const handleSetTestMode = useCallback((mode: 'normal' | 'stress' | 'extreme') => {
    setTestMode(mode);
    
    // Limpar cache ao mudar modo
    clearCache();
    
    console.log(`🔧 Modo de teste alterado para: ${mode}`);
  }, [clearCache]);

  /**
   * Exporta relatório de performance
   */
  const exportPerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      testMode,
      metrics: {
        totalPoints: points.length,
        visiblePoints: visiblePoints.length,
        performance: performance.getPerformanceStatus(),
        cacheHitRate: 0.75 // Simulação
      },
      recommendations: [
        'Use clustering para mais de 1000 pontos',
        'Implemente lazy loading para grandes áreas',
        'Configure cache adequadamente',
        'Monitore performance regularmente'
      ]
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [points.length, visiblePoints.length, performance, testMode]);

  /**
   * Métricas atuais do sistema
   */
  const systemMetrics = {
    totalPoints: points.length,
    visiblePoints: visiblePoints.length,
    clusterCount: visiblePoints.filter(p => p.type === 'cluster').length,
    cacheHitRate: 0.75, // Simulação
    memoryUsage: 45, // Simulação MB
    fps: 60, // Simulação
    lastUpdate: new Date().toLocaleTimeString(),
    performance: performance.getPerformanceStatus()
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Demo de Performance do Mapa
              </h1>
              <p className="text-sm text-gray-600">Testando otimizações com milhares de pontos</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Controles de visualização */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetrics(!showMetrics)}
                className={`${showMetrics ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {showMetrics ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                Métricas
              </Button>
              
              {/* Modos de teste */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['normal', 'stress', 'extreme'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={testMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleSetTestMode(mode)}
                    className={`text-xs ${testMode === mode ? '' : 'hover:bg-gray-200'}`}
                  >
                    {mode === 'normal' ? 'Normal (1K)' : 
                     mode === 'stress' ? 'Stress (2K)' : 'Extreme (5K)'}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportPerformanceReport}
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      {showMetrics && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pontos</p>
                  <p className="text-xl font-bold text-gray-900">
                    {systemMetrics.totalPoints.toLocaleString()}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visíveis</p>
                  <p className="text-xl font-bold text-gray-900">
                    {systemMetrics.visiblePoints.toLocaleString()}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clusters</p>
                  <p className="text-xl font-bold text-gray-900">
                    {systemMetrics.clusterCount}
                  </p>
                </div>
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cache</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Math.round(systemMetrics.cacheHitRate * 100)}%
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  systemMetrics.cacheHitRate >= 0.8 ? 'bg-green-500' :
                  systemMetrics.cacheHitRate >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Memória</p>
                  <p className="text-xl font-bold text-gray-900">
                    {systemMetrics.memoryUsage}MB
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  systemMetrics.memoryUsage < 50 ? 'bg-green-500' :
                  systemMetrics.memoryUsage < 100 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance</p>
                  <p className="text-xl font-bold text-gray-900 capitalize">
                    {systemMetrics.performance}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  systemMetrics.performance === 'excellent' ? 'bg-green-500' :
                  systemMetrics.performance === 'good' ? 'bg-blue-500' :
                  systemMetrics.performance === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard Otimizado</TabsTrigger>
            <TabsTrigger value="performance">Teste de Performance</TabsTrigger>
            <TabsTrigger value="map">Mapa em Tempo Real</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <OptimizedDashboard />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceDemo
              onTestStart={handleTestStart}
              onTestEnd={handleTestEnd}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Mapa em Tempo Real</h2>
                  <p className="text-sm text-gray-600">Visualização com clustering dinâmico</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Modo: {testMode}</Badge>
                  <Badge variant="secondary">{visiblePoints.length} visíveis</Badge>
                </div>
              </div>

              <div className="h-[600px] w-full border rounded-lg overflow-hidden">
                <OptimizedMap
                  center={[-23.3103, -51.1596]}
                  zoom={13}
                  showPerformance={true}
                  showLegend={true}
                  enableCache={true}
                  maxPointsPerRequest={testMode === 'extreme' ? 5000 : testMode === 'stress' ? 2000 : 1000}
                />
              </div>
            </Card>

            {showMetrics && (
              <MapPerformanceMonitor
                metrics={{
                  renderTime: Date.now() - performance.metrics.lastUpdate,
                  pointCount: visiblePoints.length,
                  clusterCount: visiblePoints.filter(p => p.type === 'cluster').length,
                  cacheHitRate: systemMetrics.cacheHitRate,
                  memoryUsage: systemMetrics.memoryUsage,
                  fps: systemMetrics.fps,
                  lastUpdate: performance.metrics.lastUpdate
                }}
                onRefresh={() => {
                  refreshData();
                  performance.updateMetrics({
                    renderTime: Date.now() - performance.metrics.lastUpdate,
                    pointCount: visiblePoints.length,
                    clusterCount: visiblePoints.filter(p => p.type === 'cluster').length
                  });
                }}
                onClearCache={clearCache}
                compact={false}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rodapé com informações */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Última atualização: {systemMetrics.lastUpdate}</span>
              <Badge variant="outline" className="text-xs">
                Test Mode: {testMode}
              </Badge>
              {error && (
                <Badge variant="destructive" className="text-xs">
                  Erro no mapa
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                systemMetrics.performance === 'excellent' ? 'bg-green-500' :
                systemMetrics.performance === 'good' ? 'bg-blue-500' :
                systemMetrics.performance === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span>Performance: {systemMetrics.performance}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPerformanceDemo;