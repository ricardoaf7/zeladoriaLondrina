/**
 * Componente de Demonstração de Performance
 * Permite testar o mapa otimizado com diferentes quantidades de pontos
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  BarChart3, 
  Zap, 
  Clock,
  MemoryStick,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

interface PerformanceTest {
  pointCount: number;
  renderTime: number;
  memoryUsage: number;
  fps: number;
  cacheHitRate: number;
  clusterCount: number;
  timestamp: number;
}

interface PerformanceDemoProps {
  className?: string;
  onTestStart?: (pointCount: number) => void;
  onTestEnd?: (results: PerformanceTest[]) => void;
}

export function PerformanceDemo({
  className = '',
  onTestStart,
  onTestEnd
}: PerformanceDemoProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState<PerformanceTest | null>(null);
  const [testResults, setTestResults] = useState<PerformanceTest[]>([]);
  const [pointCount, setPointCount] = useState(1000);
  const [testProgress, setTestProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Gera dados mock para teste
   */
  const generateMockPoints = (count: number) => {
    const points = [];
    const centerLat = -23.3103;
    const centerLng = -51.1596;
    const radius = 0.05; // Aproximadamente 5km

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius;
      
      const lat = centerLat + (distance * Math.cos(angle));
      const lng = centerLng + (distance * Math.sin(angle));
      
      points.push({
        id: `test_point_${i}`,
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        type: ['area', 'worker', 'equipment', 'task'][Math.floor(Math.random() * 4)],
        status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        data: {
          name: `Ponto ${i}`,
          description: `Ponto de teste ${i}`,
          createdAt: new Date().toISOString()
        }
      });
    }
    
    return points;
  };

  /**
   * Simula teste de performance
   */
  const simulatePerformanceTest = async (count: number): Promise<PerformanceTest> => {
    const startTime = Date.now();
    
    // Simular geração de pontos
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    
    // Simular clustering
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
    
    // Simular renderização
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // Calcular métricas simuladas baseadas na quantidade de pontos
    const clusterCount = Math.floor(count / (10 + Math.random() * 20));
    const memoryUsage = Math.floor((count * 0.1) + (Math.random() * 50));
    const fps = Math.max(15, 60 - (count / 200));
    const cacheHitRate = Math.random() * 0.8 + 0.1;
    
    return {
      pointCount: count,
      renderTime,
      memoryUsage,
      fps,
      cacheHitRate,
      clusterCount,
      timestamp: Date.now()
    };
  };

  /**
   * Inicia teste de performance
   */
  const startPerformanceTest = async () => {
    setIsTesting(true);
    setError(null);
    setTestResults([]);
    setTestProgress(0);
    
    try {
      onTestStart?.(pointCount);
      
      // Testar diferentes quantidades de pontos
      const testCounts = [100, 500, 1000, 2500, 5000, 10000, 15000, 20000]
        .filter(count => count <= pointCount);
      
      const results: PerformanceTest[] = [];
      
      for (let i = 0; i < testCounts.length; i++) {
        const count = testCounts[i];
        setTestProgress((i / testCounts.length) * 100);
        
        const testResult = await simulatePerformanceTest(count);
        results.push(testResult);
        
        // Atualizar teste atual para mostrar em tempo real
        setCurrentTest(testResult);
        setTestResults([...results]);
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setTestProgress(100);
      setCurrentTest(null);
      onTestEnd?.(results);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Para teste em andamento
   */
  const stopPerformanceTest = () => {
    setIsTesting(false);
    setCurrentTest(null);
    setTestProgress(0);
  };

  /**
   * Exporta resultados do teste
   */
  const exportResults = () => {
    const data = {
      testResults,
      metadata: {
        browser: navigator.userAgent,
        timestamp: new Date().toISOString(),
        totalTests: testResults.length
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_test_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Obtém cor baseada na performance
   */
  const getPerformanceColor = (metric: string, value: number) => {
    switch (metric) {
      case 'renderTime':
        if (value < 500) return 'text-green-500';
        if (value < 1000) return 'text-yellow-500';
        return 'text-red-500';
      
      case 'fps':
        if (value >= 45) return 'text-green-500';
        if (value >= 30) return 'text-yellow-500';
        return 'text-red-500';
      
      case 'memoryUsage':
        if (value < 100) return 'text-green-500';
        if (value < 200) return 'text-yellow-500';
        return 'text-red-500';
      
      default:
        return 'text-gray-500';
    }
  };

  /**
   * Calcula score geral de performance
   */
  const calculatePerformanceScore = (test: PerformanceTest) => {
    let score = 100;
    
    // Penalidades baseadas em thresholds
    if (test.renderTime > 1000) score -= 30;
    else if (test.renderTime > 500) score -= 20;
    else if (test.renderTime > 200) score -= 10;
    
    if (test.fps < 30) score -= 25;
    else if (test.fps < 45) score -= 15;
    else if (test.fps < 60) score -= 5;
    
    if (test.memoryUsage > 200) score -= 15;
    else if (test.memoryUsage > 100) score -= 10;
    else if (test.memoryUsage > 50) score -= 5;
    
    return Math.max(0, score);
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Teste de Performance do Mapa
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Teste o mapa com diferentes quantidades de pontos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportResults}
              disabled={testResults.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestResults([])}
              disabled={testResults.length === 0}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Controles */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Quantidade máxima de pontos: {pointCount.toLocaleString()}
            </label>
            <Slider
              value={[pointCount]}
              onValueChange={(value) => setPointCount(value[0])}
              min={100}
              max={20000}
              step={100}
              disabled={isTesting}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100</span>
              <span>10.000</span>
              <span>20.000</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={startPerformanceTest}
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Teste
                </>
              )}
            </Button>
            
            {isTesting && (
              <Button
                variant="outline"
                onClick={stopPerformanceTest}
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Parar
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Progresso */}
        {isTesting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do teste</span>
              <span>{Math.round(testProgress)}%</span>
            </div>
            <Progress value={testProgress} className="h-2" />
          </div>
        )}

        {/* Teste atual */}
        {currentTest && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Teste em Andamento
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Pontos</div>
                <div className="text-lg font-bold">{currentTest.pointCount.toLocaleString()}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Renderização</div>
                <div className={`text-lg font-bold ${getPerformanceColor('renderTime', currentTest.renderTime)}`}>
                  {currentTest.renderTime}ms
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">FPS</div>
                <div className={`text-lg font-bold ${getPerformanceColor('fps', currentTest.fps)}`}>
                  {Math.round(currentTest.fps)}fps
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-lg font-bold">
                  {calculatePerformanceScore(currentTest)}%
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Resultados */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Resultados do Teste
            </h3>
            
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {result.pointCount.toLocaleString()} pontos
                      </Badge>
                      
                      <Badge 
                        variant={calculatePerformanceScore(result) >= 80 ? 'default' : 
                                calculatePerformanceScore(result) >= 60 ? 'secondary' : 'destructive'}
                      >
                        Score: {calculatePerformanceScore(result)}%
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Renderização</div>
                      <div className={`font-mono text-sm ${getPerformanceColor('renderTime', result.renderTime)}`}>
                        {result.renderTime}ms
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-600 mb-1">FPS</div>
                      <div className={`font-mono text-sm ${getPerformanceColor('fps', result.fps)}`}>
                        {Math.round(result.fps)}fps
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Memória</div>
                      <div className={`font-mono text-sm ${getPerformanceColor('memoryUsage', result.memoryUsage)}`}>
                        {result.memoryUsage}MB
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Clusters</div>
                      <div className="font-mono text-sm">
                        {result.clusterCount}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Cache</div>
                      <div className="font-mono text-sm">
                        {Math.round(result.cacheHitRate * 100)}%
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Gráfico de tendências (placeholder) */}
        {testResults.length > 2 && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Análise de Tendências</h4>
            <div className="text-sm text-gray-600">
              <p>📈 Performance geral: {testResults.length} testes realizados</p>
              <p>🎯 Melhor score: {Math.max(...testResults.map(r => calculatePerformanceScore(r)))}%</p>
              <p>⚡ Melhor tempo: {Math.min(...testResults.map(r => r.renderTime))}ms</p>
              <p>💾 Pico de memória: {Math.max(...testResults.map(r => r.memoryUsage))}MB</p>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}

export default PerformanceDemo;