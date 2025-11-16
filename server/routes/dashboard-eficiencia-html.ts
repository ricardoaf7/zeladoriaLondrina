/**
 * Dashboard de Eficiência Operacional - HTML
 * Página HTML para testar o dashboard de eficiência
 */

import { Router, Request, Response } from 'express';

const dashboardHtmlRouter = Router();

/**
 * Serve página HTML do dashboard de eficiência
 */
dashboardHtmlRouter.get('/dashboard-eficiencia', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Eficiência Operacional - Zeladoria Londrina</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; }
        .card { transition: all 0.3s ease; }
        .card:hover { transform: translateY(-2px); }
        .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .success-card { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .warning-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .info-card { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white shadow-lg border-b">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Dashboard de Eficiência Operacional</h1>
                        <p class="text-gray-600">Zeladoria Municipal de Londrina</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>Janeiro 2024</option>
                        <option>Fevereiro 2024</option>
                        <option>Março 2024</option>
                    </select>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Exportar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- KPIs Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="metric-card text-white p-6 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-blue-100 text-sm font-medium">PRODUTIVIDADE GERAL</p>
                        <p class="text-3xl font-bold">87.3%</p>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="bg-green-500 text-white px-2 py-1 rounded text-xs">+5.2%</span>
                    <span class="text-blue-100 text-sm">vs mês anterior</span>
                </div>
            </div>

            <div class="success-card text-white p-6 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-green-100 text-sm font-medium">TAXA DE CONCLUSÃO</p>
                        <p class="text-3xl font-bold">92.8%</p>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="bg-red-500 text-white px-2 py-1 rounded text-xs">-1.1%</span>
                    <span class="text-green-100 text-sm">vs mês anterior</span>
                </div>
            </div>

            <div class="warning-card text-white p-6 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-pink-100 text-sm font-medium">SERVIÇOS/DIA</p>
                        <p class="text-3xl font-bold">45.2</p>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="bg-green-500 text-white px-2 py-1 rounded text-xs">+8.7%</span>
                    <span class="text-pink-100 text-sm">vs mês anterior</span>
                </div>
            </div>

            <div class="info-card text-white p-6 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-cyan-100 text-sm font-medium">TEMPO MÉDIO</p>
                        <p class="text-3xl font-bold">3.5h</p>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="bg-green-500 text-white px-2 py-1 rounded text-xs">-12.3%</span>
                    <span class="text-cyan-100 text-sm">vs mês anterior</span>
                </div>
            </div>
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Gráfico de Tendências -->
            <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    Tendências de Performance
                </h3>
                <canvas id="tendenciasChart" width="400" height="200"></canvas>
            </div>

            <!-- Gráfico de Pizza -->
            <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                    </svg>
                    Distribuição por Tipo de Serviço
                </h3>
                <canvas id="distribuicaoChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Ranking de Equipes -->
        <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
                Ranking de Equipes
            </h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                        <div>
                            <div class="font-semibold text-gray-900">Equipe Centro</div>
                            <div class="text-sm text-gray-600">156 serviços concluídos</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-6 text-center">
                        <div>
                            <div class="text-xl font-bold text-blue-600">91.2%</div>
                            <div class="text-xs text-gray-600">Produtividade</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-green-600">95.8%</div>
                            <div class="text-xs text-gray-600">Conclusão</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-yellow-600">4.5</div>
                            <div class="text-xs text-gray-600">Satisfação</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-purple-600">88.7%</div>
                            <div class="text-xs text-gray-600">Eficiência</div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                        <div>
                            <div class="font-semibold text-gray-900">Equipe Zona 2</div>
                            <div class="text-sm text-gray-600">142 serviços concluídos</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-6 text-center">
                        <div>
                            <div class="text-xl font-bold text-blue-600">88.7%</div>
                            <div class="text-xs text-gray-600">Produtividade</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-green-600">92.1%</div>
                            <div class="text-xs text-gray-600">Conclusão</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-yellow-600">4.3</div>
                            <div class="text-xs text-gray-600">Satisfação</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-purple-600">85.6%</div>
                            <div class="text-xs text-gray-600">Eficiência</div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                        <div>
                            <div class="font-semibold text-gray-900">Equipe Zona 1</div>
                            <div class="text-sm text-gray-600">134 serviços concluídos</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-6 text-center">
                        <div>
                            <div class="text-xl font-bold text-blue-600">85.4%</div>
                            <div class="text-xs text-gray-600">Produtividade</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-green-600">89.2%</div>
                            <div class="text-xs text-gray-600">Conclusão</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-yellow-600">4.1</div>
                            <div class="text-xs text-gray-600">Satisfação</div>
                        </div>
                        <div>
                            <div class="text-xl font-bold text-purple-600">82.3%</div>
                            <div class="text-xs text-gray-600">Eficiência</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Metas e Alertas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Metas -->
            <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Metas e Objetivos
                </h3>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-900">Taxa de Conclusão</span>
                            <span class="text-sm text-gray-600">92.8% / 95.0%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: 97.7%"></div>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">97.7% completo</span>
                            <span class="text-gray-600">Até Dez 2024</span>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-900">Tempo Médio de Execução</span>
                            <span class="text-sm text-gray-600">3.5h / 3.0h</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-yellow-500 h-2 rounded-full" style="width: 85.7%"></div>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">85.7% completo</span>
                            <span class="text-gray-600">Até Dez 2024</span>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-900">Satisfação do Cidadão</span>
                            <span class="text-sm text-gray-600">4.2 / 4.5</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: 93.3%"></div>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">93.3% completo</span>
                            <span class="text-gray-600">Até Dez 2024</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alertas -->
            <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    Alertas e Notificações
                </h3>
                <div class="space-y-3">
                    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <div class="flex-1">
                                <div class="font-medium text-gray-900">Produtividade abaixo da meta</div>
                                <div class="text-sm text-gray-600 mt-1">Equipe Zona 1 com produtividade 15% abaixo do esperado</div>
                                <div class="mt-2 text-xs text-gray-500">
                                    <strong>Ações:</strong> Analisar causas, Implementar plano de ação, Acompanhar diariamente
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <div class="flex-1">
                                <div class="font-medium text-gray-900">Custo elevado detectado</div>
                                <div class="text-sm text-gray-600 mt-1">Custo por serviço 10% acima do orçamento mensal</div>
                                <div class="mt-2 text-xs text-gray-500">
                                    <strong>Ações:</strong> Revisar contratos, Negociar com fornecedores, Otimizar processos
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabela de Serviços -->
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Análise por Tipo de Serviço
            </h3>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200">
                            <th class="text-left py-3 px-4 font-semibold text-gray-900">Serviço</th>
                            <th class="text-center py-3 px-4 font-semibold text-gray-900">Total</th>
                            <th class="text-center py-3 px-4 font-semibold text-gray-900">Concluídos</th>
                            <th class="text-center py-3 px-4 font-semibold text-gray-900">Taxa (%)</th>
                            <th class="text-center py-3 px-4 font-semibold text-gray-900">Tempo Médio</th>
                            <th class="text-center py-3 px-4 font-semibold text-gray-900">Satisfação</th>
                            <th class="text-center py-3 px-4 font-semibold text-gray-900">Custo Médio</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr class="hover:bg-gray-50">
                            <td class="py-4 px-4">
                                <div class="font-medium text-gray-900">Poda de Árvores</div>
                                <div class="text-sm text-gray-600">PODA_DE_ARVORES</div>
                            </td>
                            <td class="text-center py-4 px-4">45</td>
                            <td class="text-center py-4 px-4">42</td>
                            <td class="text-center py-4 px-4">
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">93.3%</span>
                            </td>
                            <td class="text-center py-4 px-4">2.5h</td>
                            <td class="text-center py-4 px-4">4.3</td>
                            <td class="text-center py-4 px-4 font-medium">R$ 180.50</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="py-4 px-4">
                                <div class="font-medium text-gray-900">Capinagem</div>
                                <div class="text-sm text-gray-600">CAPINAGEM</div>
                            </td>
                            <td class="text-center py-4 px-4">78</td>
                            <td class="text-center py-4 px-4">74</td>
                            <td class="text-center py-4 px-4">
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">94.9%</span>
                            </td>
                            <td class="text-center py-4 px-4">1.8h</td>
                            <td class="text-center py-4 px-4">4.1</td>
                            <td class="text-center py-4 px-4 font-medium">R$ 95.75</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="py-4 px-4">
                                <div class="font-medium text-gray-900">Coleta de Lixo</div>
                                <div class="text-sm text-gray-600">COLETA_DE_LIXO</div>
                            </td>
                            <td class="text-center py-4 px-4">156</td>
                            <td class="text-center py-4 px-4">148</td>
                            <td class="text-center py-4 px-4">
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">94.9%</span>
                            </td>
                            <td class="text-center py-4 px-4">0.5h</td>
                            <td class="text-center py-4 px-4">4.2</td>
                            <td class="text-center py-4 px-4 font-medium">R$ 45.20</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Resumo Executivo -->
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Visão Executiva
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div class="text-2xl font-bold text-green-600 mb-2">85.7%</div>
                    <div class="text-sm text-gray-600">Eficiência Geral</div>
                    <div class="text-xs text-green-600 mt-1">+5.2% vs mês anterior</div>
                </div>
                <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="text-2xl font-bold text-blue-600 mb-2">R$ 45,6K</div>
                    <div class="text-sm text-gray-600">Custo Total</div>
                    <div class="text-xs text-green-600 mt-1">-8.7% vs mês anterior</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div class="text-2xl font-bold text-purple-600 mb-2">4.2/5.0</div>
                    <div class="text-sm text-gray-600">Satisfação</div>
                    <div class="text-xs text-green-600 mt-1">+0.3 vs mês anterior</div>
                </div>
            </div>
            
            <div class="p-4 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-3">Principais Insights</h4>
                <ul class="space-y-2 text-sm text-gray-700">
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>A produtividade geral aumentou 5.2% no período, indicando melhoria nos processos</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Redução de 8.7% nos custos operacionais demonstra eficiência nos recursos</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <span>Equipe Zona 1 requer atenção especial - produtividade 15% abaixo da meta</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        // Dados para os gráficos
        const tendenciasData = {
            labels: ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29'],
            datasets: [
                {
                    label: 'Produtividade (%)',
                    data: [82.1, 84.3, 86.7, 85.9, 87.3],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Taxa de Conclusão (%)',
                    data: [89.7, 91.2, 92.8, 91.5, 92.8],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Satisfação (escala 0-5)',
                    data: [3.9, 4.0, 4.1, 4.2, 4.2],
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }
            ]
        };

        const distribuicaoData = {
            labels: ['Poda de Árvores', 'Capinagem', 'Coleta de Lixo', 'Manutenção'],
            datasets: [{
                data: [45, 78, 156, 23],
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#8B5CF6'
                ],
                borderWidth: 0
            }]
        };

        // Configurar gráficos
        window.addEventListener('DOMContentLoaded', function() {
            // Gráfico de Tendências
            const tendenciasCtx = document.getElementById('tendenciasChart').getContext('2d');
            new Chart(tendenciasCtx, {
                type: 'line',
                data: tendenciasData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

            // Gráfico de Pizza
            const distribuicaoCtx = document.getElementById('distribuicaoChart').getContext('2d');
            new Chart(distribuicaoCtx, {
                type: 'doughnut',
                data: distribuicaoData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        });
    </script>
</body>
</html>
  `);
});

export default dashboardHtmlRouter;