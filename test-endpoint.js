// Endpoint de teste super simples
  app.post("/api/test-import", async (req, res) => {
    console.log('🧪 TESTE RECEBIDO!');
    console.log('Body:', JSON.stringify(req.body).substring(0, 200));
    
    try {
      const { data } = req.body;
      console.log(`📊 Recebidos ${data?.length || 0} itens`);
      
      if (!data || !Array.isArray(data)) {
        return res.json({ success: false, error: 'Dados inválidos' });
      }
      
      let sucesso = 0;
      let erro = 0;
      
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        try {
          console.log(`Processando item ${i + 1}: ID=${item.id}, Endereco=${item.endereco}`);
          
          // Criar objeto simples
          const areaData = {
            endereco: item.endereco || 'Sem endereço',
            bairro: item.bairro || 'Sem bairro',
            status: item.status || 'Pendente',
            tipo: item.tipo || 'Roçagem',
            metragem_m2: parseFloat(item.metragem_m2) || 0,
            lat: parseFloat(item.lat) || 0,
            lng: parseFloat(item.lng) || 0,
            servico: 'rocagem',
            ativo: true
          };
          
          console.log(`✅ Item ${i + 1} processado com sucesso`);
          sucesso++;
          
        } catch (itemError) {
          console.error(`❌ Erro no item ${i + 1}:`, itemError.message);
          erro++;
        }
      }
      
      console.log(`🎯 RESULTADO: ${sucesso} sucessos, ${erro} erros`);
      
      res.json({ 
        success: true, 
        imported: sucesso,
        updated: 0,
        errors: erro,
        total: data.length,
        message: 'Teste concluído!'
      });
      
    } catch (error) {
      console.error('💥 ERRO GERAL:', error);
      res.json({ 
        success: false, 
        error: error.message 
      });
    }
  });