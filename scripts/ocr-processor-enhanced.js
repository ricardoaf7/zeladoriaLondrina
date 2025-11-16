/**
 * OCR Processor Enhanced - Áreas de Roçagem Londrina
 * Versão melhorada com lógica mais inteligente para parsing de dados
 */

// Dados OCR extraídos da imagem fornecida
const ocrText = `tipo_item endereco bairro metrogem_m2 latitude longitude lote observações
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
fundo de vale r. angelo vicentini (da maria i. v. teodoro até av. lucia h.g. viana) santa monica 7.195,78 -23,2866857 -51,1586495 1`;

/**
 * Classe para processar dados OCR de roçagem - Versão Melhorada
 */
class OCRProcessorEnhanced {
  constructor() {
    this.validationErrors = [];
    this.processedCount = 0;
    this.skippedCount = 0;
    
    // Definições de tipos conhecidos
    this.knownTypes = [
      'area publica', 'praça', 'canteiros', 'viela', 
      'lote público', 'lotes', 'fundo de vale'
    ];
    
    // Bairros conhecidos de Londrina
    this.knownBairros = [
      'casoni', 'paraná', 'matarazzo', 'kase', 'são caetano', 
      'portuguesa', 'recreio', 'santa monica'
    ];
    
    // Indicadores de endereço
    this.addressIndicators = [
      'rua', 'av ', 'avenida', 'praça', 'travessa', 'alameda', 'c/'
    ];
  }

  processOCRData(ocrText) {
    console.log("🔍 Processando dados OCR com lógica melhorada...");
    
    // Limpar e normalizar texto
    const cleanedText = this.cleanOCRText(ocrText);
    
    // Extrair linhas de dados
    const dataLines = this.extractDataLines(cleanedText);
    
    console.log(`📄 Encontradas ${dataLines.length} linhas de dados`);
    
    const areas = [];
    for (let i = 0; i < dataLines.length; i++) {
      try {
        const area = this.parseEnhancedLine(dataLines[i], i + 1);
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
    const hasType = this.knownTypes.some(itemType => 
      line.toLowerCase().includes(itemType)
    );
    
    // Deve conter números (metragem, lote, coordenadas)
    const hasNumbers = /\d+/.test(line);
    
    return hasType && hasNumbers;
  }

  parseEnhancedLine(line, lineNumber) {
    // Usar lógica inteligente para identificar campos
    const fields = this.smartFieldExtraction(line);
    
    if (!fields || Object.keys(fields).length < 4) {
      console.warn(`⚠️  Linha ${lineNumber}: Não foi possível extrair campos suficientes`);
      return null;
    }
    
    // Validar campos obrigatórios
    if (!fields.tipo_item || !fields.endereco) {
      console.warn(`⚠️  Linha ${lineNumber}: Campos obrigatórios faltando`);
      return null;
    }
    
    // Criar objeto de área
    return {
      tipo_item: fields.tipo_item,
      endereco: fields.endereco,
      bairro: fields.bairro || "Não especificado",
      metragem_m2: fields.metragem_m2 || 0.0,
      latitude: fields.latitude,
      longitude: fields.longitude,
      lote: fields.lote || 1,
      observacoes: fields.observacoes,
      coordenadas: fields.latitude && fields.longitude ? {
        latitude: fields.latitude,
        longitude: fields.longitude
      } : null
    };
  }

  smartFieldExtraction(line) {
    const fields = {};
    
    // Extrair tipo_item primeiro (sempre no início)
    fields.tipo_item = this.extractTipoItemSmart(line);
    if (!fields.tipo_item) return null;
    
    // Remover tipo_item da linha para processar o resto
    let remainingLine = line.substring(fields.tipo_item.length).trim();
    
    // Extrair coordenadas (latitude e longitude)
    const coords = this.extractCoordinates(remainingLine);
    fields.latitude = coords.latitude;
    fields.longitude = coords.longitude;
    
    // Extrair metragem
    fields.metragem_m2 = this.extractMetragemSmart(remainingLine);
    
    // Extrair lote
    fields.lote = this.extractLoteSmart(remainingLine);
    
    // Extrair bairro
    fields.bairro = this.extractBairroSmart(remainingLine);
    
    // Extrair endereço (tudo entre tipo_item e bairro/coordenadas)
    fields.endereco = this.extractEnderecoSmart(remainingLine, fields);
    
    // Extrair observações (o que sobrou no final)
    fields.observacoes = this.extractObservacoesSmart(remainingLine, fields);
    
    return fields;
  }

  extractTipoItemSmart(line) {
    for (const type of this.knownTypes) {
      if (line.toLowerCase().startsWith(type)) {
        return type;
      }
    }
    return null;
  }

  extractCoordinates(line) {
    const latMatch = line.match(/-23[.,]\d{4,}/);
    const lngMatch = line.match(/-51[.,]\d{4,}/);
    
    return {
      latitude: latMatch ? parseFloat(latMatch[0].replace(/,/g, '.')) : null,
      longitude: lngMatch ? parseFloat(lngMatch[0].replace(/,/g, '.')) : null
    };
  }

  extractMetragemSmart(line) {
    // Procurar por números grandes (metragem) antes das coordenadas
    const matches = line.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/g);
    
    if (!matches) return null;
    
    for (const match of matches) {
      try {
        const value = parseFloat(match.replace(/\./g, '').replace(/,/g, '.'));
        if (value >= 10 && value <= 100000) { // Metragem razoável
          return value;
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  extractLoteSmart(line) {
    // Procurar por números pequenos no final (lote)
    const words = line.split(/\s+/);
    
    for (let i = words.length - 1; i >= Math.max(0, words.length - 3); i--) {
      const word = words[i];
      const match = word.match(/^(\d+)$/);
      if (match) {
        const value = parseInt(match[1]);
        if (value >= 1 && value <= 999) {
          return value;
        }
      }
    }
    
    return null;
  }

  extractBairroSmart(line) {
    // Procurar bairros conhecidos na linha
    for (const bairro of this.knownBairros) {
      if (line.toLowerCase().includes(bairro)) {
        return bairro;
      }
    }
    
    return null;
  }

  extractEnderecoSmart(remainingLine, fields) {
    // Remover coordenadas, metragem e lote da linha
    let cleanLine = remainingLine;
    
    // Remover coordenadas
    if (fields.latitude && fields.longitude) {
      cleanLine = cleanLine.replace(/-23[.,]\d{4,}/g, '');
      cleanLine = cleanLine.replace(/-51[.,]\d{4,}/g, '');
    }
    
    // Remover metragem
    if (fields.metragem_m2) {
      const metragemStr = fields.metragem_m2.toLocaleString('pt-BR', {minimumFractionDigits: 2});
      cleanLine = cleanLine.replace(metragemStr.replace('.', '\\.'), '');
    }
    
    // Remover lote
    if (fields.lote) {
      cleanLine = cleanLine.replace(new RegExp(`\\b${fields.lote}\\b`), '');
    }
    
    // Remover bairro
    if (fields.bairro) {
      cleanLine = cleanLine.replace(new RegExp(fields.bairro, 'gi'), '');
    }
    
    // Limpar e retornar
    cleanLine = cleanLine.replace(/\s{2,}/g, ' ').trim();
    
    // Se ficou muito curto, tentar extrair entre tipo_item e bairro
    if (cleanLine.length < 10 && fields.bairro) {
      const bairroIndex = remainingLine.toLowerCase().indexOf(fields.bairro.toLowerCase());
      if (bairroIndex > 0) {
        cleanLine = remainingLine.substring(0, bairroIndex).trim();
      }
    }
    
    return cleanLine || "Endereço não especificado";
  }

  extractObservacoesSmart(remainingLine, fields) {
    // Pegar o que sobrou no final após remover tudo
    let observacoes = remainingLine;
    
    // Se já temos tudo extraído e sobrou algo, é observação
    if (observacoes.trim().length > 5) {
      return observacoes.trim();
    }
    
    return null;
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
function testEnhancedOCRProcessing() {
  console.log("🧪 Iniciando teste de processamento OCR melhorado...");
  console.log("=".repeat(60));
  
  // Criar processor
  const processor = new OCRProcessorEnhanced();
  
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
    console.log(`\n${tipo.charAt(0).toUpperCase() + tipo.slice(1)}:`);
    console.log(`   • Quantidade: ${stats.count}`);
    console.log(`   • Metragem total: ${stats.total_metragem.toLocaleString('pt-BR', {minimumFractionDigits: 2})} m²`);
    console.log(`   • Média por área: ${(stats.total_metragem/stats.count).toLocaleString('pt-BR', {minimumFractionDigits: 2})} m²`);
    console.log(`   • Com coordenadas: ${stats.coordenadas_disponiveis}/${stats.count} (${(stats.coordenadas_disponiveis/stats.count*100).toFixed(1)}%)`);
  }
  
  // Preparar dados para exportação
  console.log(`\n💾 Preparando exportação de dados...`);
  
  // Converter para dicionários
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
  
  console.log(`✅ Dados processados e prontos para exportação!`);
  console.log(`📊 Total de áreas processadas: ${areas.length}`);
  console.log(`📍 Áreas com coordenadas: ${areas.filter(a => a.latitude && a.longitude).length}`);
  console.log(`📏 Metragem total: ${areas.reduce((sum, area) => sum + area.metragem_m2, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})} m²`);
  
  return {
    areas: areasDict,
    summary: summary,
    tipoStats: tipoStats
  };
}

// Executar teste
console.log("🧪 Iniciando teste de processamento OCR melhorado...");
console.log("=".repeat(60));

try {
  const result = testEnhancedOCRProcessing();
  
  console.log("\n🎉 Teste concluído com sucesso!");
  console.log("📊 Resultados disponíveis para importação no Supabase");
  
} catch (error) {
  console.error("❌ Erro durante o teste:", error);
}

console.log("\n✨ Teste concluído! Verifique os resultados acima.");