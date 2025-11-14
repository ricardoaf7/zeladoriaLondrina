import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let areas = [];

app.post('/api/import-batch', (req, res) => {
  console.log('📦 Dados recebidos:', req.body.data?.length || 0, 'itens');
  
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.json({ success: false, error: 'Dados inválidos' });
  }
  
  let imported = 0;
  let errors = 0;
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    try {
      // Criar área simples
      const area = {
        id: areas.length + 1,
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
      
      areas.push(area);
      imported++;
      
      if (i < 3) { // Log primeiros 3 itens
        console.log(`✅ Item ${i+1}: ID=${item.id}, Endereco=${item.endereco}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro item ${i+1}:`, error.message);
      errors++;
    }
  }
  
  console.log(`🎯 RESULTADO: ${imported} importados, ${errors} erros`);
  
  res.json({ 
    success: true, 
    imported,
    updated: 0,
    errors,
    total: data.length,
    message: `Importados ${imported} de ${data.length} itens`
  });
});

app.get('/api/areas', (req, res) => {
  res.json(areas);
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando em http://localhost:${PORT}`);
});