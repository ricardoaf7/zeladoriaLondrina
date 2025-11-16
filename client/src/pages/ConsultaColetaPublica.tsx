/**
 * Consulta Pública de Coleta - Interface para Munícipes
 * Página simples e intuitiva para consultar dias e horários de coleta
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Recycle, 
  Trash2, 
  Leaf, 
  Battery,
  Share2,
  Bookmark,
  BookmarkCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
  Home,
  Navigation
} from 'lucide-react';

interface ColetaResultado {
  endereco: {
    rua: string;
    bairro: string;
    cep: string;
    coordenadas?: {
      latitude: number;
      longitude: number;
    };
  };
  coleta: {
    organico: {
      dia: string;
      horario: string;
      frequencia: string;
      proxima: string;
    };
    reciclavel: {
      dia: string;
      horario: string;
      frequencia: string;
      proxima: string;
      materiais: string[];
    };
    rejeito: {
      dia: string;
      horario: string;
      frequencia: string;
      proxima: string;
    };
    especial: {
      dia: string;
      horario: string;
      frequencia: string;
      proxima: string;
      tipos: string[];
    };
  };
}

interface SugestaoEndereco {
  value: string;
  label: string;
  bairro: string;
  cep: string;
}

export function ConsultaColetaPublica() {
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [resultado, setResultado] = useState<ColetaResultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<SugestaoEndereco[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [enderecosSalvos, setEnderecosSalvos] = useState<string[]>([]);
  const [usarLocalizacao, setUsarLocalizacao] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);

  // Carregar endereços salvos ao montar
  useEffect(() => {
    const salvos = localStorage.getItem('enderecos_coleta_salvos');
    if (salvos) {
      try {
        setEnderecosSalvos(JSON.parse(salvos));
      } catch (e) {
        console.error('Erro ao carregar endereços salvos:', e);
      }
    }
  }, []);

  // Buscar sugestões enquanto digita
  useEffect(() => {
    if (endereco.length >= 2) {
      const timer = setTimeout(() => {
        buscarSugestoes(endereco);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSugestoes([]);
      setMostrarSugestoes(false);
    }
  }, [endereco]);

  /**
   * Busca sugestões de endereços
   */
  const buscarSugestoes = async (query: string) => {
    try {
      const response = await fetch(`/api/coleta/sugestoes?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSugestoes(data.data || []);
        setMostrarSugestoes(true);
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
  };

  /**
   * Consulta coleta por endereço
   */
  const consultarColeta = async () => {
    if (!endereco.trim()) {
      setErro('Por favor, digite um endereço');
      return;
    }

    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      const params = new URLSearchParams({
        endereco: endereco.trim()
      });

      if (cep.trim()) {
        params.append('cep', cep.trim());
      }

      const response = await fetch(`/api/coleta/consultar?${params}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setResultado(data.data[0]);
      } else if (data.sugestoes && data.sugestoes.length > 0) {
        setErro('Endereço não encontrado. Tente uma das sugestões:');
        setSugestoes(data.sugestoes);
        setMostrarSugestoes(true);
      } else {
        setErro('Endereço não encontrado. Verifique se digitou corretamente ou tente buscar pelo CEP.');
      }
    } catch (error) {
      setErro('Erro ao consultar coleta. Tente novamente.');
      console.error('Erro na consulta:', error);
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Usa geolocalização para encontrar coleta próxima
   */
  const usarLocalizacaoAtual = () => {
    if (!navigator.geolocation) {
      setErro('Geolocalização não suportada pelo navegador');
      return;
    }

    setUsarLocalizacao(true);
    setCarregando(true);
    setErro(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString()
          });

          const response = await fetch(`/api/coleta/consultar?${params}`);
          const data = await response.json();

          if (data.success && data.data.length > 0) {
            setResultado(data.data[0]);
            // Atualizar endereço com base na localização
            if (data.data[0].endereco) {
              setEndereco(data.data[0].endereco.rua);
              setCep(data.data[0].endereco.cep);
            }
          } else {
            setErro('Nenhuma rota de coleta encontrada próxima à sua localização.');
          }
        } catch (error) {
          setErro('Erro ao consultar coleta com localização.');
          console.error('Erro:', error);
        } finally {
          setCarregando(false);
          setUsarLocalizacao(false);
        }
      },
      (error) => {
        setErro('Não foi possível obter sua localização. Verifique as permissões do navegador.');
        setCarregando(false);
        setUsarLocalizacao(false);
      }
    );
  };

  /**
   * Seleciona uma sugestão
   */
  const selecionarSugestao = (sugestao: SugestaoEndereco) => {
    setEndereco(sugestao.value);
    setCep(sugestao.cep);
    setMostrarSugestoes(false);
    consultarColeta();
  };

  /**
   * Salva endereço nos favoritos
   */
  const salvarEndereco = () => {
    if (!resultado) return;

    const enderecoCompleto = `${resultado.endereco.rua}, ${resultado.endereco.bairro} - CEP: ${resultado.endereco.cep}`;
    
    if (enderecosSalvos.includes(enderecoCompleto)) {
      // Remover dos salvos
      const novosSalvos = enderecosSalvos.filter(e => e !== enderecoCompleto);
      setEnderecosSalvos(novosSalvos);
      localStorage.setItem('enderecos_coleta_salvos', JSON.stringify(novosSalvos));
    } else {
      // Adicionar aos salvos
      const novosSalvos = [...enderecosSalvos, enderecoCompleto];
      setEnderecosSalvos(novosSalvos);
      localStorage.setItem('enderecos_coleta_salvos', JSON.stringify(novosSalvos));
    }
  };

  /**
   * Verifica se o endereço atual está salvo
   */
  const estaSalvo = () => {
    if (!resultado) return false;
    const enderecoCompleto = `${resultado.endereco.rua}, ${resultado.endereco.bairro} - CEP: ${resultado.endereco.cep}`;
    return enderecosSalvos.includes(enderecoCompleto);
  };

  /**
   * Compartilha resultado
   */
  const compartilharResultado = async () => {
    if (!resultado) return;

    setCompartilhando(true);

    const texto = `📍 Coleta em ${resultado.endereco.rua}, ${resultado.endereco.bairro}
    
🌱 Orgânico: ${resultado.coleta.organico.dia} - ${resultado.coleta.organico.horario}
♻️ Reciclável: ${resultado.coleta.reciclavel.dia} - ${resultado.coleta.reciclavel.horario}
🗑️ Rejeito: ${resultado.coleta.rejeito.dia} - ${resultado.coleta.rejeito.horario}
🔋 Especial: ${resultado.coleta.especial.dia} - ${resultado.coleta.especial.horario}

Consulte também: https://londrina.pr.gov.br/coleta`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Calendário de Coleta - Londrina',
          text: texto,
          url: window.location.href
        });
      } else {
        // Fallback: copiar para área de transferência
        await navigator.clipboard.writeText(texto);
        alert('📋 Informações copiadas para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('📋 Erro ao compartilhar. As informações foram copiadas para a área de transferência.');
    } finally {
      setCompartilhando(false);
    }
  };

  /**
   * Formata CEP enquanto digita
   */
  const formatarCEP = (valor: string) => {
    const cep = valor.replace(/\D/g, '').slice(0, 8);
    if (cep.length <= 5) return cep;
    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  };

  /**
   * Ícone por tipo de coleta
   */
  const getIconeColeta = (tipo: string) => {
    switch (tipo) {
      case 'organico': return <Leaf className="w-5 h-5 text-green-600" />;
      case 'reciclavel': return <Recycle className="w-5 h-5 text-blue-600" />;
      case 'rejeito': return <Trash2 className="w-5 h-5 text-gray-600" />;
      case 'especial': return <Battery className="w-5 h-5 text-purple-600" />;
      default: return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  /**
   * Cor por tipo de coleta
   */
  const getCorColeta = (tipo: string) => {
    switch (tipo) {
      case 'organico': return 'bg-green-100 text-green-800 border-green-200';
      case 'reciclavel': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejeito': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'especial': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Recycle className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Consulta de Coleta</h1>
            </div>
            <p className="text-gray-600">Descubra quando passa a coleta no seu endereço</p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulário de Busca */}
        <Card className="p-6 mb-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Endereço ou nome da rua
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ex: Rua Paraná, Avenida Maringá..."
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="pr-10"
                  onKeyPress={(e) => e.key === 'Enter' && consultarColeta()}
                />
                {endereco && (
                  <button
                    onClick={() => setEndereco('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Sugestões */}
              {mostrarSugestoes && sugestoes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {sugestoes.map((sugestao, index) => (
                    <button
                      key={index}
                      onClick={() => selecionarSugestao(sugestao)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{sugestao.value}</div>
                        <div className="text-sm text-gray-500">{sugestao.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP (opcional)
                </label>
                <Input
                  type="text"
                  placeholder="86010-610"
                  value={cep}
                  onChange={(e) => setCep(formatarCEP(e.target.value))}
                  maxLength={9}
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={usarLocalizacaoAtual}
                  variant="outline"
                  className="w-full"
                  disabled={usarLocalizacao}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {usarLocalizacao ? 'Buscando...' : 'Usar minha localização'}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={consultarColeta}
                disabled={carregando || !endereco.trim()}
                className="flex-1"
              >
                {carregando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Consultar Coleta
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Endereços Salvos */}
        {enderecosSalvos.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4" />
              Seus Endereços Salvos
            </h3>
            <div className="space-y-2">
              {enderecosSalvos.slice(-3).map((enderecoSalvo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const partes = enderecoSalvo.split(' - CEP: ');
                    const [rua, bairro] = partes[0].split(', ');
                    setEndereco(rua);
                    setCep(partes[1]);
                    consultarColeta();
                  }}
                  className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{enderecoSalvo}</span>
                    <Home className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Erro */}
        {erro && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {/* Resultado */}
        {resultado && (
          <Card className="p-6 shadow-lg">
            {/* Header do Resultado */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {resultado.endereco.rua}
                </h2>
                <p className="text-gray-600">
                  {resultado.endereco.bairro} • CEP: {resultado.endereco.cep}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={salvarEndereco}
                  variant={estaSalvo() ? 'default' : 'outline'}
                  size="sm"
                >
                  {estaSalvo() ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 mr-1" />
                      Salvo
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={compartilharResultado}
                  variant="outline"
                  size="sm"
                  disabled={compartilhando}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </div>

            {/* Calendário de Coleta */}
            <div className="space-y-4">
              {Object.entries(resultado.coleta).map(([tipo, info]) => (
                <div key={tipo} className={`p-4 rounded-lg border-2 ${getCorColeta(tipo)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getIconeColeta(tipo)}
                      <h3 className="font-semibold text-lg capitalize">
                        {tipo === 'organico' ? 'Orgânico' :
                         tipo === 'reciclavel' ? 'Reciclável' :
                         tipo === 'rejeito' ? 'Rejeito' :
                         'Especial'}
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {info.frequencia}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{info.dia || 'Não definido'}</div>
                        <div className="text-sm text-gray-600">Próxima: {info.proxima}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{info.horario}</div>
                        <div className="text-sm text-gray-600">Horário de coleta</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Materiais aceitos (para reciclável e especial) */}
                  {tipo === 'reciclavel' && info.materiais && info.materiais.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <div className="text-sm font-medium mb-2">Materiais aceitos:</div>
                      <div className="flex flex-wrap gap-2">
                        {info.materiais.map((material, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {tipo === 'especial' && info.tipos && info.tipos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <div className="text-sm font-medium mb-2">Itens aceitos:</div>
                      <div className="flex flex-wrap gap-2">
                        {info.tipos.map((tipo, index) => (
                          <Badge key={index} variant="secondary" className="text-xs capitalize">
                            {tipo === 'pilhas' ? 'Pilhas' :
                             tipo === 'baterias' ? 'Baterias' :
                             tipo === 'lampadas' ? 'Lâmpadas' :
                             tipo === 'eletronicos' ? 'Eletrônicos' : tipo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Informações importantes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Coloque o lixo na calçada após as 20h do dia anterior</li>
                    <li>• Separe corretamente os materiais recicláveis</li>
                    <li>• Não coloque lixo fora dos dias e horários estabelecidos</li>
                    <li>• Para itens especiais, utilize os pontos de coleta ou agende retirada</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Informações Gerais */}
        {!resultado && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Recycle className="w-5 h-5 text-green-600" />
              Sobre a Coleta em Londrina
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Coleta Orgânica</div>
                    <div className="text-sm text-gray-600">Restos de comida, podas de jardim, folhas</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Recycle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Coleta Reciclável</div>
                    <div className="text-sm text-gray-600">Papel, plástico, metal e vidro limpos</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Coleta de Rejeito</div>
                    <div className="text-sm text-gray-600">Lixo comum, fraldas, itens não recicláveis</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Battery className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Coleta Especial</div>
                    <div className="text-sm text-gray-600">Pilhas, baterias, lâmpadas, eletrônicos</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Horário de Coleta:</p>
                  <p>A coleta geralmente ocorre entre 6h e 12h. Coloque o lixo na calçada após as 20h do dia anterior.</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Prefeitura Municipal de Londrina • Secretaria de Serviços Públicos
            </p>
            <p className="text-xs mt-1">
              Dúvidas? Ligue 156 ou acesse <a href="https://londrina.pr.gov.br" className="text-blue-600 hover:underline">londrina.pr.gov.br</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ConsultaColetaPublica;