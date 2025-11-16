/**
 * OCR Import Routes - Importação de Áreas de Roçagem
 * Processa dados OCR e importa áreas de roçagem para o Supabase
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const ocrImportRouter = Router();

// Esquemas de validação
const OcrDataSchema = z.object({
  ocrText: z.string().min(10, "Texto OCR muito curto"),
  source: z.string().optional().default("API_UPLOAD"),
  validateOnly: z.boolean().optional().default(false),
  batchSize: z.number().int().min(1).max(100).optional().default(50)
});

const ProcessedAreaSchema = z.object({
  tipo_item: z.string(),
  endereco: z.string(),
  bairro: z.string(),
  metragem_m2: z.number().positive(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  lote: z.number().int().positive().optional(),
  observacoes: z.string().optional()
});

// Tipos
type OcrDataInput = z.infer<typeof OcrDataSchema>;
type ProcessedArea = z.infer<typeof ProcessedAreaSchema>;

interface ImportResult {
  success: boolean;
  data: {
    total: number;
    processed: number;
    imported: number;
    errors: number;
    skipped: number;
    areas: ProcessedArea[];
    errors_detail: string[];
  };
  message: string;
}

/**
 * POST /api/ocr/process - Processa texto OCR e retorna dados estruturados
 */
ocrImportRouter.post('/process', async (req: Request, res: Response) => {
  try {
    // Validar entrada
    const validationResult = OcrDataSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: validationResult.error.errors[0].message
      });
    }
    
    const { ocrText, validateOnly } = validationResult.data;
    
    console.log(`🔍 Processando ${ocrText.length} caracteres de OCR...`);
    
    // Processar OCR
    const processedAreas = await processOCRText(ocrText);
    
    console.log(`📊 ${processedAreas.length} áreas encontradas`);
    
    if (validateOnly) {
      return res.json({
        success: true,
        data: {
          areas: processedAreas,
          total: processedAreas.length,
          validation_status: 'valid'
        },
        message: 'Dados validados com sucesso'
      });
    }
    
    // Importar para Supabase
    const importResult = await importAreasToSupabase(processedAreas);
    
    res.json({
      success: true,
      data: importResult,
      message: `Importação concluída: ${importResult.imported} de ${importResult.total} áreas`
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar OCR:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar OCR',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * POST /api/ocr/areas - Importa áreas processadas diretamente
 */
ocrImportRouter.post('/areas', async (req: Request, res: Response) => {
  try {
    const areas = req.body.areas;
    
    if (!Array.isArray(areas) || areas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: 'Array de áreas vazio ou inválido'
      });
    }
    
    // Validar cada área
    const validatedAreas: ProcessedArea[] = [];
    const validationErrors: string[] = [];
    
    for (let i = 0; i < areas.length; i++) {
      const validation = ProcessedAreaSchema.safeParse(areas[i]);
      
      if (validation.success) {
        validatedAreas.push(validation.data);
      } else {
        validationErrors.push(`Área ${i + 1}: ${validation.error.errors[0].message}`);
      }
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validação falhou',
        message: `${validationErrors.length} áreas inválidas`,
        errors: validationErrors
      });
    }
    
    // Importar áreas validadas
    const importResult = await importAreasToSupabase(validatedAreas);
    
    res.json({
      success: true,
      data: importResult,
      message: `Importadas ${importResult.imported} de ${importResult.total} áreas`
    });
    
  } catch (error) {
    console.error('❌ Erro ao importar áreas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar áreas',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * GET /api/ocr/templates - Retorna templates de OCR para diferentes formatos
 */
ocrImportRouter.get('/templates', (req: Request, res: Response) => {
  const templates = [
    {
      id: 'rocagem_londrina',
      name: 'Roçagem Londrina',
      description: 'Formato padrão para áreas de roçagem de Londrina',
      fields: [
        { name: 'tipo_item', type: 'string', required: true },
        { name: 'endereco', type: 'string', required: true },
        { name: 'bairro', type: 'string', required: true },
        { name: 'metragem_m2', type: 'number', required: true },
        { name: 'latitude', type: 'number', required: false },
        { name: 'longitude', type: 'number', required: false },
        { name: 'lote', type: 'number', required: false },
        { name: 'observacoes', type: 'string', required: false }
      ]
    },
    {
      id: 'rocagem_simples',
      name: 'Roçagem Simples',
      description: 'Formato simplificado para importação rápida',
      fields: [
        { name: 'endereco', type: 'string', required: true },
        { name: 'bairro', type: 'string', required: true },
        { name: 'metragem_m2', type: 'number', required: true }
      ]
    }
  ];
  
  res.json({
    success: true,
    data: templates,
    message: 'Templates disponíveis'
  });
});

/**
 * GET /api/ocr/history - Histórico de importações
 */
ocrImportRouter.get('/history', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Retornar histórico vazio por enquanto
    res.json({
      success: true,
      data: {
        imports: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0
        }
      },
      message: 'Histórico de importações'
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar histórico',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===== FUNÇÕES DE PROCESSAMENTO =====

/**
 * Processa texto OCR e extrai áreas de roçagem
 */
async function processOCRText(ocrText: string): Promise<ProcessedArea[]> {
  const areas: ProcessedArea[] = [];
  const lines = ocrText.split('\n').filter(line => line.trim());
  
  console.log(`📄 Processando ${lines.length} linhas de OCR...`);
  
  // Pular cabeçalho se existir
  let startIndex = 0;
  const firstLine = lines[0]?.toLowerCase() || '';
  if (firstLine.includes('tipo_item') || firstLine.includes('endereco')) {
    startIndex = 1;
  }
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    try {
      const area = parseOCRLine(line, i + 1);
      if (area) {
        areas.push(area);
      }
    } catch (error) {
      console.warn(`⚠️  Erro ao processar linha ${i + 1}:`, error);
    }
  }
  
  return areas;
}

/**
 * Parse uma linha de OCR e extrai dados da área
 */
function parseOCRLine(line: string, lineNumber: number): ProcessedArea | null {
  // Dividir a linha em partes
  const parts = splitOCRLine(line);
  
  if (parts.length < 4) {
    console.warn(`⚠️  Linha ${lineNumber}: Poucos campos (${parts.length})`);
    return null;
  }
  
  // Extrair campos
  const tipo_item = extractTipoItem(parts);
  const endereco = extractEndereco(parts);
  const bairro = extractBairro(parts);
  const metragem_m2 = extractMetragem(parts);
  const latitude = extractLatitude(parts);
  const longitude = extractLongitude(parts);
  const lote = extractLote(parts);
  const observacoes = extractObservacoes(parts);
  
  // Validar campos obrigatórios
  if (!tipo_item || !endereco) {
    console.warn(`⚠️  Linha ${lineNumber}: Campos obrigatórios faltando`);
    return null;
  }
  
  return {
    tipo_item,
    endereco,
    bairro: bairro || "Não especificado",
    metragem_m2: metragem_m2 || 0,
    latitude,
    longitude,
    lote,
    observacoes
  };
}

/**
 * Divide linha OCR em campos considerando diferentes formatos
 */
function splitOCRLine(line: string): string[] {
  // Tentar dividir por múltiplos espaços ou tabulações
  let parts = line.split(/\s{2,}|\t/);
  
  // Se não conseguiu dividir bem, tentar por padrões numéricos
  if (parts.length < 5) {
    // Dividir antes de números que parecem ser metragem/lote
    parts = line.split(/(?=\d+\.?\d*,?\d*\s)/);
    parts = parts.map(p => p.trim()).filter(p => p);
  }
  
  // Limpar partes
  return parts.map(part => part.trim()).filter(part => part);
}

/**
 * Extrai tipo_item dos primeiros campos
 */
function extractTipoItem(parts: string[]): string {
  for (const part of parts.slice(0, 3)) {
    const partLower = part.toLowerCase();
    if (['area publica', 'praça', 'canteiros', 'viela', 'lote público', 'lotes', 'fundo de vale'].some(type => partLower.includes(type))) {
      return part.trim();
    }
  }
  return parts[0]?.trim() || "area publica";
}

/**
 * Extrai endereco (geralmente após tipo_item)
 */
function extractEndereco(parts: string[]): string {
  for (const part of parts.slice(1, 4)) {
    const partLower = part.toLowerCase();
    if (['rua', 'av ', 'avenida', 'praça', 'travessa', 'alameda'].some(street => partLower.includes(street))) {
      return part.trim();
    }
  }
  return parts[1]?.trim() || "";
}

/**
 * Extrai bairro (geralmente após endereco)
 */
function extractBairro(parts: string[]): string {
  const bairrosConhecidos = ['casoni', 'paraná', 'matarazzo', 'kase', 'são caetano', 'portuguesa', 'recreio', 'santa monica'];
  
  for (const part of parts.slice(2, 5)) {
    if (bairrosConhecidos.some(bairro => part.toLowerCase().includes(bairro))) {
      return part.trim();
    }
  }
  
  // Tentar identificar campo que não seja número ou coordenada
  for (const part of parts.slice(2, 5)) {
    if (!/^-?\d+\.?\d*,?\d*$/.test(part) && part.length > 2) {
      return part.trim();
    }
  }
  
  return "";
}

/**
 * Extrai metragem_m2 (número com formato brasileiro)
 */
function extractMetragem(parts: string[]): number | undefined {
  for (const part of parts) {
    const match = part.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/);
    if (match) {
      try {
        const numberStr = match[1].replace('.', '').replace(',', '.');
        const value = parseFloat(numberStr);
        if (value >= 1 && value <= 100000) {
          return value;
        }
      } catch {
        continue;
      }
    }
  }
  return undefined;
}

/**
 * Extrai latitude (coordenada negativa para Londrina)
 */
function extractLatitude(parts: string[]): number | undefined {
  for (const part of parts) {
    const match = part.match(/-23[.,]\d{4,}/);
    if (match) {
      try {
        return parseFloat(match[0].replace(',', '.'));
      } catch {
        continue;
      }
    }
  }
  return undefined;
}

/**
 * Extrai longitude (coordenada negativa para Londrina)
 */
function extractLongitude(parts: string[]): number | undefined {
  for (const part of parts) {
    const match = part.match(/-51[.,]\d{4,}/);
    if (match) {
      try {
        return parseFloat(match[0].replace(',', '.'));
      } catch {
        continue;
      }
    }
  }
  return undefined;
}

/**
 * Extrai número do lote
 */
function extractLote(parts: string[]): number | undefined {
  for (const part of parts) {
    const match = part.match(/\b(\d+)\b/);
    if (match) {
      try {
        const value = parseInt(match[1]);
        if (value >= 1 && value <= 999) {
          return value;
        }
      } catch {
        continue;
      }
    }
  }
  return undefined;
}

/**
 * Extrai observações (geralmente no final)
 */
function extractObservacoes(parts: string[]): string | undefined {
  const observacoesParts = [];
  
  for (const part of parts.slice(-3).reverse()) {
    if (!/^-?\d+\.?\d*,?\d*$/.test(part) && part.length > 2) {
      observacoesParts.unshift(part);
    }
  }
  
  return observacoesParts.length > 0 ? observacoesParts.join(' ') : undefined;
}

/**
 * Verifica se área é duplicada
 */
async function checkDuplicate(area: ProcessedArea): Promise<boolean> {
  try {
    // Buscar áreas com mesmo endereço e bairro
    const existingAreas = await storage.searchAreas(
      area.endereco + ' ' + area.bairro,
      'ROCAGEM',
      10
    );
    
    // Verificar se já existe uma área muito similar
    return existingAreas.some(existing => 
      existing.endereco.toLowerCase().includes(area.endereco.toLowerCase()) &&
      existing.bairro.toLowerCase().includes(area.bairro.toLowerCase())
    );
  } catch (error) {
    console.warn('⚠️ Erro ao verificar duplicata:', error);
    return false;
  }
}

/**
 * Importa áreas processadas para o Supabase
 */
async function importAreasToSupabase(areas: ProcessedArea[]): Promise<{
  total: number;
  processed: number;
  imported: number;
  errors: number;
  skipped: number;
  errors_detail: string[];
}> {
  const result = {
    total: areas.length,
    processed: 0,
    imported: 0,
    errors: 0,
    skipped: 0,
    errors_detail: [] as string[]
  };
  
  console.log(`🚀 Importando ${areas.length} áreas para Supabase...`);
  
  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    
    try {
      // Converter para formato do Supabase
      const supabaseData = convertToSupabaseFormat(area);
      
      // Verificar duplicata
      const isDuplicate = await checkDuplicate(supabaseData);
      if (isDuplicate) {
        result.skipped++;
        continue;
      }
      
      // Inserir no banco de dados usando storage
      const newArea = await storage.createArea(supabaseData);
      
      result.imported++;
      result.processed++;
      
      // Log da importação
      await logImport(area, newArea?.id, 'success');
      
    } catch (error) {
      result.errors++;
      const errorMsg = `Área ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      result.errors_detail.push(errorMsg);
      
      await logImport(area, null, 'error', errorMsg);
      console.error(`❌ Erro ao importar área ${i + 1}:`, error);
    }
  }
  
  console.log(`✅ Importação concluída: ${result.imported} importadas, ${result.skipped} puladas, ${result.errors} erros`);
  
  return result;
}

/**
 * Converte área para formato do Supabase
 */
function convertToSupabaseFormat(area: ProcessedArea): any {
  // Mapear tipo_item para service_type
  const serviceTypeMap: Record<string, string> = {
    'area publica': 'ROCAGEM',
    'praça': 'MANUTENCAO_PRAÇA',
    'canteiros': 'ROCAGEM_CANTEIROS',
    'viela': 'ROCAGEM_VIELA',
    'lote público': 'ROCAGEM_LOTE',
    'lotes': 'ROCAGEM_LOTES',
    'fundo de vale': 'ROCAGEM_FUNDO_VALE'
  };
  
  const serviceType = serviceTypeMap[area.tipo_item.toLowerCase()] || 'ROCAGEM';
  
  // Criar coordenadas GeoJSON se disponíveis
  let coordinates = null;
  if (area.latitude && area.longitude) {
    const delta = 0.0001; // ~10 metros
    coordinates = {
      type: "Polygon",
      coordinates: [[
        [area.longitude - delta, area.latitude - delta],
        [area.longitude + delta, area.latitude - delta],
        [area.longitude + delta, area.latitude + delta],
        [area.longitude - delta, area.latitude + delta],
        [area.longitude - delta, area.latitude - delta]
      ]]
    };
  }
  
  return {
    name: `${area.tipo_item.title()} - ${area.endereco}`,
    description: `Área de roçagem: ${area.endereco}`,
    coordinates: coordinates,
    service_type: serviceType,
    priority: 'MEDIA',
    status: 'PENDENTE',
    estimated_duration: estimateDuration(area.metragem_m2),
    cost_estimate: estimateCost(area.metragem_m2),
    notes: area.observacoes || `Metragem: ${area.metragem_m2.toLocaleString('pt-BR')} m², Lote: ${area.lote || 1}`,
    metadata: {
      tipo_item_original: area.tipo_item,
      metragem_m2: area.metragem_m2,
      lote: area.lote,
      latitude_original: area.latitude,
      longitude_original: area.longitude,
      bairro: area.bairro,
      fonte: 'OCR_IMPORT',
      data_importacao: new Date().toISOString()
    }
  };
}



/**
 * Estima duração baseado na metragem
 */
function estimateDuration(metragem_m2: number): number {
  // Estimativa: 30 minutos por 1000 m² + tempo base de 60 minutos
  const tempoBase = 60;
  const tempoPorMetragem = (metragem_m2 / 1000) * 30;
  return Math.round(tempoBase + tempoPorMetragem);
}

/**
 * Estima custo baseado na metragem
 */
function estimateCost(metragem_m2: number): number {
  // Estimativa: R$ 0,50 por m² para roçagem
  return Math.round(metragem_m2 * 0.5 * 100) / 100;
}

/**
 * Registra log da importação
 */
async function logImport(area: ProcessedArea, areaId: string | number | null, status: 'success' | 'error', error?: string) {
  try {
    // Log simples no console por enquanto
    console.log(`[IMPORT_LOG] Área: ${area.endereco}, Status: ${status}, ID: ${areaId}, Erro: ${error || 'Nenhum'}`);
  } catch (logError) {
    console.warn('⚠️  Erro ao registrar log:', logError);
  }
}

/**
 * Serve página HTML do OCR Import
 */
ocrImportRouter.get('/ocr-import', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Importação OCR - Zeladoria Londrina</title>
    <meta http-equiv="refresh" content="0; url=/">
    <script>
        // Redirecionar para a aplicação React principal
        window.location.href = '/';
    </script>
</head>
<body>
    <p>Redirecionando para a aplicação principal...</p>
</body>
</html>
  `);
});

export default ocrImportRouter;