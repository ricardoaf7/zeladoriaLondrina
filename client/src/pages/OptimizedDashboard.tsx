/**
 * Dashboard Otimizado com Mapa de Alta Performance
 * Integra clustering, lazy loading, cache e monitoramento de performance
 */

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Users, 
  Clock, 
  Activity, 
  TrendingUp,
  Settings,
  RefreshCw,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

import OptimizedMap from '@/components/OptimizedMap';
import MapPerformanceMonitor from '@/components/MapPerformanceMonitor';
import { useMapClustering, useMapPerformance } from '@/hooks/useMapClustering';
import mapCacheService from '@/services/mapCache';

export function OptimizedDashboard() {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showPerformance, setShowPerformance] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [mapFilters, setMapFilters] = useState({
    types: ['area', 'worker', 'equipment', 'task'],
    statuses: ['active', 'pending'],
    priority: 'all'
  });

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
    maxPointsPerRequest: 1000,
    debounceMs: 300
  });

  const performance = useMapPerformance();

  /**
   * Manipula clique em ponto do mapa
   */
  const handlePointClick = useCallback((point: any) => {
    setSelectedPoint(point);
    console.log('📍 Ponto selecionado:', point);
  }, []);

  /**
   * Manipula clique em cluster
   */
  const handleClusterClick = useCallback((cluster: any) => {
    console.log('📍 Cluster clicado:', cluster);
    // Implementar zoom no cluster ou mostrar lista de pontos
  }, []);

  /**
   * Atualiza dados do mapa
   */
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Atualizando dados do mapa...');
    await refreshData();
    performance.updateMetrics({
      renderTime: Date.now() - performance.metrics.lastUpdate,
      pointCount: visiblePoints.length,
      clusterCount: visiblePoints.filter(p => p.type === 'cluster').length
    });
  }, [refreshData, performance, visiblePoints]);

  /**
   * Limpa cache do mapa
   */
  const handleClearCache = useCallback(async () => {
    console.log('🗑️ Limpando cache do mapa...');
    await clearCache();
    await mapCacheService.clearAll();
    
    // Mostrar estatísticas
    const stats = await mapCacheService.getStats();
    console.log('📊 Estatísticas do cache:', stats);
  }, [clearCache]);

  /**
   * Alterna auto refresh
   */
  const toggleAutoRefresh = useCallback(() => {
    if (autoRefresh) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      setAutoRefresh(false);
    } else {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000); // 30 segundos
      setRefreshInterval(interval);
      setAutoRefresh(true);
    }
  }, [autoRefresh, refreshInterval, handleRefresh]);

  // Cleanup ao desmontar
  React.useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Métricas do dashboard
  const dashboardMetrics = {
    totalPoints: points.length,
    activeWorkers: points.filter(p => p.type === 'worker' && p.status === 'active').length,
    pendingTasks: points.filter(p => p.type === 'task' && p.status === 'pending').length,
    areasCovered: points.filter(p => p.type === 'area').length,
    performance: performance.getPerformanceStatus(),
    lastUpdate: new Date().toLocaleTimeString()
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Otimizado</h1>
              <p className="text-sm text-gray-600">Mapa de alta performance com clustering inteligente</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Controles de performance */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPerformance(!showPerformance)}
                className={`${showPerformance ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {showPerformance ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                Performance
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoRefresh}
                className={`${autoRefresh ? 'bg-green-50 border-green-200' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Atualizar
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                <Settings className="w-4 h-4 mr-1" />
                Limpar Cache
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pontos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.totalPoints.toLocaleString()}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Funcionários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.activeWorkers}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tarefas Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.pendingTasks}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {dashboardMetrics.performance}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Área principal com mapa e controles */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-3">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Mapa de Operações</h2>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {visiblePoints.length} pontos visíveis
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    Clustering: Ativo
                  </Badge>
                  
                  {error && (
                    <Badge variant="destructive" className="text-xs">
                      Erro no mapa
                    </Badge>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {error}
                    <Button size="sm" variant="outline" onClick={handleRefresh} className="ml-2">
                      Tentar novamente
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="h-[600px] w-full border rounded-lg overflow-hidden">
                <OptimizedMap
                  center={[-23.3103, -51.1596]}
                  zoom={13}
                  showPerformance={true}
                  showLegend={true}
                  enableCache={true}
                  maxPointsPerRequest={1000}
                  onPointClick={handlePointClick}
                  onClusterClick={handleClusterClick}
                />
              </div>
            </Card>
          </div>

          {/* Painel lateral */}
          <div className="space-y-4">
            {/* Performance Monitor */}
            {showPerformance && (
              <MapPerformanceMonitor
                metrics={{
                  renderTime: Date.now() - performance.metrics.lastUpdate,
                  pointCount: visiblePoints.length,
                  clusterCount: visiblePoints.filter(p => p.type === 'cluster').length,
                  cacheHitRate: 0.75, // Simulação
                  memoryUsage: 45, // Simulação
                  fps: 60, // Simulação
                  lastUpdate: performance.metrics.lastUpdate
                }}
                onOptimize={() => console.log('Otimizando...')}
                onClearCache={handleClearCache}
                onRefresh={handleRefresh}
                compact={false}
              />
            )}

            {/* Filtros */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Tipos de Pontos</label>
                  <div className="space-y-1 mt-1">
                    {['area', 'worker', 'equipment', 'task'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={mapFilters.types.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMapFilters(prev => ({
                                ...prev,
                                types: [...prev.types, type]
                              }));
                            } else {
                              setMapFilters(prev => ({
                                ...prev,
                                types: prev.types.filter(t => t !== type)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="space-y-1 mt-1">
                    {['active', 'pending', 'completed'].map(status => (
                      <label key={status} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={mapFilters.statuses.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMapFilters(prev => ({
                                ...prev,
                                statuses: [...prev.statuses, status]
                              }));
                            } else {
                              setMapFilters(prev => ({
                                ...prev,
                                statuses: prev.statuses.filter(s => s !== status)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Informações do Ponto Selecionado */}
            {selectedPoint && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Detalhes do Ponto</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="capitalize font-medium">{selectedPoint.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={selectedPoint.status === 'active' ? 'default' : 'secondary'}>
                      {selectedPoint.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latitude:</span>
                    <span>{selectedPoint.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Longitude:</span>
                    <span>{selectedPoint.lng.toFixed(6)}</span>
                  </div>
                  {selectedPoint.data?.count && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agrupados:</span>
                      <span>{selectedPoint.data.count} pontos</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Ações Rápidas */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar Dados
                </Button>
                
                <Button variant="outline" size="sm" className="w-full" onClick={handleClearCache}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>
                
                <Button variant="outline" size="sm" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver Relatórios
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptimizedDashboard;