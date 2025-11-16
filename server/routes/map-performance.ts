/**
 * Mapa de Performance - HTML
 * Página HTML do mapa otimizado de performance
 */

import { Router, Request, Response } from 'express';

const mapPerformanceRouter = Router();

/**
 * Serve página HTML do mapa de performance
 */
mapPerformanceRouter.get('/map-performance', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa de Performance - Zeladoria Londrina</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; }
        #map { height: 100vh; width: 100%; }
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
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #10b981;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-lg border-b fixed top-0 left-0 right-0 z-50">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Mapa de Performance</h1>
                        <p class="text-gray-600">Visualização geográfica das áreas de roçagem</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-sm text-gray-600">
                        <span id="totalAreas">0</span> áreas carregadas
                    </div>
                    <button onclick="refreshMap()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Atualizar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Controles laterais -->
    <div class="fixed top-24 left-4 z-40 bg-white rounded-lg shadow-lg p-4 w-80 max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 class="font-semibold text-gray-900 mb-4">Filtros e Controles</h3>
        
        <!-- Filtros -->
        <div class="space-y-4 mb-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                <select id="bairroFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Todos os bairros</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Área</label>
                <select id="tipoFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Todos os tipos</option>
                    <option value="area_publica">Área Pública</option>
                    <option value="praca">Praça</option>
                    <option value="canteiros">Canteiros</option>
                    <option value="viela">Viela</option>
                    <option value="lote_publico">Lote Público</option>
                    <option value="lotes">Lotes</option>
                    <option value="fundo_de_vale">Fundo de Vale</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select id="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Todos os status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="atrasado">Atrasado</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Dias desde última roçagem</label>
                <select id="diasFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Todos</option>
                    <option value="0-5">0-5 dias</option>
                    <option value="6-15">6-15 dias</option>
                    <option value="16-25">16-25 dias</option>
                    <option value="26-40">26-40 dias</option>
                    <option value="40+">Mais de 40 dias</option>
                </select>
            </div>
            
            <button onclick="aplicarFiltros()" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Aplicar Filtros
            </button>
            
            <button onclick="limparFiltros()" class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Limpar Filtros
            </button>
        </div>
        
        <!-- Estatísticas -->
        <div class="border-t pt-4">
            <h4 class="font-medium text-gray-900 mb-3">Estatísticas</h4>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">Total de áreas:</span>
                    <span id="statTotal" class="font-medium">0</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Áreas em atraso:</span>
                    <span id="statAtrasado" class="font-medium text-red-600">0</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Áreas concluídas:</span>
                    <span id="statConcluido" class="font-medium text-green-600">0</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Média de dias:</span>
                    <span id="statMedia" class="font-medium">0</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Mapa -->
    <div id="map" class="mt-20"></div>

    <!-- Loading overlay -->
    <div id="loading" class="loading-overlay" style="display: none;">
        <div class="loading-spinner"></div>
    </div>

    <script>
        let map;
        let markers = [];
        let areasData = [];
        let markerClusterGroup;

        // Inicializar o mapa
        function initMap() {
            map = L.map('map').setView([-23.3103, -51.1596], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Grupo de clusters
            markerClusterGroup = L.markerClusterGroup({
                chunkedLoading: true,
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: function(cluster) {
                    const count = cluster.getChildCount();
                    return L.divIcon({
                        html: '<div class="cluster-icon">' + count + '</div>',
                        className: 'cluster-icon',
                        iconSize: [40, 40]
                    });
                }
            });
            
            map.addLayer(markerClusterGroup);
            
            // Carregar dados
            carregarDados();
        }

        // Carregar dados do servidor
        async function carregarDados() {
            showLoading(true);
            
            try {
                const response = await fetch('/api/map/areas');
                const result = await response.json();
                
                if (result.success) {
                    areasData = result.data;
                    atualizarMapa(areasData);
                    atualizarEstatisticas(areasData);
                    atualizarFiltros(areasData);
                    document.getElementById('totalAreas').textContent = areasData.length;
                } else {
                    console.error('Erro ao carregar dados:', result.message);
                    alert('Erro ao carregar dados do mapa');
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                alert('Erro ao conectar ao servidor');
            } finally {
                showLoading(false);
            }
        }

        // Atualizar mapa com marcadores
        function atualizarMapa(areas) {
            // Limpar marcadores anteriores
            markerClusterGroup.clearLayers();
            markers = [];
            
            areas.forEach(function(area) {
                if (area.latitude && area.longitude) {
                    const marker = criarMarcador(area);
                    markers.push(marker);
                    markerClusterGroup.addLayer(marker);
                }
            });
        }

        // Criar marcador personalizado
        function criarMarcador(area) {
            const color = getStatusColor(area.status);
            const icon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: ' + color + '; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });
            
            const marker = L.marker([area.latitude, area.longitude], { icon });
            
            let popupContent = '<div class="custom-popup">';
            popupContent += '<h4 class="font-bold text-gray-900 mb-2">' + (area.tipo_item || 'Área de Roçagem') + '</h4>';
            popupContent += '<p class="text-sm text-gray-600 mb-2">' + (area.endereco || 'Endereço não informado') + '</p>';
            popupContent += '<p class="text-sm text-gray-600 mb-2">' + (area.bairro || 'Bairro não informado') + '</p>';
            popupContent += '<div class="space-y-1 text-sm">';
            popupContent += '<div class="flex justify-between">';
            popupContent += '<span>Metragem:</span>';
            popupContent += '<span class="font-medium">' + (area.metragem_m2 || 0).toLocaleString('pt-BR') + ' m²</span>';
            popupContent += '</div>';
            popupContent += '<div class="flex justify-between">';
            popupContent += '<span>Status:</span>';
            popupContent += '<span class="status-badge status-' + (area.status || 'pendente') + '">' + getStatusLabel(area.status) + '</span>';
            popupContent += '</div>';
            popupContent += '<div class="flex justify-between">';
            popupContent += '<span>Última roçagem:</span>';
            popupContent += '<span class="font-medium">' + formatarData(area.ultima_rocagem) + '</span>';
            popupContent += '</div>';
            if (area.observacoes) {
                popupContent += '<div class="mt-2 text-xs text-gray-500">' + area.observacoes + '</div>';
            }
            popupContent += '</div>';
            popupContent += '</div>';
              
            marker.bindPopup(popupContent);
            return marker;
        }

        // Funções auxiliares
        function getStatusColor(status) {
            const colors = {
                'pendente': '#f59e0b',
                'em_andamento': '#3b82f6',
                'concluido': '#10b981',
                'atrasado': '#ef4444'
            };
            return colors[status] || '#6b7280';
        }

        function getStatusLabel(status) {
            const labels = {
                'pendente': 'Pendente',
                'em_andamento': 'Em Andamento',
                'concluido': 'Concluído',
                'atrasado': 'Atrasado'
            };
            return labels[status] || 'Não informado';
        }

        function formatarData(data) {
            if (!data) return 'Nunca roçado';
            const date = new Date(data);
            const hoje = new Date();
            const dias = Math.floor((hoje - date) / (1000 * 60 * 60 * 24));
            
            if (dias === 0) return 'Hoje';
            if (dias === 1) return 'Ontem';
            if (dias < 30) return 'Há ' + dias + ' dias';
            if (dias < 365) return 'Há ' + Math.floor(dias / 30) + ' meses';
            return 'Há ' + Math.floor(dias / 365) + ' anos';
        }

        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'flex' : 'none';
        }

        function aplicarFiltros() {
            const bairro = document.getElementById('bairroFilter').value;
            const tipo = document.getElementById('tipoFilter').value;
            const status = document.getElementById('statusFilter').value;
            const dias = document.getElementById('diasFilter').value;
            
            let filteredAreas = areasData.filter(area => {
                if (bairro && area.bairro !== bairro) return false;
                if (tipo && area.tipo_item !== tipo) return false;
                if (status && area.status !== status) return false;
                
                if (dias) {
                    const diasDesdeUltimaRocagem = calcularDiasDesdeUltimaRocagem(area.ultima_rocagem);
                    if (dias === '0-5' && (diasDesdeUltimaRocagem < 0 || diasDesdeUltimaRocagem > 5)) return false;
                    if (dias === '6-15' && (diasDesdeUltimaRocagem < 6 || diasDesdeUltimaRocagem > 15)) return false;
                    if (dias === '16-25' && (diasDesdeUltimaRocagem < 16 || diasDesdeUltimaRocagem > 25)) return false;
                    if (dias === '26-40' && (diasDesdeUltimaRocagem < 26 || diasDesdeUltimaRocagem > 40)) return false;
                    if (dias === '40+' && diasDesdeUltimaRocagem < 40) return false;
                }
                
                return true;
            });
            
            atualizarMapa(filteredAreas);
            atualizarEstatisticas(filteredAreas);
        }

        function limparFiltros() {
            document.getElementById('bairroFilter').value = '';
            document.getElementById('tipoFilter').value = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('diasFilter').value = '';
            aplicarFiltros();
        }

        function calcularDiasDesdeUltimaRocagem(data) {
            if (!data) return 999;
            const date = new Date(data);
            const hoje = new Date();
            return Math.floor((hoje - date) / (1000 * 60 * 60 * 24));
        }

        function atualizarEstatisticas(areas) {
            document.getElementById('statTotal').textContent = areas.length;
            document.getElementById('statAtrasado').textContent = areas.filter(a => a.status === 'atrasado').length;
            document.getElementById('statConcluido').textContent = areas.filter(a => a.status === 'concluido').length;
            
            const diasArray = areas.map(a => calcularDiasDesdeUltimaRocagem(a.ultima_rocagem)).filter(d => d < 999);
            const mediaDias = diasArray.length > 0 ? Math.round(diasArray.reduce((a, b) => a + b, 0) / diasArray.length) : 0;
            document.getElementById('statMedia').textContent = mediaDias + ' dias';
        }

        function atualizarFiltros(areas) {
            const bairros = [...new Set(areas.map(a => a.bairro).filter(Boolean))].sort();
            const bairroSelect = document.getElementById('bairroFilter');
            bairroSelect.innerHTML = '<option value="">Todos os bairros</option>';
            bairros.forEach(bairro => {
                const option = document.createElement('option');
                option.value = bairro;
                option.textContent = bairro;
                bairroSelect.appendChild(option);
            });
        }

        function refreshMap() {
            carregarDados();
        }

        // Inicializar quando a página carregar
        document.addEventListener('DOMContentLoaded', initMap);
    </script>
</body>
</html>
  `);
});

export default mapPerformanceRouter;