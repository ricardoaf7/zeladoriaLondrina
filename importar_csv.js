import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { supabase } from './client/src/lib/supabase.js';

// Função para corrigir caracteres especiais
function corrigirCaracteres(texto) {
  if (!texto) return texto;
  
  // Substituir caracteres com problemas
  const correcoes = {
    'Ã§': 'ç',
    'Ã£': 'ã',
    'Ã³': 'ó',
    'Ã©': 'é',
    'Ã': 'í',
    'Ã¢': 'â',
    'Ã´': 'ô',
    'Ãª': 'ê',
    'Ã¹': 'ú',
    'Ã¼': 'ü',
    'Ã±': 'ñ',
    'Ã': 'à'
  };
  
  let corrigido = texto;
  for (const [errado, certo] of Object.entries(correcoes)) {
    corrigido = corrigido.replace(new RegExp(errado, 'g'), certo);
  }
  
  return corrigido;
}

// Função para importar dados
async function importarCSV() {
  try {
    console.log('📊 Iniciando importação de CSV...');
    
    // Ler o arquivo CSV
    const csvContent = fs.readFileSync('seu_arquivo.csv', 'utf-8');
    
    // Parsear CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`📋 Encontradas ${records.length} linhas para importar`);
    
    let importadas = 0;
    let erros = 0;
    
    // Processar cada linha
    for (const record of records) {
      try {
        // Corrigir caracteres especiais
        const enderecoCorrigido = corrigirCaracteres(record.endereco);
        const bairroCorrigido = corrigirCaracteres(record.bairro);
        const tipoCorrigido = corrigirCaracteres(record.tipo);
        
        // Preparar dados para inserir
        const areaData = {
          id: parseInt(record.id) || undefined,
          ordem: record.ordem ? parseInt(record.ordem) : null,
          sequencia_cadastro: record.sequencia_cadastro ? parseInt(record.sequencia_cadastro) : null,
          tipo: tipoCorrigido || 'Roçagem',
          endereco: enderecoCorrigido || '',
          bairro: bairroCorrigido || '',
          metragem_m2: record.metragem_m2 ? parseFloat(record.metragem_m2) : null,
          lat: parseFloat(record.lat) || 0,
          lng: parseFloat(record.lng) || 0,
          lote: record.lote ? parseInt(record.lote) : 1,
          status: record.status || 'Pendente',
          history: [],
          polygon: null,
          scheduled_date: record.scheduled_date || null,
          proxima_previsao: record.proxima_previsao || null,
          ultima_rocagem: record.ultima_rocagem || null,
          manual_schedule: record.manual_schedule === 'true',
          days_to_complete: record.days_to_complete ? parseInt(record.days_to_complete) : 1,
          servico: 'rocagem',
          registrado_por: record.registrado_por || 'importacao_csv',
          data_registro: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Inserir no Supabase
        const { data, error } = await supabase
          .from('service_areas')
          .insert([areaData])
          .select();
          
        if (error) {
          console.error(`❌ Erro ao importar linha ${record.id}:`, error.message);
          erros++;
        } else {
          console.log(`✅ Importada: ${enderecoCorrigido}, ${bairroCorrigido}`);
          importadas++;
        }
        
        // Pequena pausa para não sobrecarregar o banco
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`❌ Erro geral na linha ${record.id}:`, err.message);
        erros++;
      }
    }
    
    console.log('\n📈 RESUMO DA IMPORTAÇÃO:');
    console.log(`✅ Importadas com sucesso: ${importadas}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📊 Total processado: ${importadas + erros}`);
    
  } catch (error) {
    console.error('❌ Erro fatal na importação:', error);
  }
}

// Executar importação
importarCSV();