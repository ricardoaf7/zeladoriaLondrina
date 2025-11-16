/**
 * Rotas otimizadas para carregamento de dados do mapa
 * Implementa paginação, caching e filtros geoespaciais
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

const mapRouter = Router();

// Esquemas de validação
const MapBoundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
  zoom: z.number().min(1).max(20).optional(),
  limit: z.number().min(1).max(5000).default(1000),
  offset: z.number().min(0).default(0),
  types: z.string().optional(), // area,worker,equipment,task
  statuses: z.string().optional(), // active,inactive,pending,completed
  priority: z.string().optional(), // low,medium,high
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

const PointIdSchema = z.object({
  id: z.string().uuid()
});

// Cache em memória para dados do mapa
interface MapCacheEntry {
  data: any[];
  timestamp: number;
  bounds: { north: number; south: number; east: number; west: number };
  count: number;
}

const mapCache = new Map<string, MapCacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 50; // Máximo de 50 regiões em cache

/**
 * Gera chave única para cache baseada nos parâmetros
 */
function generateCacheKey(params: z.infer<typeof MapBoundsSchema>): string {
  const keyParts = [
    params.north.toFixed(4),
    params.south.toFixed(4),
    params.east.toFixed(4),
    params.west.toFixed(4),
    params.zoom?.toFixed(1) || '13',
    params.types || 'all',
    params.statuses || 'all',
    params.priority || 'all'
  ];
  
  return keyParts.join('_');
}

/**
 * Limpa cache antigo
 */
function cleanupCache() {
  const now = Date.now();
  
  for (const [key, entry] of mapCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      mapCache.delete(key);
    }
  }
  
  // Limitar tamanho do cache
  if (mapCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(mapCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, mapCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => mapCache.delete(key));
  }
}

/**
 * Verifica se uma região está em cache
 */
function getCachedData(key: string): MapCacheEntry | null {
  cleanupCache();
  
  const entry = mapCache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    mapCache.delete(key);
    return null;
  }
  
  return entry;
}

/**
 * Armazena dados em cache
 */
function setCachedData(key: string, data: any[], bounds: any, count: number) {
  mapCache.set(key, {
    data,
    timestamp: Date.now(),
    bounds,
    count
  });
}

/**
 * Busca pontos otimizada com paginação e filtros
 */
mapRouter.get('/points', async (req: Request, res: Response) => {
  try {
    // Validar parâmetros
    const params = MapBoundsSchema.parse({
      north: parseFloat(req.query.north as string),
      south: parseFloat(req.query.south as string),
      east: parseFloat(req.query.east as string),
      west: parseFloat(req.query.west as string),
      zoom: req.query.zoom ? parseFloat(req.query.zoom as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 1000,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      types: req.query.types as string,
      statuses: req.query.statuses as string,
      priority: req.query.priority as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string
    });

    const cacheKey = generateCacheKey(params);
    
    // Verificar cache
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit para região: ${cacheKey}`);
      
      // Aplicar paginação nos dados em cache
      const paginatedData = cached.data.slice(params.offset, params.offset + params.limit);
      
      return res.json({
        success: true,
        data: paginatedData,
        pagination: {
          total: cached.count,
          limit: params.limit,
          offset: params.offset,
          hasMore: params.offset + params.limit < cached.count
        },
        cache: {
          hit: true,
          timestamp: cached.timestamp
        }
      });
    }

    console.log(`🔄 Buscando dados do banco para região: ${cacheKey}`);

    // Buscar do banco de dados
    const points = await fetchPointsFromDatabase(params);
    
    // Armazenar em cache
    setCachedData(cacheKey, points, params, points.length);

    // Aplicar paginação
    const paginatedData = points.slice(params.offset, params.offset + params.limit);

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: points.length,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < points.length
      },
      cache: {
        hit: false,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar pontos:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros inválidos',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar pontos',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * Busca detalhes de um ponto específico
 */
mapRouter.get('/points/:id', async (req: Request, res: Response) => {
  try {
    const { id } = PointIdSchema.parse({ id: req.params.id });
    
    // Buscar detalhes do ponto
    const point = await fetchPointDetails(id);
    
    if (!point) {
      return res.status(404).json({
        success: false,
        error: 'Ponto não encontrado'
      });
    }

    res.json({
      success: true,
      data: point
    });

  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do ponto:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * Busca estatísticas da região
 */
mapRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const params = MapBoundsSchema.parse({
      north: parseFloat(req.query.north as string),
      south: parseFloat(req.query.south as string),
      east: parseFloat(req.query.east as string),
      west: parseFloat(req.query.west as string),
      types: req.query.types as string,
      statuses: req.query.statuses as string
    });

    const stats = await fetchRegionStats(params);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar estatísticas',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * Busca pontos do banco de dados com filtros geoespaciais
 */
async function fetchPointsFromDatabase(params: z.infer<typeof MapBoundsSchema>) {
  // Simulação de dados - em produção, isso viria do banco de dados real
  const mockPoints = generateMockPoints(params);
  
  // Aplicar filtros
  let filteredPoints = mockPoints.filter(point => {
    // Filtro geoespacial
    const inBounds = 
      point.lat >= params.south &&
      point.lat <= params.north &&
      point.lng >= params.west &&
      point.lng <= params.east;

    if (!inBounds) return false;

    // Filtro por tipo
    if (params.types) {
      const allowedTypes = params.types.split(',');
      if (!allowedTypes.includes(point.type)) return false;
    }

    // Filtro por status
    if (params.statuses) {
      const allowedStatuses = params.statuses.split(',');
      if (!allowedStatuses.includes(point.status)) return false;
    }

    // Filtro por prioridade
    if (params.priority && point.priority) {
      const allowedPriorities = params.priority.split(',');
      if (!allowedPriorities.includes(point.priority)) return false;
    }

    return true;
  });

  // Limitar número de pontos para performance
  if (filteredPoints.length > params.limit * 2) {
    // Usar amostragem estratificada para manter distribuição geográfica
    filteredPoints = stratifiedSample(filteredPoints, params.limit * 2);
  }

  return filteredPoints;
}

/**
 * Gera pontos mock para teste
 */
function generateMockPoints(params: z.infer<typeof MapBoundsSchema>) {
  const points = [];
  const centerLat = (params.north + params.south) / 2;
  const centerLng = (params.east + params.west) / 2;
  const latRange = Math.abs(params.north - params.south);
  const lngRange = Math.abs(params.east - params.west);
  
  // Gerar pontos baseado na área e zoom
  const area = latRange * lngRange;
  const zoomFactor = params.zoom ? Math.pow(2, params.zoom - 10) : 1;
  const pointDensity = Math.min(1000, Math.max(50, area * 1000 * zoomFactor));
  
  const types = ['area', 'worker', 'equipment', 'task'];
  const statuses = ['active', 'inactive', 'pending', 'completed'];
  const priorities = ['low', 'medium', 'high'];

  for (let i = 0; i < pointDensity; i++) {
    const lat = centerLat + (Math.random() - 0.5) * latRange;
    const lng = centerLng + (Math.random() - 0.5) * lngRange;
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    points.push({
      id: `point_${i}_${Date.now()}`,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      type,
      status,
      priority,
      data: {
        name: `${type}_${i}`,
        description: `Ponto ${type} ${status}`,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }

  return points;
}

/**
 * Amostragem estratificada para manter distribuição
 */
function stratifiedSample(points: any[], targetCount: number) {
  if (points.length <= targetCount) return points;

  // Dividir em grid
  const gridSize = Math.ceil(Math.sqrt(targetCount));
  const grid = new Map<string, any[]>();

  points.forEach(point => {
    const gridX = Math.floor(point.lng * gridSize);
    const gridY = Math.floor(point.lat * gridSize);
    const key = `${gridX},${gridY}`;
    
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(point);
  });

  // Selecionar pontos de cada célula do grid
  const sampled = [];
  const pointsPerCell = Math.ceil(targetCount / grid.size);

  for (const [_, cellPoints] of grid.entries()) {
    // Embaralhar e pegar amostra
    const shuffled = cellPoints.sort(() => Math.random() - 0.5);
    sampled.push(...shuffled.slice(0, pointsPerCell));
  }

  return sampled.slice(0, targetCount);
}

/**
 * Busca detalhes de um ponto
 */
async function fetchPointDetails(id: string) {
  // Simulação - em produção buscar do banco
  return {
    id,
    lat: -23.3103 + (Math.random() - 0.5) * 0.1,
    lng: -51.1596 + (Math.random() - 0.5) * 0.1,
    type: 'area',
    status: 'active',
    priority: 'high',
    data: {
      name: `Área ${id}`,
      description: 'Área de manutenção de gramas',
      address: 'Rua Exemplo, 123 - Londrina/PR',
      supervisor: 'João Silva',
      lastMaintenance: new Date(Date.now() - 86400000 * 7).toISOString(),
      nextMaintenance: new Date(Date.now() + 86400000 * 7).toISOString(),
      area: Math.random() * 1000 + 100,
      equipment: ['Máquina de cortar grama', 'Roçadeira', 'Fertilizador'],
      workers: Math.floor(Math.random() * 5) + 1
    }
  };
}

/**
 * Busca estatísticas da região
 */
async function fetchRegionStats(params: z.infer<typeof MapBoundsSchema>) {
  const points = await fetchPointsFromDatabase(params);

  const stats = {
    total: points.length,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    density: points.length / (Math.abs(params.north - params.south) * Math.abs(params.east - params.west)),
    lastUpdate: new Date().toISOString()
  };

  // Contar por tipo
  points.forEach(point => {
    stats.byType[point.type] = (stats.byType[point.type] || 0) + 1;
    stats.byStatus[point.status] = (stats.byStatus[point.status] || 0) + 1;
    if (point.priority) {
      stats.byPriority[point.priority] = (stats.byPriority[point.priority] || 0) + 1;
    }
  });

  return stats;
}

export default mapRouter;