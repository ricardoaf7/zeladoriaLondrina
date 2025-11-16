/**
 * Componente de Monitoramento de Performance do Mapa
 * Exibe métricas em tempo real e permite otimizações dinâmicas
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Database, 
  RefreshCw, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  pointCount: number;
  clusterCount: number;
  cacheHitRate: number;
  memoryUsage: number;
  fps: number;
  lastUpdate: number;
}

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  onOptimize?: () => void;
  onClearCache?: () => void;
  onRefresh?: () => void;
  className?: string;
  compact?: boolean;
}

export function MapPerformanceMonitor({
  metrics,
  onOptimize,
  onClearCache,
  onRefresh,
  className = '',
  compact = false
}: PerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  /**
   * Analisa métricas e gera alertas
   */
  useEffect(() => {
    const newAlerts: string[] = [];

    if (metrics.renderTime > 1000) {
      newAlerts.push('Tempo de renderização muito alto (>1s)');
    }

    if (metrics.pointCount > 5000 && metrics.clusterCount < 100) {
      newAlerts.push('Muitos pontos individuais, considere aumentar clustering');
    }

    if (metrics.cacheHitRate < 0.3 && metrics.pointCount > 1000) {
      newAlerts.push('Taxa de cache muito baixa, verifique configurações');
    }

    if (metrics.memoryUsage > 100) {
      newAlerts.push('Uso de memória elevado');
    }

    if (metrics.fps < 30) {
      newAlerts.push('FPS baixo, performance comprometida');
    }

    setAlerts(newAlerts);
  }, [metrics]);

  /**
   * Obtém cor baseado no status de performance
   */
  const getPerformanceColor = useCallback((metric: keyof PerformanceMetrics, value: number) => {
    switch (metric) {
      case 'renderTime':
        if (value < 100) return 'text-green-500';
        if (value < 500) return 'text-yellow-500';
        return 'text-red-500';
      
      case 'fps':
        if (value >= 60) return 'text-green-500';
        if (value >= 30) return 'text-yellow-500';
        return 'text-red-500';
      
      case 'cacheHitRate':
        if (value >= 0.8) return 'text-green-500';
        if (value >= 0.5) return 'text-yellow-500';
        return 'text-red-500';
      
      case 'memoryUsage':
        if (value < 50) return 'text-green-500';
        if (value < 80) return 'text-yellow-500';
        return 'text-red-500';
      
      default:
        return 'text-gray-500';
    }
  }, []);

  /**
   * Formata valores para exibição
   */
  const formatValue = useCallback((metric: keyof PerformanceMetrics, value: number) => {
    switch (metric) {
      case 'renderTime':
        return `${value}ms`;
      case 'cacheHitRate':
        return `${Math.round(value * 100)}%`;
      case 'memoryUsage':
        return `${Math.round(value)}MB`;
      case 'fps':
        return `${Math.round(value)}fps`;
      default:
        return value.toLocaleString();
    }
  }, []);

  /**
   * Calcula score geral de performance
   */
  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // Penalidades baseadas em thresholds
    if (metrics.renderTime > 1000) score -= 30;
    else if (metrics.renderTime > 500) score -= 20;
    else if (metrics.renderTime > 200) score -= 10;
    
    if (metrics.fps < 30) score -= 25;
    else if (metrics.fps < 45) score -= 15;
    else if (metrics.fps < 60) score -= 5;
    
    if (metrics.cacheHitRate < 0.3) score -= 20;
    else if (metrics.cacheHitRate < 0.5) score -= 10;
    else if (metrics.cacheHitRate < 0.8) score -= 5;
    
    if (metrics.memoryUsage > 200) score -= 15;
    else if (metrics.memoryUsage > 100) score -= 10;
    else if (metrics.memoryUsage > 50) score -= 5;
    
    return Math.max(0, score);
  }, [metrics]);

  const performanceScore = getPerformanceScore();
  const scoreColor = performanceScore >= 80 ? 'text-green-500' : 
                    performanceScore >= 60 ? 'text-yellow-500' : 'text-red-500';

  if (compact) {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${scoreColor}`} />
            <span className="text-sm font-medium">Performance</span>
            <Badge variant="outline" className={scoreColor}>
              {performanceScore}%
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span>Render:</span>
              <span className={getPerformanceColor('renderTime', metrics.renderTime)}>
                {formatValue('renderTime', metrics.renderTime)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Pontos:</span>
              <span>{metrics.pointCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Cache:</span>
              <span className={getPerformanceColor('cacheHitRate', metrics.cacheHitRate)}>
                {formatValue('cacheHitRate', metrics.cacheHitRate)}
              </span>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${scoreColor}`} />
            <h3 className="font-semibold">Performance do Mapa</h3>
            <Badge variant="outline" className={scoreColor}>
              {performanceScore}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Atualizar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoOptimize(!autoOptimize)}
              className={`h-8 ${autoOptimize ? 'bg-green-50 border-green-200' : ''}`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Auto: {autoOptimize ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Score Geral</span>
            <span className={scoreColor}>{performanceScore}%</span>
          </div>
          <Progress value={performanceScore} className="h-2" />
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Alertas de Performance</span>
            </div>
            <div className="space-y-1">
              {alerts.map((alert, index) => (
                <div key={index} className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  {alert}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Métricas Detalhadas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Renderização</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Tempo:</span>
                <span className={getPerformanceColor('renderTime', metrics.renderTime)}>
                  {formatValue('renderTime', metrics.renderTime)}
                </span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>FPS:</span>
                <span className={getPerformanceColor('fps', metrics.fps)}>
                  {formatValue('fps', metrics.fps)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Dados</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Pontos:</span>
                <span>{metrics.pointCount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Clusters:</span>
                <span>{metrics.clusterCount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Cache:</span>
                <span className={getPerformanceColor('cacheHitRate', metrics.cacheHitRate)}>
                  {formatValue('cacheHitRate', metrics.cacheHitRate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações de Otimização */}
        <div className="flex gap-2">
          <Button
            onClick={onOptimize}
            className="flex-1"
            disabled={!onOptimize}
          >
            <Zap className="w-4 h-4 mr-2" />
            Otimizar Agora
          </Button>
          
          <Button
            variant="outline"
            onClick={onClearCache}
            className="flex-1"
            disabled={!onClearCache}
          >
            <Database className="w-4 h-4 mr-2" />
            Limpar Cache
          </Button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4" />
            <span>Última atualização: {new Date(metrics.lastUpdate).toLocaleTimeString()}</span>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            {alerts.length} alerta{alerts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export default MapPerformanceMonitor;