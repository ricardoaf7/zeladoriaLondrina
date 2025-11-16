/**
 * Serviço de Cache Otimizado para Dados do Mapa
 * Implementa cache com TTL, limpeza automática e sincronização
 */

import localforage from 'localforage';

// Configuração do cache
const MAP_CACHE_CONFIG = {
  name: 'zeladoriaMapCache',
  storeName: 'map_data',
  version: 1,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxEntries: 100, // Máximo de entradas por tipo
  cleanupInterval: 60 * 1000, // Limpeza a cada minuto
};

// Tipos de cache
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number; // tamanho aproximado em bytes
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  oldestEntry: number;
  newestEntry: number;
}

class MapCacheService {
  private cache: LocalForage;
  private stats = {
    hits: 0,
    misses: 0,
    lastCleanup: Date.now()
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.cache = localforage.createInstance({
      name: MAP_CACHE_CONFIG.name,
      storeName: MAP_CACHE_CONFIG.storeName,
      version: MAP_CACHE_CONFIG.version
    });

    this.startCleanupTimer();
  }

  /**
   * Inicia timer de limpeza automática
   */
  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, MAP_CACHE_CONFIG.cleanupInterval);
  }

  /**
   * Calcula tamanho aproximado de um objeto
   */
  private calculateObjectSize(obj: any): number {
    try {
      return JSON.stringify(obj).length * 2; // aproximação em bytes
    } catch {
      return 1024; // tamanho padrão se não conseguir calcular
    }
  }

  /**
   * Gera chave única para cache
   */
  private generateKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    return `${type}_${JSON.stringify(sortedParams)}`;
  }

  /**
   * Armazena dados em cache
   */
  async set<T>(
    type: string,
    params: Record<string, any>,
    data: T,
    ttl: number = MAP_CACHE_CONFIG.defaultTTL
  ): Promise<void> {
    try {
      const key = this.generateKey(type, params);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        size: this.calculateObjectSize(data)
      };

      await this.cache.setItem(key, entry);
      
      // Verificar se precisa limpar cache antigo
      await this.checkCacheSize();
      
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
    }
  }

  /**
   * Recupera dados do cache
   */
  async get<T>(
    type: string,
    params: Record<string, any>
  ): Promise<{ data: T; meta: Omit<CacheEntry, 'data'> } | null> {
    try {
      const key = this.generateKey(type, params);
      const entry = await this.cache.getItem<CacheEntry<T>>(key);

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Verificar se expirou
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        await this.cache.removeItem(key);
        this.stats.misses++;
        return null;
      }

      // Atualizar estatísticas
      entry.hits++;
      await this.cache.setItem(key, entry);
      this.stats.hits++;

      return {
        data: entry.data,
        meta: {
          timestamp: entry.timestamp,
          ttl: entry.ttl,
          hits: entry.hits,
          size: entry.size
        }
      };

    } catch (error) {
      console.error('❌ Erro ao recuperar cache:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Remove entrada específica do cache
   */
  async remove(type: string, params: Record<string, any>): Promise<void> {
    try {
      const key = this.generateKey(type, params);
      await this.cache.removeItem(key);
    } catch (error) {
      console.error('❌ Erro ao remover cache:', error);
    }
  }

  /**
   * Limpa todo o cache de um tipo
   */
  async clearType(type: string): Promise<void> {
    try {
      const keys = await this.cache.keys();
      const typeKeys = keys.filter(key => key.startsWith(`${type}_`));
      
      await Promise.all(typeKeys.map(key => this.cache.removeItem(key)));
    } catch (error) {
      console.error('❌ Erro ao limpar cache por tipo:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearAll(): Promise<void> {
    try {
      await this.cache.clear();
      this.stats = { hits: 0, misses: 0, lastCleanup: Date.now() };
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }

  /**
   * Verifica tamanho do cache e limpa se necessário
   */
  private async checkCacheSize(): Promise<void> {
    try {
      const keys = await this.cache.keys();
      
      if (keys.length > MAP_CACHE_CONFIG.maxEntries * 1.5) {
        // Ordenar por timestamp (mais antigos primeiro)
        const entries = await Promise.all(
          keys.map(async key => ({
            key,
            entry: await this.cache.getItem<CacheEntry>(key)
          }))
        );

        const validEntries = entries
          .filter(item => item.entry && Date.now() - item.entry.timestamp < item.entry.ttl)
          .sort((a, b) => a.entry!.timestamp - b.entry!.timestamp);

        // Remover 20% mais antigo
        const toRemove = Math.ceil(validEntries.length * 0.2);
        const removeKeys = validEntries.slice(0, toRemove).map(item => item.key);

        await Promise.all(removeKeys.map(key => this.cache.removeItem(key)));
        
        console.log(`🧹 Cache limpo: removidas ${removeKeys.length} entradas antigas`);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar tamanho do cache:', error);
    }
  }

  /**
   * Realiza limpeza geral do cache
   */
  private async performCleanup(): Promise<void> {
    try {
      const keys = await this.cache.keys();
      const now = Date.now();
      let removedCount = 0;

      for (const key of keys) {
        try {
          const entry = await this.cache.getItem<CacheEntry>(key);
          
          if (!entry || now - entry.timestamp > entry.ttl) {
            await this.cache.removeItem(key);
            removedCount++;
          }
        } catch (error) {
          console.warn('⚠️ Erro ao limpar entrada:', key, error);
        }
      }

      this.stats.lastCleanup = now;
      
      if (removedCount > 0) {
        console.log(`🧹 Limpeza de cache: removidas ${removedCount} entradas expiradas`);
      }
    } catch (error) {
      console.error('❌ Erro durante limpeza de cache:', error);
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  async getStats(): Promise<CacheStats> {
    try {
      const keys = await this.cache.keys();
      const entries = await Promise.all(
        keys.map(key => this.cache.getItem<CacheEntry>(key))
      );

      const validEntries = entries.filter(entry => entry && Date.now() - entry.timestamp <= entry.ttl);
      
      const totalSize = validEntries.reduce((sum, entry) => sum + (entry?.size || 0), 0);
      const totalRequests = this.stats.hits + this.stats.misses;
      
      const timestamps = validEntries.map(entry => entry!.timestamp).sort();

      return {
        totalEntries: validEntries.length,
        totalSize,
        hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
        missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
        oldestEntry: timestamps[0] || Date.now(),
        newestEntry: timestamps[timestamps.length - 1] || Date.now()
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        oldestEntry: Date.now(),
        newestEntry: Date.now()
      };
    }
  }

  /**
   * Pre-carrega dados comuns
   */
  async preloadCommonData(): Promise<void> {
    try {
      // Pre-carregar dados de áreas principais de Londrina
      const commonAreas = [
        { north: -23.25, south: -23.35, east: -51.1, west: -51.2 }, // Centro
        { north: -23.28, south: -23.32, east: -51.14, west: -51.18 }, // Zona 1
        { north: -23.29, south: -23.33, east: -51.15, west: -51.19 }, // Zona 2
      ];

      console.log('📦 Pré-carregando dados comuns...');
      
      // Buscar e cachear cada área
      for (const bounds of commonAreas) {
        const params = { ...bounds, zoom: 13, limit: 100 };
        
        // Verificar se já está em cache
        const cached = await this.get('map_points', params);
        if (!cached) {
          // Simular busca (em produção seria uma chamada real)
          const mockData = generateMockDataForBounds(bounds);
          await this.set('map_points', params, mockData, MAP_CACHE_CONFIG.defaultTTL);
        }
      }

      console.log('✅ Pré-carregamento concluído');
    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error);
    }
  }

  /**
   * Destrói o serviço de cache
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

/**
 * Gera dados mock para teste
 */
function generateMockDataForBounds(bounds: any) {
  const points = [];
  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;
  const latRange = Math.abs(bounds.north - bounds.south);
  const lngRange = Math.abs(bounds.east - bounds.west);
  
  const count = Math.floor(Math.random() * 500) + 100; // 100-600 pontos

  for (let i = 0; i < count; i++) {
    const lat = centerLat + (Math.random() - 0.5) * latRange;
    const lng = centerLng + (Math.random() - 0.5) * lngRange;
    
    points.push({
      id: `point_${i}_${Date.now()}`,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      type: ['area', 'worker', 'equipment', 'task'][Math.floor(Math.random() * 4)],
      status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      data: {
        name: `Ponto ${i}`,
        description: 'Área de manutenção',
        lastUpdate: new Date().toISOString()
      }
    });
  }

  return points;
}

// Exportar instância singleton
const mapCacheService = new MapCacheService();

// Cleanup ao sair da página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    mapCacheService.destroy();
  });
}

export default mapCacheService;
export { MapCacheService };