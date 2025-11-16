/**
 * Componente de Mapa Otimizado com Clustering
 * Implementa renderização eficiente para milhares de pontos
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L, { LatLngBounds, LatLng, DivIcon } from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { 
  useMapClustering, 
  useMapPerformance, 
  useMapState,
  MapPoint 
} from '@/hooks/useMapClustering';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Clock,
  Activity 
} from 'lucide-react';

// Configuração de ícones por tipo
const getMarkerIcon = (type: MapPoint['type'], status: MapPoint['status'], count?: number) => {
  const colors = {
    area: { active: '#22c55e', inactive: '#94a3b8', pending: '#f59e0b' },
    worker: { active: '#3b82f6', inactive: '#94a3b8', pending: '#f59e0b' },
    equipment: { active: '#8b5cf6', inactive: '#94a3b8', pending: '#f59e0b' },
    task: { active: '#ec4899', inactive: '#94a3b8', pending: '#f59e0b' },
    cluster: { active: '#f97316', inactive: '#94a3b8', pending: '#ef4444' }
  };

  const color = colors[type]?.[status] || colors.cluster.active;
  const size = count && count > 1 ? 'large' : 'medium';

  return new DivIcon({
    html: `
      <div class="marker-container ${size}" style="background-color: ${color}; position: relative;">
        <div class="marker-icon" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
          ${count && count > 1 ? count : ''}
        </div>
        <div class="marker-pulse" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; animation: pulse 2s infinite;"></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: count && count > 10 ? [40, 40] : count && count > 1 ? [30, 30] : [25, 25],
    iconAnchor: count && count > 1 ? [20, 20] : [12, 12]
  });
};

/**
 * Componente que gerencia eventos do mapa e atualiza bounds/zoom
 */
function MapEventHandler({ onBoundsChange }: { onBoundsChange: (bounds: LatLngBounds, zoom: number) => void }) {
  const map = useMap();
  
  const handleMoveEnd = useCallback(() => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    
    onBoundsChange(bounds, zoom);
  }, [map, onBoundsChange]);

  useEffect(() => {
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, handleMoveEnd]);

  // Disparar evento inicial
  useEffect(() => {
    setTimeout(() => {
      handleMoveEnd();
    }, 100);
  }, [handleMoveEnd]);

  return null;
}

/**
 * Indicador de performance do mapa
 */
function PerformanceIndicator({ metrics }: { metrics: any }) {
  const getStatusColor = () => {
    switch (metrics.getPerformanceStatus()) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
      <div className="flex items-center gap-2 text-sm">
        <Activity className={`w-4 h-4 ${getStatusColor()}`} />
        <span className="text-gray-700">
          {metrics.metrics.pointCount} pontos • {metrics.metrics.renderTime}ms
        </span>
        {metrics.metrics.cacheHitRate > 0 && (
          <Badge variant="secondary" className="text-xs">
            Cache: {Math.round(metrics.metrics.cacheHitRate * 100)}%
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Legenda do mapa
 */
function MapLegend() {
  const legendItems = [
    { type: 'area', label: 'Áreas', color: '#22c55e' },
    { type: 'worker', label: 'Funcionários', color: '#3b82f6' },
    { type: 'equipment', label: 'Equipamentos', color: '#8b5cf6' },
    { type: 'task', label: 'Tarefas', color: '#ec4899' },
    { type: 'cluster', label: 'Agrupamentos', color: '#f97316' }
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
      <div className="text-sm font-medium mb-2">Legenda</div>
      <div className="space-y-1">
        {legendItems.map(item => (
          <div key={item.type} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente principal do mapa otimizado
 */
interface OptimizedMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  showPerformance?: boolean;
  showLegend?: boolean;
  enableCache?: boolean;
  maxPointsPerRequest?: number;
  onPointClick?: (point: MapPoint) => void;
  onClusterClick?: (cluster: MapPoint) => void;
}

export function OptimizedMap({
  center = [-23.3103, -51.1596], // Londrina
  zoom = 13,
  className = 'h-[600px] w-full',
  showPerformance = true,
  showLegend = true,
  enableCache = true,
  maxPointsPerRequest = 1000,
  onPointClick,
  onClusterClick
}: OptimizedMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  
  const {
    points,
    visiblePoints,
    isLoading,
    error,
    updateBounds,
    refreshData,
    clearCache
  } = useMapClustering({
    enableCache,
    maxPointsPerRequest
  });

  const performance = useMapPerformance();
  const mapState = useMapState();

  /**
   * Manipula clique em marcador
   */
  const handleMarkerClick = useCallback((point: MapPoint) => {
    if (point.type === 'cluster' && onClusterClick) {
      onClusterClick(point);
    } else if (point.type !== 'cluster' && onPointClick) {
      onPointClick(point);
    }
  }, [onPointClick, onClusterClick]);

  /**
   * Atualiza marcadores no cluster
   */
  const updateMarkers = useCallback((points: MapPoint[]) => {
    if (!clusterGroupRef.current) return;

    // Limpar marcadores anteriores
    clusterGroupRef.current.clearLayers();

    // Adicionar novos marcadores
    points.forEach(point => {
      const marker = L.marker([point.lat, point.lng], {
        icon: getMarkerIcon(point.type, point.status, point.data?.count)
      });

      // Adicionar popup
      const popupContent = createPopupContent(point);
      marker.bindPopup(popupContent);

      // Evento de clique
      marker.on('click', () => handleMarkerClick(point));

      clusterGroupRef.current?.addLayer(marker);
    });

    // Atualizar métricas de performance
    performance.updateMetrics({
      pointCount: points.length,
      clusterCount: points.filter(p => p.type === 'cluster').length,
      renderTime: performance.metrics.renderTime
    });
  }, [handleMarkerClick, performance]);

  /**
   * Cria conteúdo do popup
   */
  const createPopupContent = (point: MapPoint): string => {
    if (point.type === 'cluster') {
      const count = point.data?.count || 0;
      const types = point.data?.types || [];
      
      return `
        <div class="cluster-popup">
          <h3 class="font-bold text-lg mb-2">${count} itens</h3>
          <div class="space-y-1">
            ${types.map(type => `<div class="text-sm">• ${type}</div>`).join('')}
          </div>
          <button class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
            Ver detalhes
          </button>
        </div>
      `;
    }

    return `
      <div class="point-popup">
        <h3 class="font-bold mb-2">${point.type} - ${point.status}</h3>
        <div class="text-sm text-gray-600">
          <div>Lat: ${point.lat.toFixed(6)}</div>
          <div>Lng: ${point.lng.toFixed(6)}</div>
        </div>
      </div>
    `;
  };

  /**
   * Manipula mudança de bounds do mapa
   */
  const handleBoundsChange = useCallback((bounds: LatLngBounds, zoom: number) => {
    const mapBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
    
    updateBounds(mapBounds, zoom);
  }, [updateBounds]);

  // Atualizar marcadores quando os pontos visíveis mudam
  useEffect(() => {
    if (visiblePoints.length > 0) {
      updateMarkers(visiblePoints);
    }
  }, [visiblePoints, updateMarkers]);

  // Inicializar cluster group
  useEffect(() => {
    if (!mapRef.current) return;

    // Configurar opções do cluster
    const clusterOptions = {
      chunkedLoading: true,
      chunkProgress: (processed: number, total: number) => {
        console.log(`Processando clusters: ${processed}/${total}`);
      },
      maxClusterRadius: 80,
      disableClusteringAtZoom: 16,
      animate: true,
      animateAddingMarkers: false,
      spiderfyOnMaxCluster: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    };

    clusterGroupRef.current = L.markerClusterGroup(clusterOptions);
    mapRef.current.addLayer(clusterGroupRef.current);

    return () => {
      if (clusterGroupRef.current && mapRef.current) {
        mapRef.current.removeLayer(clusterGroupRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <Card className={`${className} flex items-center justify-center`}>
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do mapa: {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={refreshData}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Indicadores de loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[1000] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando pontos do mapa...</p>
          </div>
        </div>
      )}

      {/* Mapa */}
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        whenCreated={setMapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapEventHandler onBoundsChange={handleBoundsChange} />
        
        {/* Controles de performance */}
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="bg-white/90 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="bg-white/90 backdrop-blur-sm"
          >
            🗑️ Limpar Cache
          </Button>
        </div>

        {/* Performance indicator */}
        {showPerformance && <PerformanceIndicator metrics={performance} />}
        
        {/* Legend */}
        {showLegend && <MapLegend />}
      </MapContainer>

      {/* Status bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{visiblePoints.length} visíveis</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-green-600" />
            <span>{points.length} total</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{performance.metrics.renderTime}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptimizedMap;