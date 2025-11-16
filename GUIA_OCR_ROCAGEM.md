# 📸 Sistema OCR para Importação de Áreas de Roçagem

## 🎯 **OBJETIVO**
Sistema completo para importar áreas de roçagem a partir de imagens de planilhas usando OCR (Reconhecimento Óptico de Caracteres).

---

## 🚀 **COMO FUNCIONA**

### **1. Processo de Importação**
```
Imagem da Planilha → OCR → Processamento → Validação → Supabase
```

### **2. Campos Suportados**
| Campo OCR | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `tipo_item` | Texto | ✅ | Tipo de área: área pública, praça, canteiros, viela, lote público, lotes, fundo de vale |
| `endereco` | Texto | ✅ | Endereço completo da área |
| `bairro` | Texto | ❌ | Nome do bairro |
| `metragem_m2` | Número | ✅ | Metragem da área em m² |
| `latitude` | Número | ❌ | Coordenada latitude (formato -23,XXXXXX) |
| `longitude` | Número | ❌ | Coordenada longitude (formato -51,XXXXXX) |
| `lote` | Número | ❌ | Número do lote (padrão: 1) |
| `observacoes` | Texto | ❌ | Observações adicionais |

---

## 📋 **PASSO A PASSO PARA IMPORTAR**

### **Passo 1: Preparar as Imagens**
✅ **Formatos aceitos:** JPG, PNG, PDF  
✅ **Qualidade recomendada:** Mínimo 300 DPI  
✅ **Tamanho máximo:** 10MB por arquivo  
✅ **Limite:** 10 arquivos por importação  

### **Passo 2: Acessar o Sistema**
1. Acesse: `https://zeladoria-londrina.vercel.app/ocr-import`
2. Clique em **"Importar OCR"** no menu lateral

### **Passo 3: Enviar Imagens**
#### **Opção A: Upload de Arquivos**
```
📁 Arraste e solte as imagens na área indicada
📁 Ou clique para selecionar arquivos
```

#### **Opção B: Texto OCR Manual**
```
📄 Cole o texto extraído do OCR diretamente
📄 Útil quando já tem o texto processado
```

### **Passo 4: Processar Dados**
- O sistema processará automaticamente as imagens
- Extraíra os dados usando inteligência artificial
- Validará coordenadas, formatos e consistência

### **Passo 5: Visualizar e Validar**
- Visualize os dados extraídos antes de importar
- Corrija eventuais erros de reconhecimento
- Confirme que todos os campos estão corretos

### **Passo 6: Importar para Supabase**
- Clique em **"Importar para Supabase"**
- Acompanhe o progresso em tempo real
- Verifique o resumo da importação

---

## 🗺️ **MAPEAMENTO DE DADOS**

### **Conversão de Tipos**
```javascript
// Tipos OCR → Service Types
{
  "area publica": "ROCAGEM",
  "praça": "MANUTENCAO_PRAÇA", 
  "canteiros": "ROCAGEM_CANTEIROS",
  "viela": "ROCAGEM_VIELA",
  "lote público": "ROCAGEM_LOTE",
  "lotes": "ROCAGEM_LOTES",
  "fundo de vale": "ROCAGEM_FUNDO_VALE"
}
```

### **Cálculos Automáticos**
```javascript
// Duração estimada (minutos)
duration = 60 + (metragem_m2 / 1000) * 30

// Custo estimado (R$)
cost = metragem_m2 * 0.50

// Coordenadas GeoJSON
if (latitude && longitude) {
  coordinates = {
    "type": "Polygon",
    "coordinates": [[...]] // Área de 10m x 10m
  }
}
```

---

## 📊 **EXEMPLOS DE DADOS**

### **Entrada OCR (Texto)**
```
tipo_item endereco bairro metragem_m2 latitude longitude lote observações
area publica av. jorge casoni - terminal rodoviario casoni 29.184,98 -23,3044206 -51,1531729 1
praça rua carijós c arruana paraná 2.332,83 -23,3043262 -51,1080607 1
```

### **Saída Processada (JSON)**
```json
{
  "tipo_item": "area publica",
  "endereco": "av. jorge casoni - terminal rodoviario",
  "bairro": "casoni",
  "metragem_m2": 29184.98,
  "latitude": -23.3044206,
  "longitude": -51.1531729,
  "lote": 1,
  "observacoes": null
}
```

### **Resultado Final (Supabase)**
```json
{
  "name": "Area Publica - Av. Jorge Casoni - Terminal Rodoviario",
  "description": "Área de roçagem: av. jorge casoni - terminal rodoviario",
  "coordinates": { "type": "Polygon", "coordinates": [...] },
  "service_type": "ROCAGEM",
  "priority": "MEDIA",
  "status": "PENDENTE",
  "estimated_duration": 935, // minutos
  "cost_estimate": 14592.49, // R$
  "notes": "Metragem: 29.184,98 m², Lote: 1",
  "bairro": "casoni"
}
```

---

## 🔧 **SOLUÇÃO DE PROBLEMAS**

### **Problema: OCR não reconhece texto**
**Soluções:**
- 📸 Use imagens com maior resolução (mínimo 300 DPI)
- 📄 Converta PDF para imagem antes de enviar
- 🔍 Verifique se o texto não está borrado ou cortado
- ✏️ Use o modo texto manual como alternativa

### **Problema: Coordenadas incorretas**
**Soluções:**
- 📍 Verifique formato: `-23,XXXXXX` e `-51,XXXXXX`
- 🗺️ Confirme que estão dentro de Londrina
- 🔢 Substitua vírgula por ponto se necessário

### **Problema: Metragem não reconhecida**
**Soluções:**
- 💰 Use formato brasileiro: `29.184,98` (ponto milhar, vírgula decimal)
- 📊 Verifique se o número está entre 1 e 100.000 m²
- 🔢 Remova espaços extras ao redor do número

### **Problema: Campos vazios**
**Soluções:**
- ✅ Campos obrigatórios: `tipo_item`, `endereco`, `metragem_m2`
- ❌ Opcionais: `bairro`, `latitude`, `longitude`, `lote`, `observacoes`
- 🔄 O sistema usará valores padrão quando necessário

---

## 📈 **ESTATÍSTICAS E RELATÓRIOS**

### **Métricas de Importação**
- 📊 Total de áreas importadas
- ✅ Taxa de sucesso do OCR
- ⚠️ Áreas com coordenadas vs sem coordenadas
- 📍 Distribuição por bairro e tipo
- 💰 Estimativa de custo total

### **Histórico de Importações**
- 📅 Data e hora de cada importação
- 📁 Arquivos processados
- 📊 Estatísticas detalhadas
- 📝 Log de erros e avisos

---

## 🛡️ **SEGURANÇA E VALIDAÇÃO**

### **Validações Automáticas**
- ✅ **Coordenadas:** Devem estar dentro de Londrina
- ✅ **Metragem:** Entre 1 e 100.000 m²
- ✅ **Lote:** Entre 1 e 999
- ✅ **Endereço:** Deve conter palavras-chave de endereço
- ✅ **Duplicatas:** Evita importação de áreas repetidas

### **Segurança**
- 🔐 Autenticação via Supabase
- 🛡️ Validação de entrada de dados
- 📝 Log completo de operações
- 🔄 Backup automático dos dados

---

## 🧪 **TESTE RÁPIDO**

### **Teste via Interface Web**
1. Acesse: `https://zeladoria-londrina.vercel.app/ocr-import`
2. Cole este texto no campo "Texto Manual":
```
tipo_item endereco bairro metragem_m2 latitude longitude lote
area publica av. jorge casoni - terminal rodoviario casoni 29.184,98 -23,3044206 -51,1531729 1
praça rua carijós c arruana paraná 2.332,83 -23,3043262 -51,1080607 1
```
3. Clique em **"Processar Texto"**
4. Visualize os resultados
5. Clique em **"Importar para Supabase"**

### **Teste via API (Desenvolvedores)**
```bash
curl -X POST http://localhost:5000/api/ocr/process \
  -H "Content-Type: application/json" \
  -d '{
    "ocrText": "area publica av. teste casoni 1000,00 -23,3000000 -51,1500000 1",
    "validateOnly": true
  }'
```

---

## 📞 **SUPORTE**

### **Problemas Técnicos**
- 📧 Email: suporte@londrina.pr.gov.br
- 📱 Telefone: (43) 3371-6000
- 💬 Chat: Disponível no dashboard

### **Documentação Adicional**
- 📖 [Documentação da API](server/routes/ocr-import.ts)
- 🔧 [Código Fonte](client/src/pages/OCRImport.tsx)
- 📊 [Scripts de Processamento](scripts/ocr-processor-enhanced.js)

---

## 🎉 **PARABÉNS!**

Você agora tem um sistema completo para importar áreas de roçagem a partir de imagens de planilhas! 🚀

### **Benefícios do Sistema:**
- ✅ **Economia de tempo:** Importação automática de dados
- ✅ **Precisão:** Validação e normalização inteligente
- ✅ **Escalabilidade:** Processa milhares de áreas rapidamente
- ✅ **Integração:** Direto com o sistema de gestão da CMTU
- ✅ **Histórico:** Controle completo de todas as importações

### **Próximos Passos:**
1. 📸 Prepare suas imagens de planilhas
2. 🌐 Acesse o sistema em produção
3. 📊 Importe os dados de roçagem
4. 🗺️ Visualize as áreas no mapa
5. 📈 Acompanhe o progresso das obras

**Transforme a gestão da roçagem em Londrina com tecnologia de ponta!** 🏙️✨

---

*Sistema OCR para Zeladoria Londrina - Desenvolvido com ❤️ e tecnologia de ponta*