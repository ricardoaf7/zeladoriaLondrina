/**
 * Teste da API OCR - Áreas de Roçagem
 * Script para testar o endpoint de processamento OCR
 */

const testOCRData = `tipo_item endereco bairro metragem_m2 latitude longitude lote observações
area publica av. jorge casoni - terminal rodoviario casoni 29.184,98 -23,3044206 -51,1531729 1
praça rua carijós c arruana paraná 2.332,83 -23,3043262 -51,1080607 1
praça jorge casoni c/ guaicurus matarazzo 244,25 -23,304 -51,108 1
area publica caetes c/ tembes (praça/ laterais ao lado praça) matarazzo 680,00 -23,305 -51,109 1
canteiros av jorge casoni (alça lateral esquina rua guaranis ) casoni 452,16 -23,3028976 -51,1494082 1
area publica rua tapuias c/ oswaldo cruz casoni 500,00 -23,2959873 -51,1545458 1`;

async function testOCRAPI() {
  console.log("🧪 Testando API OCR de roçagem...");
  console.log("=".repeat(50));
  
  try {
    const response = await fetch('http://localhost:5000/api/ocr/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ocrText: testOCRData,
        validateOnly: true
      })
    });

    const result = await response.json();
    
    console.log("📊 Resultado do teste:");
    console.log(`Status: ${response.status}`);
    console.log(`Sucesso: ${result.success}`);
    
    if (result.success) {
      console.log(`\n✅ Áreas encontradas: ${result.data.areas?.length || 0}`);
      
      if (result.data.areas && result.data.areas.length > 0) {
        console.log("\n📋 Primeiras 3 áreas:");
        result.data.areas.slice(0, 3).forEach((area, index) => {
          console.log(`${index + 1}. ${area.tipo_item} - ${area.endereco}`);
          console.log(`   📍 ${area.bairro} | 📏 ${area.metragem_m2.toLocaleString('pt-BR')} m²`);
          if (area.latitude && area.longitude) {
            console.log(`   🌍 ${area.latitude}, ${area.longitude}`);
          }
        });
      }
    } else {
      console.log(`❌ Erro: ${result.message}`);
    }
    
  } catch (error) {
    console.error("❌ Erro ao testar API:", error.message);
  }
}

// Testar importação
async function testOCRImport() {
  console.log("\n🚀 Testando importação para Supabase...");
  console.log("=".repeat(50));
  
  try {
    const response = await fetch('http://localhost:5000/api/ocr/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ocrText: testOCRData,
        validateOnly: false // Importar de verdade
      })
    });

    const result = await response.json();
    
    console.log("📊 Resultado da importação:");
    console.log(`Status: ${response.status}`);
    console.log(`Sucesso: ${result.success}`);
    
    if (result.success && result.data) {
      console.log(`\n✅ Importadas: ${result.data.imported} de ${result.data.total}`);
      console.log(`✅ Processadas: ${result.data.processed}`);
      console.log(`⚠️ Puladas: ${result.data.skipped}`);
      console.log(`❌ Erros: ${result.data.errors}`);
      
      if (result.data.errors_detail && result.data.errors_detail.length > 0) {
        console.log("\n📋 Detalhes dos erros:");
        result.data.errors_detail.slice(0, 3).forEach(error => {
          console.log(`   - ${error}`);
        });
      }
    } else {
      console.log(`❌ Erro: ${result.message}`);
    }
    
  } catch (error) {
    console.error("❌ Erro ao testar importação:", error.message);
  }
}

// Executar testes
async function runTests() {
  console.log("🧪 Iniciando testes da API OCR...");
  console.log("📍 Endpoint: http://localhost:5000/api/ocr/process");
  console.log("\n");
  
  await testOCRAPI();
  await testOCRImport();
  
  console.log("\n✅ Testes concluídos!");
  console.log("🌐 Acesse a interface em: http://localhost:5173/ocr-import");
}

// Executar
runTests().catch(console.error);