/**
 * Hook customizado para gerenciamento de clustering e performance do mapa
 * Implementa lazy loading, cache e otimizações para milhares de pontos
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { LatLngBounds, LatLng } from 'leaflet';
import mapCacheService from '@/services/mapCache';

// Configuração do cache (removida - agora usa mapCacheService)

// Tipos de dados
export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'area' | 'worker' | 'equipment' | 'task';
  status: 'active' | 'inactive' | 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  data: any;
}

export interface ClusterConfig {
  maxClusterRadius: number;
  disableClusteringAtZoom: number;
  animate: boolean;
  animateAddingMarkers: boolean;
  spiderfyOnMaxCluster: boolean;
  showCoverageOnHover: boolean;
  zoomToBoundsOnClick: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface UseMapClusteringProps {
  initialPoints?: MapPoint[];
  clusterConfig?: Partial<ClusterConfig>;
  enableCache?: boolean;
  maxPointsPerRequest?: number;
  debounceMs?: number;
}

export interface UseMapClusteringReturn {
  points: MapPoint[];
  visiblePoints: MapPoint[];
  isLoading: boolean;
  error: string | null;
  bounds: MapBounds | null;
  zoom: number;
  updateBounds: (bounds: MapBounds, zoom: number) => void;
  refreshData: () => Promise<void>;
  clearCache: () => Promise<void>;
  getPointsInBounds: (bounds: MapBounds) => MapPoint[];
  getClusteredPoints: (points: MapPoint[], zoom: number) => MapPoint[];
}

const DEFAULT_CLUSTER_CONFIG: ClusterConfig = {
  maxClusterRadius: 80,
  disableClusteringAtZoom: 16,
  animate: true,
  animateAddingMarkers: false,
  spiderfyOnMaxCluster: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
};

/**
 * Hook principal para clustering e performance do mapa
 */
export function useMapClustering({
  initialPoints = [],
  clusterConfig = {},
  enableCache = true,
  maxPointsPerRequest = 1000,
  debounceMs = 300
}: UseMapClusteringProps = {}): UseMapClusteringReturn {
  const [points, setPoints] = useState<MapPoint[]>(initialPoints);
  const [visiblePoints, setVisiblePoints] = useState<MapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [zoom, setZoom] = useState(13);

  const config = { ...DEFAULT_CLUSTER_CONFIG, ...clusterConfig };
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Calcula a densidade de pontos para determinar nível de clustering
   */
  const calculatePointDensity = useCallback((bounds: MapBounds, pointCount: number): number => {
    const width = Math.abs(bounds.east - bounds.west);
    const height = Math.abs(bounds.north - bounds.south);
    const area = width * height;
    return pointCount / area;
  }, []);

  /**
   * Implementa algoritmo de clustering baseado em grid
   */
  const clusterPoints = useCallback((points: MapPoint[], zoom: number): MapPoint[] => {
    if (zoom >= config.disableClusteringAtZoom) {
      return points;
    }

    const clusterSize = Math.max(50, config.maxClusterRadius / Math.pow(2, zoom - 10));
    const clusters = new Map<string, MapPoint[]>();

    points.forEach(point => {
      const gridX = Math.floor(point.lng / clusterSize);
      const gridY = Math.floor(point.lat / clusterSize);
      const key = `${gridX},${gridY}`;

      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)!.push(point);
    });

    return Array.from(clusters.entries()).map(([key, clusterPoints]) => {
      if (clusterPoints.length === 1) {
        return clusterPoints[0];
      }

      const avgLat = clusterPoints.reduce((sum, p) => sum + p.lat, 0) / clusterPoints.length;
      const avgLng = clusterPoints.reduce((sum, p) => sum + p.lng, 0) / clusterPoints.length;

      return {
        id: `cluster_${key}`,
        lat: avgLat,
        lng: avgLng,
        type: 'cluster',
        status: 'active',
        data: {
          count: clusterPoints.length,
          points: clusterPoints,
          types: [...new Set(clusterPoints.map(p => p.type))],
          statuses: [...new Set(clusterPoints.map(p => p.status))]
        }
      };
    });
  }, [config]);

  /**
   * Filtra pontos dentro dos bounds visuais
   */
  const getPointsInBounds = useCallback((bounds: MapBounds, allPoints: MapPoint[]): MapPoint[] => {
    return allPoints.filter(point => {
      if (point.type === 'cluster') return true; // Sempre mostrar clusters
      
      return (
        point.lat >= bounds.south &&
        point.lat <= bounds.north &&
        point.lng >= bounds.west &&
        point.lng <= bounds.east
      );
    });
  }, []);

  /**
   * Busca dados do servidor com paginação e cache
   */
  const fetchPoints = useCallback(async (bounds: MapBounds, zoom: number): Promise<MapPoint[]> => {
    const cacheParams = {
      north: bounds.north,
      south: bounds.south,
      east: bounds.east,
      west: bounds.west,
      zoom: zoom
    };
    
    // Verificar cache primeiro
    if (enableCache) {
      try {
        const cached = await mapCacheService.get<MapPoint[]>('map_points', cacheParams);
        if (cached) {
          console.log('📦 Usando cache do mapa');
          return cached.data;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao acessar cache:', error);
      }
    }

    // Buscar do servidor
    try {
      const params = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        zoom: zoom.toString(),
        limit: maxPointsPerRequest.toString()
      });

      const response = await fetch(`/api/map/points?${params}`, {
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fetchedPoints = data.data || [];

      // Salvar no cache
      if (enableCache && fetchedPoints.length > 0) {
        try {
          await mapCacheService.set('map_points', cacheParams, fetchedPoints);
        } catch (error) {
          console.warn('⚠️ Erro ao salvar cache:', error);
        }
      }

      return fetchedPoints;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🛑 Requisição cancelada');
        return [];
      }
      throw error;
    }
  }, [enableCache, maxPointsPerRequest]);

  /**
   * Atualiza bounds com debounce
   */
  const updateBounds = useCallback((newBounds: MapBounds, newZoom: number) => {
    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpar debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setBounds(newBounds);
    setZoom(newZoom);

    // Debounce para evitar muitas requisições
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const newPoints = await fetchPoints(newBounds, newZoom);
        setPoints(newPoints);
        
        const pointsInView = getPointsInBounds(newBounds, newPoints);
        const clusteredPoints = clusterPoints(pointsInView, newZoom);
        setVisiblePoints(clusteredPoints);
        
      } catch (error) {
        console.error('❌ Erro ao carregar pontos:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [fetchPoints, getPointsInBounds, clusterPoints, debounceMs]);

  /**
   * Recarrega dados ignorando cache
   */
  const refreshData = useCallback(async () => {
    if (!bounds) return;

    // Limpar cache para esta região
    if (enableCache) {
      await mapCacheService.clearType('map_points');
    }

    updateBounds(bounds, zoom);
  }, [bounds, zoom, updateBounds, enableCache]);

  /**
   * Limpa todo o cache
   */
  const clearCache = useCallback(async () => {
    try {
      await mapCacheService.clearAll();
      console.log('🗑️ Cache limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Inicialização com pontos iniciais
  useEffect(() => {
    if (initialPoints.length > 0) {
      setPoints(initialPoints);
      
      // Se tiver bounds iniciais, aplicar clustering
      if (bounds) {
        const pointsInView = getPointsInBounds(bounds, initialPoints);
        const clusteredPoints = clusterPoints(pointsInView, zoom);
        setVisiblePoints(clusteredPoints);
      } else {
        // Senão, mostrar todos os pontos (com clustering)
        const clusteredPoints = clusterPoints(initialPoints, zoom);
        setVisiblePoints(clusteredPoints);
      }
    }
  }, [initialPoints, bounds, zoom, getPointsInBounds, clusterPoints]);

  return {
    points,
    visiblePoints,
    isLoading,
    error,
    bounds,
    zoom,
    updateBounds,
    refreshData,
    clearCache,
    getPointsInBounds,
    getClusteredPoints: clusterPoints
  };
}

/**
 * Hook para monitorar performance do mapa
 */
export function useMapPerformance() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    pointCount: 0,
    clusterCount: 0,
    cacheHitRate: 0,
    lastUpdate: Date.now()
  });

  const updateMetrics = useCallback((newMetrics: Partial<typeof metrics>) => {
    setMetrics(prev => ({
      ...prev,
      ...newMetrics,
      lastUpdate: Date.now()
    }));
  }, []);

  const getPerformanceStatus = useCallback(() => {
    const { renderTime, pointCount } = metrics;
    
    if (renderTime > 1000) return 'poor';
    if (renderTime > 500) return 'fair';
    if (pointCount > 5000) return 'good';
    return 'excellent';
  }, [metrics]);

  return {
    metrics,
    updateMetrics,
    getPerformanceStatus,
    isPerformanceGood: getPerformanceStatus() !== 'poor'
  };
}

/**
 * Hook para gerenciar estado de loading e erros do mapa
 */
export function useMapState() {
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const setMapReady = useCallback((ready: boolean) => {
    setIsMapReady(ready);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setMapError = useCallback((error: string | null) => {
    setError(error);
    if (error) {
      setRetryCount(prev => prev + 1);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    isMapReady,
    isLoading,
    error,
    retryCount,
    setMapReady,
    setLoading,
    setMapError,
    resetError
  };
}

export default useMapClustering;