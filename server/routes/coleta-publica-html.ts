/**
 * Rota HTML simples para Consulta Pública de Coleta
 * Serve uma página HTML estática enquanto o frontend não está disponível
 */

import { Router, Request, Response } from 'express';

const htmlRouter = Router();

/**
 * Serve página HTML de consulta de coleta
 */
htmlRouter.get('/consulta-coleta', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Coleta - Prefeitura de Londrina</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; }
        .loading { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="text-center mb-8">
            <div class="flex items-center justify-center gap-3 mb-4">
                <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-gray-900">Consulta de Coleta</h1>
            </div>
            <p class="text-gray-600">Descubra quando passa a coleta no seu endereço</p>
        </div>

        <!-- Formulário -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Endereço ou nome da rua
                    </label>
                    <input type="text" id="endereco" placeholder="Ex: Rua Paraná, Avenida Maringá..." 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">CEP (opcional)</label>
                        <input type="text" id="cep" placeholder="86010-610" maxlength="9"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                    
                    <div class="flex items-end">
                        <button onclick="usarLocalizacao()" 
                                class="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            Usar minha localização
                        </button>
                    </div>
                </div>

                <button onclick="consultarColeta()" 
                        class="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    Consultar Coleta
                </button>
            </div>
        </div>

        <!-- Resultado -->
        <div id="resultado" class="hidden">
            <!-- Resultado será inserido aqui -->
        </div>

        <!-- Informações -->
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Sobre a Coleta em Londrina
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="font-medium">Coleta Orgânica</div>
                            <div class="text-sm text-gray-600">Restos de comida, podas de jardim, folhas</div>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="font-medium">Coleta Reciclável</div>
                            <div class="text-sm text-gray-600">Papel, plástico, metal e vidro limpos</div>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="font-medium">Coleta de Rejeito</div>
                            <div class="text-sm text-gray-600">Lixo comum, fraldas, itens não recicláveis</div>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="font-medium">Coleta Especial</div>
                            <div class="text-sm text-gray-600">Pilhas, baterias, lâmpadas, eletrônicos</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <div class="text-sm text-yellow-800">
                        <p class="font-medium mb-1">Importante:</p>
                        <ul class="space-y-1 text-yellow-700">
                            <li>• Coloque o lixo na calçada após as 20h do dia anterior</li>
                            <li>• Separe corretamente os materiais recicláveis</li>
                            <li>• Não coloque lixo fora dos dias e horários estabelecidos</li>
                            <li>• Para itens especiais, utilize os pontos de coleta ou agende retirada</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="text-center text-gray-600 mt-8">
            <p class="text-sm">Prefeitura Municipal de Londrina • Secretaria de Serviços Públicos</p>
            <p class="text-xs mt-1">Dúvidas? Ligue 156 ou acesse <a href="https://londrina.pr.gov.br" class="text-blue-600 hover:underline">londrina.pr.gov.br</a></p>
        </footer>
    </div>

    <script>
        // Funções JavaScript para a página
        
        // Formatar CEP
        document.getElementById('cep').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 5) {
                e.target.value = value;
            } else {
                e.target.value = value.slice(0, 5) + '-' + value.slice(5, 8);
            }
        });

        // Consultar coleta
        async function consultarColeta() {
            const endereco = document.getElementById('endereco').value;
            const cep = document.getElementById('cep').value;
            
            if (!endereco.trim()) {
                alert('Por favor, digite um endereço');
                return;
            }

            const params = new URLSearchParams({ endereco: endereco.trim() });
            if (cep.trim()) {
                params.append('cep', cep.trim());
            }

            try {
                const response = await fetch(\`/api/coleta/consultar?\${params}\`);
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    mostrarResultado(data.data[0]);
                } else {
                    alert('Endereço não encontrado. Verifique se digitou corretamente ou tente buscar pelo CEP.');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao consultar coleta. Tente novamente.');
            }
        }

        // Usar localização
        function usarLocalizacao() {
            if (!navigator.geolocation) {
                alert('Geolocalização não suportada pelo navegador');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const params = new URLSearchParams({
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                    });

                    try {
                        const response = await fetch(\`/api/coleta/consultar?\${params}\`);
                        const data = await response.json();

                        if (data.success && data.data.length > 0) {
                            mostrarResultado(data.data[0]);
                            // Atualizar campos com base na localização
                            if (data.data[0].endereco) {
                                document.getElementById('endereco').value = data.data[0].endereco.rua;
                                document.getElementById('cep').value = data.data[0].endereco.cep;
                            }
                        } else {
                            alert('Nenhuma rota de coleta encontrada próxima à sua localização.');
                        }
                    } catch (error) {
                        alert('Erro ao consultar coleta com localização.');
                    }
                },
                (error) => {
                    alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
                }
            );
        }

        // Mostrar resultado
        function mostrarResultado(resultado) {
            const resultadoDiv = document.getElementById('resultado');
            
            const cores = {
                organico: 'bg-green-100 text-green-800 border-green-200',
                reciclavel: 'bg-blue-100 text-blue-800 border-blue-200',
                rejeito: 'bg-gray-100 text-gray-800 border-gray-200',
                especial: 'bg-purple-100 text-purple-800 border-purple-200'
            };

            const icones = {
                organico: '🌱',
                reciclavel: '♻️',
                rejeito: '🗑️',
                especial: '🔋'
            };

            const titulos = {
                organico: 'Orgânico',
                reciclavel: 'Reciclável',
                rejeito: 'Rejeito',
                especial: 'Especial'
            };

            let html = \`
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div class="flex items-center justify-between mb-6 pb-4 border-b">
                        <div>
                            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                \${resultado.endereco.rua}
                            </h2>
                            <p class="text-gray-600">
                                \${resultado.endereco.bairro} • CEP: \${resultado.endereco.cep}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-4">
            \`;

            Object.entries(resultado.coleta).forEach(([tipo, info]) => {
                html += \`
                        <div class="p-4 rounded-lg border-2 \${cores[tipo]}">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl">\${icones[tipo]}</span>
                                    <h3 class="font-semibold text-lg">\${titulos[tipo]}</h3>
                                </div>
                                <span class="text-xs font-medium bg-white px-2 py-1 rounded">\${info.frequencia}</span>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <div>
                                        <div class="font-medium">\${info.dia}</div>
                                        <div class="text-sm text-gray-600">Próxima: \${info.proxima}</div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div>
                                        <div class="font-medium">\${info.horario}</div>
                                        <div class="text-sm text-gray-600">Horário de coleta</div>
                                    </div>
                                </div>
                            </div>
                            \${tipo === 'reciclavel' && info.materiais ? \`
                                <div class="mt-3 pt-3 border-t border-current border-opacity-20">
                                    <div class="text-sm font-medium mb-2">Materiais aceitos:</div>
                                    <div class="flex flex-wrap gap-2">
                                        \${info.materiais.map(material => \`<span class="text-xs bg-white px-2 py-1 rounded">\${material}</span>\`).join('')}
                                    </div>
                                </div>
                            \` : ''}
                            \${tipo === 'especial' && info.tipos ? \`
                                <div class="mt-3 pt-3 border-t border-current border-opacity-20">
                                    <div class="text-sm font-medium mb-2">Itens aceitos:</div>
                                    <div class="flex flex-wrap gap-2">
                                        \${info.tipos.map(tipo => \`<span class="text-xs bg-white px-2 py-1 rounded capitalize">\${tipo}</span>\`).join('')}
                                    </div>
                                </div>
                            \` : ''}
                        </div>
                \`;
            });

            html += \`
                    </div>

                    <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div class="text-sm text-blue-800">
                                <p class="font-medium mb-1">Importante:</p>
                                <ul class="space-y-1 text-blue-700">
                                    <li>• Coloque o lixo na calçada após as 20h do dia anterior</li>
                                    <li>• Separe corretamente os materiais recicláveis</li>
                                    <li>• Não coloque lixo fora dos dias e horários estabelecidos</li>
                                    <li>• Para itens especiais, utilize os pontos de coleta ou agende retirada</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            \`;

            resultadoDiv.innerHTML = html;
            resultadoDiv.classList.remove('hidden');
            resultadoDiv.scrollIntoView({ behavior: 'smooth' });
        }

        // Adicionar evento Enter
        document.getElementById('endereco').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                consultarColeta();
            }
        });
    </script>
</body>
</html>
  `);
});

export default htmlRouter;