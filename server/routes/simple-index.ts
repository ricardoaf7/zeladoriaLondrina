/**
 * Página principal simplificada com tudo integrado
 * Mapa, dashboard, importação e administração em uma única página
 */

import { Router, Request, Response } from 'express';

const simpleRouter = Router();

// Dados das 17 áreas de roçagem (baseado no CSV que você processou)
const AREAS_ROCAGEM = [
  {
    id: 1,
    tipo_item: "area publica",
    endereco: "RUA JOAO PESSOA",
    bairro: "PARQUE INDEPENDENCIA",
    metragem_m2: 1200,
    latitude: -23.3103,
    longitude: -51.1596,
    status: "pendente",
    ultima_rocagem: "2024-10-15",
    observacoes: "Área com grama alta"
  },
  {
    id: 2,
    tipo_item: "praça",
    endereco: "PRAÇA ENGENHEIRO CASONI",
    bairro: "CASONI",
    metragem_m2: 800,
    latitude: -23.3150,
    longitude: -51.1620,
    status: "concluido",
    ultima_rocagem: "2024-11-10",
    observacoes: "Manutenção concluída"
  },
  {
    id: 3,
    tipo_item: "canteiros",
    endereco: "AVENIDA HIGIENOPOLIS",
    bairro: "PARQUE INDEPENDENCIA",
    metragem_m2: 450,
    latitude: -23.3080,
    longitude: -51.1580,
    status: "em_andamento",
    ultima_rocagem: "2024-11-08",
    observacoes: "Trabalho em progresso"
  },
  {
    id: 4,
    tipo_item: "area publica",
    endereco: "RUA JOSE BONIFACIO",
    bairro: "CENTRO",
    metragem_m2: 950,
    latitude: -23.3050,
    longitude: -51.1550,
    status: "atrasado",
    ultima_rocagem: "2024-09-20",
    observacoes: "Necessita atenção urgente"
  },
  {
    id: 5,
    tipo_item: "viela",
    endereco: "VIELA SANTA TEREZINHA",
    bairro: "SANTA TEREZINHA",
    metragem_m2: 320,
    latitude: -23.3200,
    longitude: -51.1650,
    status: "pendente",
    ultima_rocagem: null,
    observacoes: "Primeira roçagem"
  },
  {
    id: 6,
    tipo_item: "lote público",
    endereco: "LOTE 15 - RUA DESCONHECIDA",
    bairro: "JARDIM ALEGRE",
    metragem_m2: 2100,
    latitude: -23.3120,
    longitude: -51.1520,
    status: "pendente",
    ultima_rocagem: null,
    observacoes: "Área grande, necessita planejamento"
  },
  {
    id: 7,
    tipo_item: "area publica",
    endereco: "RUA BARAO DO RIO BRANCO",
    bairro: "CENTRO",
    metragem_m2: 750,
    latitude: -23.3070,
    longitude: -51.1570,
    status: "concluido",
    ultima_rocagem: "2024-11-12",
    observacoes: "Manutenção regular"
  },
  {
    id: 8,
    tipo_item: "praça",
    endereco: "PRAÇA 19 DE DEZEMBRO",
    bairro: "CENTRO",
    metragem_m2: 1100,
    latitude: -23.3090,
    longitude: -51.1600,
    status: "em_andamento",
    ultima_rocagem: "2024-11-09",
    observacoes: "Trabalho iniciado"
  },
  {
    id: 9,
    tipo_item: "canteiros",
    endereco: "AVENIDA SANTOS DUMONT",
    bairro: "JARDIM AMÉRICA",
    metragem_m2: 380,
    latitude: -23.3180,
    longitude: -51.1480,
    status: "pendente",
    ultima_rocagem: "2024-10-25",
    observacoes: "Aguardando equipe"
  },
  {
    id: 10,
    tipo_item: "area publica",
    endereco: "RUA XV DE NOVEMBRO",
    bairro: "CENTRO",
    metragem_m2: 650,
    latitude: -23.3060,
    longitude: -51.1560,
    status: "atrasado",
    ultima_rocagem: "2024-08-15",
    observacoes: "Muito tempo sem manutenção"
  },
  {
    id: 11,
    tipo_item: "viela",
    endereco: "VIELA SAO FRANCISCO",
    bairro: "SAO FRANCISCO",
    metragem_m2: 280,
    latitude: -23.3220,
    longitude: -51.1500,
    status: "concluido",
    ultima_rocagem: "2024-11-11",
    observacoes: "Concluído recentemente"
  },
  {
    id: 12,
    tipo_item: "lotes",
    endereco: "LOTE 23 - CONJUNTO RESIDENCIAL",
    bairro: "JARDIM PLANALTO",
    metragem_m2: 1850,
    latitude: -23.3250,
    longitude: -51.1450,
    status: "pendente",
    ultima_rocagem: null,
    observacoes: "Área nova no sistema"
  },
  {
    id: 13,
    tipo_item: "fundo de vale",
    endereco: "FUNDOS DE VALE - RUA A",
    bairro: "VALE DO SOL",
    metragem_m2: 3400,
    latitude: -23.3280,
    longitude: -51.1420,
    status: "em_andamento",
    ultima_rocagem: "2024-11-07",
    observacoes: "Área desafiadora, requer cuidado"
  },
  {
    id: 14,
    tipo_item: "area publica",
    endereco: "RUA DO ROSARIO",
    bairro: "ROSARIO",
    metragem_m2: 520,
    latitude: -23.3140,
    longitude: -51.1680,
    status: "pendente",
    ultima_rocagem: "2024-10-30",
    observacoes: "Aguardando definição de prioridade"
  },
  {
    id: 15,
    tipo_item: "praça",
    endereco: "PRAÇA GETULIO VARGAS",
    bairro: "CENTRO",
    metragem_m2: 1300,
    latitude: -23.3110,
    longitude: -51.1630,
    status: "concluido",
    ultima_rocagem: "2024-11-13",
    observacoes: "Manutenção completa realizada"
  },
  {
    id: 16,
    tipo_item: "canteiros",
    endereco: "RUA DUQUE DE CAXIAS",
    bairro: "CENTRO",
    metragem_m2: 420,
    latitude: -23.3085,
    longitude: -51.1595,
    status: "atrasado",
    ultima_rocagem: "2024-09-05",
    observacoes: "Necessita atenção imediata"
  },
  {
    id: 17,
    tipo_item: "area publica",
    endereco: "RUA DA PRAIA",
    bairro: "PRAIA DE LONDRES",
    metragem_m2: 890,
    latitude: -23.3185,
    longitude: -51.1545,
    status: "pendente",
    ultima_rocagem: null,
    observacoes: "Nova demanda identificada"
  }
];

/**
 * Página principal simplificada - Tudo em uma página
 */
simpleRouter.get('/', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zeladoria Londrina - Sistema Integrado</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        #map { height: 500px; width: 100%; }
        .leaflet-popup-content-wrapper { border-radius: 8px; }
        .custom-popup { min-width: 200px; }
        .status-badge { 
            display: inline-block; 
            padding: 2px 8px; 
            border-radius: 12px; 
            font-size: 12px; 
            font-weight: 500;
        }
        .status-pendente { background: #fef3c7; color: #92400e; }
        .status-em-andamento { background: #dbeafe; color: #1e40af; }
        .status-concluido { background: #d1fae5; color: #065f46; }
        .status-atrasado { background: #fee2e2; color: #991b1b; }
        .cluster-icon {
            background: #10b981;
            border: 2px solid #ffffff;
            border-radius: 50%;
            color: white;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .tab-button.active {
            background: #3b82f6;
            color: white;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-lg border-b">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Zeladoria Londrina</h1>
                        <p class="text-gray-600">Sistema Integrado de Gestão</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-600">${AREAS_ROCAGEM.length} áreas cadastradas</span>
                    <button onclick="atualizarDados()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Atualizar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Navegação por Abas -->
    <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button onclick="mostrarAba('mapa')" id="tab-mapa" class="tab-button px-4 py-2 rounded-md font-medium transition-colors active">
                🗺️ Mapa
            </button>
            <button onclick="mostrarAba('dashboard')" id="tab-dashboard" class="tab-button px-4 py-2 rounded-md font-medium transition-colors">
                📊 Dashboard
            </button>
            <button onclick="mostrarAba('importar')" id="tab-importar" class="tab-button px-4 py-2 rounded-md font-medium transition-colors">
                📥 Importar Dados
            </button>
            <button onclick="mostrarAba('admin')" id="tab-admin" class="tab-button px-4 py-2 rounded-md font-medium transition-colors">
                ⚙️ Admin
            </button>
        </div>

        <!-- Conteúdo do Mapa -->
        <div id="mapa" class="tab-content active">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">Mapa de Áreas de Roçagem</h2>
                <div id="map" class="rounded-lg border"></div>
                <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-yellow-600" id="totalPendente">0</div>
                        <div class="text-sm text-gray-600">Pendentes</div>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600" id="totalAndamento">0</div>
                        <div class="text-sm text-gray-600">Em Andamento</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-green-600" id="totalConcluido">0</div>
                        <div class="text-sm text-gray-600">Concluídas</div>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-red-600" id="totalAtrasado">0</div>
                        <div class="text-sm text-gray-600">Atrasadas</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Conteúdo do Dashboard -->
        <div id="dashboard" class="tab-content">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">Dashboard de Eficiência</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold mb-3">Metragem Total</h3>
                        <canvas id="metragemChart" width="400" height="200"></canvas>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-3">Status das Áreas</h3>
                        <canvas id="statusChart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="mt-6">
                    <h3 class="text-lg font-semibold mb-3">Resumo por Bairro</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text