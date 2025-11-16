/**
 * Teste de Processamento OCR - Áreas de Roçagem Londrina
 * Script para testar o processamento dos dados OCR fornecidos
 */

// Dados OCR extraídos da imagem fornecida
const ocrText = `
tipo_item endereco bairro metrogem_m2 latitude longitude lote observações
area publica av. jorge casoni - terminal rodoviario casoni 29.184,98 -23,3044206 -51,1531729 1
praça rua carijós c arruana paraná 2.332,83 -23,3043262 -51,1080607 1
praça jorge casoni c/ guaicurus matarazzo 244,25 -23,304 -51,108 1
area publica caetes c/ tembes (praça/ laterais ao lado praça) matarazzo 680,00 -23,305 -51,109 1
canteiros av jorge casoni (alça lateral esquina rua guaranis ) casoni 452,16 -23,3028976 -51,1494082 1
area publica rua tupiniquins (lados praça) casoni 150 -23,295 -51,154 1
area publica rua tapuias c/ oswaldo cruz casoni 500,00 -23,2959873 -51,1545458 1
area publica jorge casoni c/ camocan e alexandre albertini (2 areas) kase 722,44 -23,2949574 -51,1471296 1
viela jorge casoni (da casoni até saturnino de brito e rua sampaio vidal) casoni 908,80 -23,303 -51,149 1
praça vital brasil c oswaldo cruz kase 2.434,69 -23,296 -51,155 1
lote público icós são caetano 438,56 -23,297 -51,155 1
lote público tembés portuguesa 348 -23,3023949 -51,154633 1
praça tietê c john kennedy recreio 1.915,41 -23,2953414 -51,1589755 1
praça tietê c duque de caxias 2 praças recreio 2.457,00 -23,296 -51,159 1
area publica av. duque de caxias c/ r. caetano munhoz da rocha recreio 411,75 -23,3154575 -51,1551798 1
lotes irma bona dose c angelo vicentini santa monica 3.870,42 -23,2868047 -51,158213 1
fundo de vale r. angelo vicentini (da maria i. v. teodoro até av. lucia h.g. viana) santa monica 7.195,78 -23,2866857 -51,1586495 1
`;

/**
 * Classe para processar dados OCR de roçagem
 */
class OCRDataProcessor {
  constructor() {
    this.validationErrors = [];
    this.processedCount = 0;
    this.skippedCount = 0;
  }

  processOCRData(ocrText) {
    console.log("🔍 Processando dados OCR...");
    
    // Limpar e normalizar texto
    const cleanedText = this.cleanOCRText(ocrText);
    
    // Extrair linhas de dados
    const dataLines = this.extractDataLines(cleanedText);
    
    console.log(`📄 Encontradas ${dataLines.length} linhas de dados`);
    
    const areas = [];
    for (let i = 0; i < dataLines.length; i++) {
      try {
        const area = this.parseLine(dataLines[i], i + 1);
        if (area) {
          areas.push(area);
          this.processedCount++;
        } else {
          this.skippedCount++;
        }
      } catch (error) {
        console.warn(`⚠️  Erro ao processar linha ${i + 1}:`, error.message);
        this.validationErrors.push(`Linha ${i + 1}: ${error.message}`);
        this.skippedCount++;
      }
    }
    
    console.log(`✅ Processadas: ${this.processedCount} | Puladas: ${this.skippedCount}`);
    
    if (this.validationErrors.length > 0) {
      console.log(`⚠️  ${this.validationErrors.length} erros de validação encontrados`);
    }
    
    return areas;
  }

  cleanOCRText(text) {
    // Remover espaços extras e quebras de linha duplicadas
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/[ \t]+/g, ' ');
    
    // Corrigir caracteres comuns de OCR
    const corrections = {
      '¤': 'o', '®': 'o', '©': 'c', '°': 'o', '¬': 'l',
      '¢': 'c', '£': 'L', '§': 's', '†': 't', '‡': 't',
      '•': '-', '…': '...', '„': '"', '“': '"', '”': '"',
      '‘': "'", '’': "'",
    };
    
    for (const [wrong, correct] of Object.entries(corrections)) {
      text = text.replace(new RegExp(wrong, 'g'), correct);
    }
    
    return text.trim();
  }

  extractDataLines(text) {
    const lines = text.split('\n');
    const dataLines = [];
    
    // Pular cabeçalho (primeira linha com nomes das colunas)
    let startProcessing = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!startProcessing) {
        // Verificar se é linha de cabeçalho
        if (trimmedLine.toLowerCase().includes('tipo_item') || 
            trimmedLine.toLowerCase().includes('endereco')) {
          startProcessing = true;
          continue;
        }
      }
      
      // Processar linhas de dados
      if (startProcessing && trimmedLine) {
        if (this.isDataLine(trimmedLine)) {
          dataLines.push(trimmedLine);
        }
      }
    }
    
    return dataLines;
  }

  isDataLine(line) {
    // Deve conter pelo menos tipo_item e endereco
    const hasType = ['area publica', 'praça', 'canteiros', 'viela', 'lote público', 'lotes', 'fundo de vale']
      .some(itemType => line.toLowerCase().includes(itemType));
    
    // Deve conter números (metragem, lote, coordenadas)
    const hasNumbers = /\d+/.test(line);
    
    return hasType && hasNumbers;
  }

  parseLine(line, lineNumber) {
    // Tentar dividir por espaços e identificar campos
    const parts = this.splitLineIntoFields(line);
    
    if (parts.length < 5) { // Mínimo de campos necessários
      console.warn(`⚠️  Linha ${lineNumber}: Poucos campos detectados (${parts.length})`);
      return null;
    }
    
    // Extrair campos
    const tipo_item = this.extractTipoItem(parts);
    const endereco = this.extractEndereco(parts);
    const bairro = this.extractBairro(parts);
    const metragem_m2 = this.extractMetragem(parts);
    const latitude = this.extractLatitude(parts);
    const longitude = this.extractLongitude(parts);
    const lote = this.extractLote(parts);
    const observacoes = this.extractObservacoes(parts);
    
    // Validar campos obrigatórios
    if (!tipo_item || !endereco) {
      console.warn(`⚠️  Linha ${lineNumber}: Campos obrigatórios faltando`);
      return null;
    }
    
    // Criar coordenadas GeoJSON se latitude/longitude disponíveis
    const coordenadas = latitude && longitude ? {
      latitude: latitude,
      longitude: longitude
    } : null;
    
    return {
      tipo_item: tipo_item,
      endereco: endereco,
      bairro: bairro || "Não especificado",
      metragem_m2: metragem_m2 || 0.0,
      latitude: latitude,
      longitude: longitude,
      lote: lote || 1,
      observacoes: observacoes,
      coordenadas: coordenadas
    };
  }

  splitLineIntoFields(line) {
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

  extractTipoItem(parts) {
    for (const part of parts.slice(0, 3)) { // Procurar nos 3 primeiros campos
      const partLower = part.toLowerCase();
      if (['area publica', 'praça', 'canteiros', 'viela', 'lote público', 'lotes', 'fundo de vale'].some(type => partLower.includes(type))) {
        return part.trim();
      }
    }
    return parts[0]?.trim() || "area publica";
  }

  extractEndereco(parts) {
    for (const part of parts.slice(1, 4)) { // Procurar nos campos 2-4
      const partLower = part.toLowerCase();
      if (['rua', 'av ', 'avenida', 'praça', 'travessa', 'alameda'].some(street => partLower.includes(street))) {
        return part.trim();
      }
    }
    return parts[1]?.trim() || "";
  }

  extractBairro(parts) {
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

  extractMetragem(parts) {
    for (const part of parts) {
      // Procurar por números no formato brasileiro (ponto como milhar, vírgula como decimal)
      const match = part.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/);
      if (match) {
        try {
          const numberStr = match[1];
          // Converter formato brasileiro para float
          // Remover pontos de milhar e substituir vírgula por ponto
          const normalized = numberStr.replace(/\./g, '').replace(/,/g, '.');
          const value = parseFloat(normalized);
          // Validar que é um valor razoável para metragem
          if (1 <= value && value <= 100000) {
            return value;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return null;
  }

  extractLatitude(parts) {
    for (const part of parts) {
      // Procurar por coordenadas no formato -23,XXXXX
      const match = part.match(/-23[.,]\d{4,}/);
      if (match) {
        try {
          const coordStr = match[0].replace(/,/g, '.');
          return parseFloat(coordStr);
        } catch (error) {
          continue;
        }
      }
    }
    
    return null;
  }

  extractLongitude(parts) {
    for (const part of parts) {
      // Procurar por coordenadas no formato -51,XXXXX
      const match = part.match(/-51[.,]\d{4,}/);
      if (match) {
        try {
          const coordStr = match[0].replace(/,/g, '.');
          return parseFloat(coordStr);
        } catch (error) {
          continue;
        }
      }
    }
    
    return null;
  }

  extractLote(parts) {
    for (const part of parts) {
      // Procurar por número inteiro que possa ser lote
      const match = part.match(/\b(\d+)\b/);
      if (match) {
        try {
          const value = parseInt(match[1]);
          // Validar que é um número de lote razoável
          if (1 <= value && value <= 999) {
            return value;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return null;
  }

  extractObservacoes(parts) {
    // Pegar últimos campos que não sejam números ou coordenadas
    const observacoesParts = [];
    
    for (const part of parts.slice(-3).reverse()) {
      if (!/^-?\d+\.?\d*,?\d*$/.test(part) && part.length > 2) {
        observacoesParts.unshift(part);
      }
    }
    
    return observacoesParts.length > 0 ? observacoesParts.join(' ') : null;
  }

  getProcessingSummary() {
    return {
      total_processado: this.processedCount,
      total_pulado: this.skippedCount,
      total_erros: this.validationErrors.length,
      erros: this.validationErrors,
      taxa_sucesso: Math.round((this.processedCount / Math.max(1, this.processedCount + this.skippedCount)) * 100 * 100) / 100
    };
  }
}

// Função principal para teste
function testOCRProcessing() {
  console.log("🧪 Iniciando teste de processamento OCR...");
  console.log("=" * 60);
  
  // Criar processor
  const processor = new OCRDataProcessor();
  
  // Processar dados OCR
  console.log("📊 Processando dados OCR...");
  const areas = processor.processOCRData(ocrText);
  
  console.log(`\n✅ Processamento concluído!`);
  console.log(`📈 Total de áreas processadas: ${areas.length}`);
  
  // Mostrar resumo
  const summary = processor.getProcessingSummary();
  console.log(`\n📋 Resumo do processamento:`);
  console.log(`   • Processadas: ${summary.total_processado}`);
  console.log(`   • Puladas: ${summary.total_pulado}`);
  console.log(`   • Erros: ${summary.total_erros}`);
  console.log(`   • Taxa de sucesso: ${summary.taxa_sucesso}%`);
  
  if (summary.total_erros > 0) {
    console.log(`\n⚠️  Erros encontrados:`);
    for (const error of summary.erros.slice(0, 5)) { // Mostrar primeiros 5 erros
      console.log(`   - ${error}`);
    }
    if (summary.erros.length > 5) {
      console.log(`   ... e mais ${summary.erros.length - 5} erros`);
    }
  }
  
  // Mostrar detalhes das áreas
  console.log(`\n🗺️  Detalhes das áreas encontradas:`);
  console.log("-".repeat(80));
  
  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    console.log(`\n${(i + 1).toString().padStart(2)}. ${area.tipo_item.toUpperCase()} - ${area.endereco}`);
    console.log(`    📍 Bairro: ${area.bairro}`);
    console.log(`    📏 Metragem: ${area.metragem_m2.toLocaleString('pt-BR', {minimumFractionDigits: 2})} m²`);
    
    if (area.latitude && area.longitude) {
      console.log(`    🌍 Coordenadas: ${area.latitude.toFixed(6)}, ${area.longitude.toFixed(6)}`);
    } else {
      console.log(`    ⚠️  Coordenadas: Não disponíveis`);
    }
    
    console.log(`    📋 Lote: ${area.lote}`);
    
    if (area.observacoes) {
      console.log(`    📝 Observações: ${area.observacoes}`);
    }
    
    if (area.coordenadas) {
      console.log(`    📍 GeoJSON: Disponível`);
    }
  }
  
  // Estatísticas por tipo
  console.log(`\n📊 Estatísticas por tipo de item:`);
  console.log("-".repeat(40));
  
  const tipoStats = {};
  for (const area of areas) {
    const tipo = area.tipo_item;
    if (!tipoStats[tipo]) {
      tipoStats[tipo] = {
        count: 0,
        total_metragem: 0,
        coordenadas_disponiveis: 0
      };
    }
    
    tipoStats[tipo].count++;
    tipoStats[tipo].total_metragem += area.metragem_m2;
    if (area.latitude && area.longitude) {
      tipoStats[tipo].coordenadas_disponiveis++;
    }
  }
  
  for (const [tipo, stats] of Object.entries(tipoStats)) {
    console.log(`\n${tipo.title()}:`);
    console.log(`   • Quantidade: ${stats.count}`);
    console.log(`   • Metragem total: ${stats.total_metragem.toLocaleString('pt-BR', {minimumFractionDigits: 2})} m²`);
    console.log(`   • Média por área: ${(stats.total_metragem/stats.count).toLocaleString('pt-BR', {minimumFractionDigits: 2})} m²`);
    console.log(`   • Com coordenadas: ${stats.coordenadas_disponiveis}/${stats.count} (${(stats.coordenadas_disponiveis/stats.count*100).toFixed(1)}%)`);
  }
  
  // Preparar dados para exportação
  console.log(`\n💾 Preparando exportação de dados...`);
  
  const areasDict = areas.map(area => ({
    tipo_item: area.tipo_item,
    endereco: area.endereco,
    bairro: area.bairro,
    metragem_m2: area.metragem_m2,
    latitude: area.latitude,
    longitude: area.longitude,
    lote: area.lote,
    observacoes: area.observacoes,
    coordenadas: area.coordenadas
  }));
  
  // Criar CSV para visualização
  const csvData = areas.map(area => ({
    tipo_item: area.tipo_item,
    endereco: area.endereco,
    bairro: area.bairro,
    metragem_m2: area.metragem_m2,
    latitude: area.latitude || '',
    longitude: area.longitude || '',
    lote: area.lote,
    observacoes: area.observacoes || ''
  }));
  
  console.log(`✅ Dados processados e prontos para exportação!`);
  
  // Retornar dados para uso posterior
  return {
    areas: areasDict,
    csvData: csvData,
    summary: summary,
    tipoStats: tipoStats
  };
}

// Executar teste
console.log("🧪 Iniciando teste de processamento OCR...");
console.log("=".repeat(60));

try {
  const result = testOCRProcessing();
  
  console.log("\n🎉 Teste concluído com sucesso!");
  console.log("📊 Resultados disponíveis para importação no Supabase");
  
  // Simular importação (em produção, usar API real)
  console.log("\n🚀 Simulação de importação para Supabase:");
  console.log(`   • Total de áreas para importar: ${result.areas.length}`);
  console.log(`   • Áreas com coordenadas: ${result.areas.filter(a => a.latitude && a.longitude).length}`);
  console.log(`   • Áreas sem coordenadas: ${result.areas.filter(a => !a.latitude || !a.longitude).length}`);
  
} catch (error) {
  console.error("❌ Erro durante o teste:", error);
}

console.log("\n✨ Teste concluído! Verifique os resultados acima.");