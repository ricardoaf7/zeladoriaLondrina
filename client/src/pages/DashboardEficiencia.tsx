/**
 * Dashboard de Eficiência Operacional
 * Dashboard administrativo completo com KPIs, métricas, gráficos e análises
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  DollarSign, 
  Star, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Award,
  BarChart2,
  PieChart,
  Activity,
  Zap,
  Settings,
  Eye,
  FileText
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KPI {
  titulo: string;
  valor: number;
  unidade: string;
  variacao: number;
  tendencia: 'CRESCENTE' | 'DECRESCENTE' | 'ESTAVEL';
  status: 'EXCELENTE' | 'BOM' | 'MEDIO' | 'RUIM';
  icone: React.ReactNode;
  cor: string;
}

interface EquipeMetrica {
  id: string;
  nome: string;
  produtividade: number;
  taxaConclusao: number;
  servicosConcluidos: number;
  servicosPendentes: number;
  tempoMedioExecucao: number;
  satisfacao: number;
  custoTotal: number;
  eficiencia: number;
  ranking: number;
}

interface ServicoMetrica {
  tipo: string;
  descricao: string;
  totalServicos: number;
  concluidos: number;
  pendentes: number;
  atrasados: number;
  taxaConclusao: number;
  tempoMedio: number;
  satisfacao: number;
  custoMedio: number;
}

interface Alerta {
  id: string;
  tipo: string;
  severidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  titulo: string;
  descricao: string;
  data: string;
  status: string;
  acoesRecomendadas?: string[];
}

interface Meta {
  id: string;
  nome: string;
  categoria: string;
  valorMeta: number;
  valorAtual: number;
  progresso: number;
  status: string;
  dataLimite: string;
}

export function DashboardEficiencia() {
  const [periodo, setPeriodo] = useState<'DIARIO' | 'SEMANAL' | 'MENSAL' | 'TRIMESTRAL' | 'ANUAL'>('MENSAL');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [equipes, setEquipes] = useState<EquipeMetrica[]>([]);
  const [servicos, setServicos] = useState<ServicoMetrica[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Dados mock para demonstração
  const kpisMock: KPI[] = [
    {
      titulo: 'Produtividade Geral',
      valor: 87.3,
      unidade: '%',
      variacao: 5.2,
      tendencia: 'CRESCENTE',
      status: 'BOM',
      icone: <Activity className="w-5 h-5" />,
      cor: 'text-green-600'
    },
    {
      titulo: 'Taxa de Conclusão',
      valor: 92.8,
      unidade: '%',
      variacao: -1.1,
      tendencia: 'DECRESCENTE',
      status: 'EXCELENTE',
      icone: <CheckCircle className="w-5 h-5" />,
      cor: 'text-blue-600'
    },
    {
      titulo: 'Serviços por Dia',
      valor: 45.2,
      unidade: 'serv/dia',
      variacao: 8.7,
      tendencia: 'CRESCENTE',
      status: 'BOM',
      icone: <BarChart3 className="w-5 h-5" />,
      cor: 'text-purple-600'
    },
    {
      titulo: 'Tempo Médio',
      valor: 3.5,
      unidade: 'horas',
      variacao: -12.3,
      tendencia: 'DECRESCENTE',
      status: 'EXCELENTE',
      icone: <Clock className="w-5 h-5" />,
      cor: 'text-orange-600'
    },
    {
      titulo: 'Satisfação',
      valor: 4.2,
      unidade: '/5.0',
      variacao: 0.3,
      tendencia: 'CRESCENTE',
      status: 'BOM',
      icone: <Star className="w-5 h-5" />,
      cor: 'text-yellow-600'
    },
    {
      titulo: 'Custo por Serviço',
      valor: 165.50,
      unidade: 'R$',
      variacao: -8.7,
      tendencia: 'DECRESCENTE',
      status: 'BOM',
      icone: <DollarSign className="w-5 h-5" />,
      cor: 'text-green-600'
    }
  ];

  const equipesMock: EquipeMetrica[] = [
    {
      id: '1',
      nome: 'Equipe Centro',
      produtividade: 91.2,
      taxaConclusao: 95.8,
      servicosConcluidos: 156,
      servicosPendentes: 7,
      tempoMedioExecucao: 2.8,
      satisfacao: 4.5,
      custoTotal: 12456.78,
      eficiencia: 88.7,
      ranking: 1
    },
    {
      id: '2',
      nome: 'Equipe Zona 2',
      produtividade: 88.7,
      taxaConclusao: 92.1,
      servicosConcluidos: 142,
      servicosPendentes: 12,
      tempoMedioExecucao: 3.2,
      satisfacao: 4.3,
      custoTotal: 13890.12,
      eficiencia: 85.6,
      ranking: 2
    },
    {
      id: '3',
      nome: 'Equipe Zona 1',
      produtividade: 85.4,
      taxaConclusao: 89.2,
      servicosConcluidos: 134,
      servicosPendentes: 16,
      tempoMedioExecucao: 4.1,
      satisfacao: 4.1,
      custoTotal: 15678.90,
      eficiencia: 82.3,
      ranking: 3
    }
  ];

  const servicosMock: ServicoMetrica[] = [
    {
      tipo: 'PODA_DE_ARVORES',
      descricao: 'Poda de Árvores',
      totalServicos: 45,
      concluidos: 42,
      pendentes: 3,
      atrasados: 2,
      taxaConclusao: 93.3,
      tempoMedio: 2.5,
      satisfacao: 4.3,
      custoMedio: 180.50
    },
    {
      tipo: 'CAPINAGEM',
      descricao: 'Capinagem',
      totalServicos: 78,
      concluidos: 74,
      pendentes: 4,
      atrasados: 1,
      taxaConclusao: 94.9,
      tempoMedio: 1.8,
      satisfacao: 4.1,
      custoMedio: 95.75
    },
    {
      tipo: 'COLETA_DE_LIXO',
      descricao: 'Coleta de Lixo',
      totalServicos: 156,
      concluidos: 148,
      pendentes: 8,
      atrasados: 3,
      taxaConclusao: 94.9,
      tempoMedio: 0.5,
      satisfacao: 4.2,
      custoMedio: 45.20
    }
  ];

  const alertasMock: Alerta[] = [
    {
      id: 'alerta-001',
      tipo: 'DESEMPENHO',
      severidade: 'MEDIA',
      titulo: 'Produtividade abaixo da meta',
      descricao: 'Equipe Zona 1 com produtividade 15% abaixo do esperado',
      data: '2024-01-29T14:30:00Z',
      status: 'ATIVO',
      acoesRecomendadas: ['Analisar causas', 'Implementar plano de ação', 'Acompanhar diariamente']
    },
    {
      id: 'alerta-002',
      tipo: 'CUSTO',
      severidade: 'ALTA',
      titulo: 'Custo elevado detectado',
      descricao: 'Custo por serviço 10% acima do orçamento mensal',
      data: '2024-01-29T10:15:00Z',
      status: 'ATIVO',
      acoesRecomendadas: ['Revisar contratos', 'Negociar com fornecedores', 'Otimizar processos']
    }
  ];

  const metasMock: Meta[] = [
    {
      id: 'meta-001',
      nome: 'Taxa de Conclusão',
      categoria: 'PRODUTIVIDADE',
      valorMeta: 95.0,
      valorAtual: 92.8,
      progresso: 97.7,
      status: 'QUASE_ATINGIDA',
      dataLimite: '2024-12-31'
    },
    {
      id: 'meta-002',
      nome: 'Tempo Médio de Execução',
      categoria: 'TEMPO',
      valorMeta: 3.0,
      valorAtual: 3.5,
      progresso: 85.7,
      status: 'EM_ANDAMENTO',
      dataLimite: '2024-12-31'
    },
    {
      id: 'meta-003',
      nome: 'Satisfação do Cidadão',
      categoria: 'QUALIDADE',
      valorMeta: 4.5,
      valorAtual: 4.2,
      progresso: 93.3,
      status: 'EM_ANDAMENTO',
      dataLimite: '2024-12-31'
    }
  ];

  // Dados para gráficos
  const dadosTendencia = [
    { data: '2024-01-01', produtividade: 82.1, conclusao: 89.7, satisfacao: 4.0 },
    { data: '2024-01-08', produtividade: 84.3, conclusao: 91.2, satisfacao: 4.1 },
    { data: '2024-01-15', produtividade: 86.7, conclusao: 92.8, satisfacao: 4.1 },
    { data: '2024-01-22', produtividade: 85.9, conclusao: 91.5, satisfacao: 4.2 },
    { data: '2024-01-29', produtividade: 87.3, conclusao: 92.8, satisfacao: 4.2 }
  ];

  const dadosServicos = [
    { nome: 'Poda de Árvores', quantidade: 45, percentual: 16.4 },
    { nome: 'Capinagem', quantidade: 78, percentual: 28.5 },
    { nome: 'Coleta de Lixo', quantidade: 156, percentual: 57.1 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    // Carregar dados da API quando disponível
    setKpis(kpisMock);
    setEquipes(equipesMock);
    setServicos(servicosMock);
    setAlertas(alertasMock);
    setMetas(metasMock);
  }, [periodo]);

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'EXCELENTE': return 'text-green-600 bg-green-100';
      case 'BOM': return 'text-blue-600 bg-blue-100';
      case 'MEDIO': return 'text-yellow-600 bg-yellow-100';
      case 'RUIM': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCorSeveridade = (severidade: string) => {
    switch (severidade) {
      case 'CRITICA': return 'border-red-500 bg-red-50';
      case 'ALTA': return 'border-orange-500 bg-orange-50';
      case 'MEDIA': return 'border-yellow-500 bg-yellow-50';
      case 'BAIXA': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const exportarRelatorio = (formato: 'PDF' | 'EXCEL' | 'CSV') => {
    // Implementar exportação
    alert(`Exportando relatório em ${formato}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Dashboard de Eficiência Operacional
            </h1>
            <p className="text-gray-600 mt-2">Monitoramento e análise de performance da zeladoria</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="DIARIO">Diário</option>
              <option value="SEMANAL">Semanal</option>
              <option value="MENSAL">Mensal</option>
              <option value="TRIMESTRAL">Trimestral</option>
              <option value="ANUAL">Anual</option>
            </select>
            
            <Button
              onClick={() => exportarRelatorio('PDF')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            
            <Button className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipe</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Todas as equipes</option>
                  <option value="1">Equipe Centro</option>
                  <option value="2">Equipe Zona 1</option>
                  <option value="3">Equipe Zona 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Todos os serviços</option>
                  <option value="PODA_DE_ARVORES">Poda de Árvores</option>
                  <option value="CAPINAGEM">Capinagem</option>
                  <option value="COLETA_DE_LIXO">Coleta de Lixo</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={kpi.cor}>
                {kpi.icone}
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                kpi.tendencia === 'CRESCENTE' ? 'text-green-600' : 
                kpi.tendencia === 'DECRESCENTE' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {kpi.tendencia === 'CRESCENTE' ? <TrendingUp className="w-4 h-4" /> : 
                 kpi.tendencia === 'DECRESCENTE' ? <TrendingDown className="w-4 h-4" /> : 
                 <div className="w-4 h-4">-</div>}
                {Math.abs(kpi.variacao)}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {kpi.valor}{kpi.unidade}
              </div>
              <div className="text-sm text-gray-600">{kpi.titulo}</div>
              <Badge className={getCorStatus(kpi.status)}>
                {kpi.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendências */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Tendências de Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosTendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="produtividade" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="conclusao" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="satisfacao" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição de Serviços */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-600" />
            Distribuição por Tipo de Serviço
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={dadosServicos}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {dadosServicos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Ranking de Equipes */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Ranking de Equipes
        </h3>
        <div className="space-y-4">
          {equipes.map((equipe, index) => (
            <div key={equipe.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  equipe.ranking === 1 ? 'bg-yellow-500' :
                  equipe.ranking === 2 ? 'bg-gray-400' :
                  equipe.ranking === 3 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {equipe.ranking}
                </div>
                <div>
                  <div className="font-semibold">{equipe.nome}</div>
                  <div className="text-sm text-gray-600">
                    {equipe.servicosConcluidos} serviços concluídos
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{equipe.produtividade}%</div>
                  <div className="text-xs text-gray-600">Produtividade</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{equipe.taxaConclusao}%</div>
                  <div className="text-xs text-gray-600">Conclusão</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{equipe.satisfacao}</div>
                  <div className="text-xs text-gray-600">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{equipe.eficiencia}%</div>
                  <div className="text-xs text-gray-600">Eficiência</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Metas e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Metas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Metas e Objetivos
          </h3>
          <div className="space-y-4">
            {metas.map((meta) => (
              <div key={meta.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{meta.nome}</span>
                  <span className="text-sm text-gray-600">
                    {meta.valorAtual}/{meta.valorMeta}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      meta.progresso >= 95 ? 'bg-green-500' :
                      meta.progresso >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{meta.progresso.toFixed(1)}% completo</span>
                  <span className="text-gray-600">Até {meta.dataLimite}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Alertas e Notificações
          </h3>
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <Alert key={alerta.id} className={getCorSeveridade(alerta.severidade)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">{alerta.titulo}</div>
                  <div className="text-sm">{alerta.descricao}</div>
                  {alerta.acoesRecomendadas && (
                    <div className="mt-2 text-xs">
                      <strong>Ações:</strong> {alerta.acoesRecomendadas.join(', ')}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      </div>

      {/* Análise Detalhada por Serviço */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-600" />
          Análise por Tipo de Serviço
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Serviço</th>
                <th className="text-center py-3 px-4 font-medium">Total</th>
                <th className="text-center py-3 px-4 font-medium">Concluídos</th>
                <th className="text-center py-3 px-4 font-medium">Taxa (%)</th>
                <th className="text-center py-3 px-4 font-medium">Tempo Médio</th>
                <th className="text-center py-3 px-4 font-medium">Satisfação</th>
                <th className="text-center py-3 px-4 font-medium">Custo Médio</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{servico.descricao}</div>
                    <div className="text-sm text-gray-600">{servico.tipo}</div>
                  </td>
                  <td className="text-center py-3 px-4">{servico.totalServicos}</td>
                  <td className="text-center py-3 px-4">{servico.concluidos}</td>
                  <td className="text-center py-3 px-4">
                    <Badge className={
                      servico.taxaConclusao >= 95 ? 'bg-green-100 text-green-800' :
                      servico.taxaConclusao >= 85 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }>
                      {servico.taxaConclusao}%
                    </Badge>
                  </td>
                  <td className="text-center py-3 px-4">{servico.tempoMedio}h</td>
                  <td className="text-center py-3 px-4">{servico.satisfacao}</td>
                  <td className="text-center py-3 px-4">R$ {servico.custoMedio.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dashboard Executivo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          Visão Executiva
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">85.7%</div>
            <div className="text-sm text-gray-600">Eficiência Geral</div>
            <div className="text-xs text-green-600 mt-1">+5.2% vs mês anterior</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">R$ 45,6K</div>
            <div className="text-sm text-gray-600">Custo Total</div>
            <div className="text-xs text-green-600 mt-1">-8.7% vs mês anterior</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">4.2/5.0</div>
            <div className="text-sm text-gray-600">Satisfação</div>
            <div className="text-xs text-green-600 mt-1">+0.3 vs mês anterior</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Principais Insights</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>A produtividade geral aumentou 5.2% no período, indicando melhoria nos processos</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Redução de 8.7% nos custos operacionais demonstra eficiência nos recursos</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Equipe Zona 1 requer atenção especial - produtividade 15% abaixo da meta</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default DashboardEficiencia;