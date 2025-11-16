/**
 * API Pública de Consulta de Coleta
 * Permite que munícipes consultem os dias e horários de coleta do seu endereço
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

const coletaRouter = Router();

// Esquemas de validação
const ConsultaEnderecoSchema = z.object({
  endereco: z.string().min(3).max(255).optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/).optional(),
  bairro: z.string().min(2).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
}).refine(data => {
  // Pelo menos um campo deve ser fornecido
  return data.endereco || data.cep || data.bairro || (data.latitude && data.longitude);
}, {
  message: "Pelo menos um campo de endereço deve ser fornecido"
});

const SugestaoSchema = z.object({
  endereco: z.string().min(3).max(255),
  bairro: z.string().min(2).max(100).optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/).optional()
});

/**
 * Consulta coleta por endereço
 * Suporta múltiplos métodos de busca: endereço, CEP, bairro ou coordenadas
 */
coletaRouter.get('/consultar', async (req: Request, res: Response) => {
  try {
    const params = ConsultaEnderecoSchema.parse({
      endereco: req.query.endereco as string,
      cep: req.query.cep as string,
      bairro: req.query.bairro as string,
      latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
      longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined
    });

    let resultados = [];

    // Busca por CEP (mais precisa)
    if (params.cep) {
      resultados = await buscarPorCEP(params.cep);
    }
    // Busca por endereço
    else if (params.endereco) {
      resultados = await buscarPorEndereco(params.endereco, params.bairro);
    }
    // Busca por bairro
    else if (params.bairro) {
      resultados = await buscarPorBairro(params.bairro);
    }
    // Busca por coordenadas (geolocalização)
    else if (params.latitude && params.longitude) {
      resultados = await buscarPorCoordenadas(params.latitude, params.longitude);
    }

    if (resultados.length === 0) {
      // Tentar busca aproximada
      resultados = await buscarAproximado(params);
    }

    // Formatar resposta para o usuário
    const respostaFormatada = formatarRespostaColeta(resultados);

    res.json({
      success: true,
      data: respostaFormatada,
      total: resultados.length,
      sugestoes: resultados.length === 0 ? await gerarSugestoes(params) : []
    });

  } catch (error) {
    console.error('❌ Erro na consulta de coleta:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros inválidos',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao consultar coleta',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * Busca sugestões de endereços (autocomplete)
 */
coletaRouter.get('/sugestoes', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Digite pelo menos 2 caracteres para busca'
      });
    }

    const sugestoes = await buscarSugestoes(q);
    
    res.json({
      success: true,
      data: sugestoes,
      total: sugestoes.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar sugestões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar sugestões'
    });
  }
});

/**
 * Busca por CEP
 */
async function buscarPorCEP(cep: string) {
  // Simulação - em produção buscar do banco
  const mockData = [
    {
      id: '1',
      rua_nome: 'Rua Paraná',
      rua_tipo: 'Rua',
      bairro: 'Centro',
      cep: '86010-610',
      latitude: -23.3045,
      longitude: -51.1692,
      organico_dia_semana: 'Terça-feira',
      organico_horario_inicio: '06:00',
      organico_horario_fim: '08:00',
      reciclavel_dia_semana: 'Segunda-feira',
      reciclavel_horario_inicio: '06:00',
      reciclavel_horario_fim: '08:00',
      rejeito_dia_semana: 'Quinta-feira',
      rejeito_horario_inicio: '06:00',
      rejeito_horario_fim: '08:00',
      especial_dia_semana: 'Sábado',
      especial_horario_inicio: '08:00',
      especial_horario_fim: '12:00',
      especial_tipos: ['pilhas', 'baterias', 'lampadas'],
      ativo: true
    }
  ];

  return mockData.filter(item => item.cep === cep);
}

/**
 * Busca por endereço com fuzzy matching
 */
async function buscarPorEndereco(endereco: string, bairro?: string) {
  const mockData = getMockColetaData();
  
  // Fuzzy search simples
  const termos = endereco.toLowerCase().split(' ');
  
  return mockData.filter(item => {
    const nomeCompleto = `${item.rua_tipo} ${item.rua_nome}`.toLowerCase();
    const matchEndereco = termos.some(termo => nomeCompleto.includes(termo));
    const matchBairro = !bairro || item.bairro.toLowerCase().includes(bairro.toLowerCase());
    
    return matchEndereco && matchBairro && item.ativo;
  }).slice(0, 10); // Limitar resultados
}

/**
 * Busca por bairro
 */
async function buscarPorBairro(bairro: string) {
  const mockData = getMockColetaData();
  
  return mockData.filter(item => 
    item.bairro.toLowerCase().includes(bairro.toLowerCase()) && item.ativo
  ).slice(0, 20);
}

/**
 * Busca por coordenadas (encontra o ponto mais próximo)
 */
async function buscarPorCoordenadas(lat: number, lng: number) {
  const mockData = getMockColetaData();
  
  // Calcular distância e ordenar
  const comDistancia = mockData.map(item => ({
    ...item,
    distancia: calcularDistancia(lat, lng, item.latitude, item.longitude)
  }));
  
  // Pegar os 5 mais próximos
  return comDistancia
    .filter(item => item.distancia < 0.01) // Max 1km de distância
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, 5);
}

/**
 * Busca aproximada quando não encontra exato
 */
async function buscarAproximado(params: any) {
  const mockData = getMockColetaData();
  
  // Buscar no mesmo bairro ou próximo
  if (params.bairro) {
    return mockData.filter(item => 
      item.bairro.toLowerCase().includes(params.bairro.toLowerCase()) && item.ativo
    ).slice(0, 5);
  }
  
  return [];
}

/**
 * Busca sugestões para autocomplete
 */
async function buscarSugestoes(query: string) {
  const mockData = getMockColetaData();
  const termos = query.toLowerCase().split(' ');
  
  const sugestoes = mockData
    .filter(item => {
      const enderecoCompleto = `${item.rua_tipo} ${item.rua_nome}, ${item.bairro}`.toLowerCase();
      return termos.some(termo => enderecoCompleto.includes(termo)) && item.ativo;
    })
    .map(item => ({
      value: `${item.rua_tipo} ${item.rua_nome}`,
      label: `${item.rua_tipo} ${item.rua_nome}, ${item.bairro}`,
      bairro: item.bairro,
      cep: item.cep
    }))
    .slice(0, 10);
  
  // Remover duplicatas
  const unicas = sugestoes.filter((item, index, self) => 
    index === self.findIndex(t => t.value === item.value)
  );
  
  return unicas;
}

/**
 * Formata resposta para o usuário
 */
function formatarRespostaColeta(dados: any[]) {
  return dados.map(item => ({
    endereco: {
      rua: `${item.rua_tipo} ${item.rua_nome}`,
      bairro: item.bairro,
      cep: item.cep,
      coordenadas: {
        latitude: item.latitude,
        longitude: item.longitude
      }
    },
    coleta: {
      organico: {
        dia: item.organico_dia_semana,
        horario: item.organico_horario_inicio && item.organico_horario_fim 
          ? `${item.organico_horario_inicio} às ${item.organico_horario_fim}`
          : 'Horário não definido',
        frequencia: item.organico_frequencia,
        observacao: item.organico_observacao,
        proxima: calcularProximaColeta(item.organico_dia_semana)
      },
      reciclavel: {
        dia: item.reciclavel_dia_semana,
        horario: item.reciclavel_horario_inicio && item.reciclavel_horario_fim
          ? `${item.reciclavel_horario_inicio} às ${item.reciclavel_horario_fim}`
          : 'Horário não definido',
        frequencia: item.reciclavel_frequencia,
        observacao: item.reciclavel_observacao,
        proxima: calcularProximaColeta(item.reciclavel_dia_semana),
        materiais: ['Papel', 'Plástico', 'Metal', 'Vidro']
      },
      rejeito: {
        dia: item.rejeito_dia_semana,
        horario: item.rejeito_horario_inicio && item.rejeito_horario_fim
          ? `${item.rejeito_horario_inicio} às ${item.rejeito_horario_fim}`
          : 'Horário não definido',
        frequencia: item.rejeito_frequencia,
        observacao: item.rejeito_observacao,
        proxima: calcularProximaColeta(item.rejeito_dia_semana)
      },
      especial: {
        dia: item.especial_dia_semana,
        horario: item.especial_horario_inicio && item.especial_horario_fim
          ? `${item.especial_horario_inicio} às ${item.especial_horario_fim}`
          : 'Horário não definido',
        frequencia: item.especial_frequencia,
        observacao: item.especial_observacao,
        proxima: calcularProximaColeta(item.especial_dia_semana),
        tipos: item.especial_tipos || []
      }
    },
    status: {
      ativo: item.ativo,
      vigencia: {
        inicio: item.data_inicio_vigencia,
        fim: item.data_fim_vigencia
      }
    }
  }));
}

/**
 * Gera sugestões quando não encontra resultado
 */
async function gerarSugestoes(params: any) {
  const mockData = getMockColetaData();
  
  // Sugerir bairros próximos
  const bairrosUnicos = [...new Set(mockData.map(item => item.bairro))];
  
  return bairrosUnicos.map(bairro => ({
    tipo: 'bairro',
    valor: bairro,
    mensagem: `Tente buscar no bairro ${bairro}`
  })).slice(0, 5);
}

/**
 * Calcula próxima coleta baseada no dia da semana
 */
function calcularProximaColeta(diaSemana: string): string {
  if (!diaSemana) return 'Não definido';
  
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const hoje = new Date();
  const diaAtual = hoje.getDay();
  const diaColeta = dias.findIndex(d => d === diaSemana);
  
  if (diaColeta === -1) return 'Dia inválido';
  
  let diasDiff = diaColeta - diaAtual;
  if (diasDiff < 0) diasDiff += 7;
  if (diasDiff === 0) diasDiff = 7;
  
  const proximaData = new Date(hoje);
  proximaData.setDate(hoje.getDate() + diasDiff);
  
  return proximaData.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

/**
 * Calcula distância entre dois pontos (simplificado)
 */
function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Fórmula de Haversine simplificada
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Dados mock para teste
 */
function getMockColetaData() {
  return [
    {
      id: '1',
      rua_nome: 'Rua Paraná',
      rua_tipo: 'Rua',
      bairro: 'Centro',
      cep: '86010-610',
      latitude: -23.3045,
      longitude: -51.1692,
      organico_dia_semana: 'Terça-feira',
      organico_horario_inicio: '06:00',
      organico_horario_fim: '08:00',
      reciclavel_dia_semana: 'Segunda-feira',
      reciclavel_horario_inicio: '06:00',
      reciclavel_horario_fim: '08:00',
      rejeito_dia_semana: 'Quinta-feira',
      rejeito_horario_inicio: '06:00',
      rejeito_horario_fim: '08:00',
      especial_dia_semana: 'Sábado',
      especial_horario_inicio: '08:00',
      especial_horario_fim: '12:00',
      especial_tipos: ['pilhas', 'baterias', 'lampadas'],
      ativo: true
    },
    {
      id: '2',
      rua_nome: 'Avenida Maringá',
      rua_tipo: 'Avenida',
      bairro: 'Centro',
      cep: '86010-900',
      latitude: -23.3098,
      longitude: -51.1587,
      organico_dia_semana: 'Quinta-feira',
      organico_horario_inicio: '06:00',
      organico_horario_fim: '08:00',
      reciclavel_dia_semana: 'Quarta-feira',
      reciclavel_horario_inicio: '06:00',
      reciclavel_horario_fim: '08:00',
      rejeito_dia_semana: 'Segunda-feira',
      rejeito_horario_inicio: '06:00',
      rejeito_horario_fim: '08:00',
      especial_dia_semana: 'Sábado',
      especial_horario_inicio: '08:00',
      especial_horario_fim: '12:00',
      especial_tipos: ['pilhas', 'baterias', 'eletronicos'],
      ativo: true
    },
    {
      id: '3',
      rua_nome: 'Rua Espírito Santo',
      rua_tipo: 'Rua',
      bairro: 'Zona 1',
      cep: '86031-540',
      latitude: -23.2854,
      longitude: -51.1423,
      organico_dia_semana: 'Segunda-feira',
      organico_horario_inicio: '06:00',
      organico_horario_fim: '08:00',
      reciclavel_dia_semana: 'Sexta-feira',
      reciclavel_horario_inicio: '06:00',
      reciclavel_horario_fim: '08:00',
      rejeito_dia_semana: 'Terça-feira',
      rejeito_horario_inicio: '06:00',
      rejeito_horario_fim: '08:00',
      especial_dia_semana: 'Sábado',
      especial_horario_inicio: '08:00',
      especial_horario_fim: '12:00',
      especial_tipos: ['pilhas', 'lampadas'],
      ativo: true
    }
  ];
}

export default coletaRouter;