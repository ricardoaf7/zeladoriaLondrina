# ✅ CHECKLIST DE DEPLOY FINAL - ZELADORIA LONDRINA

## 📋 **VERIFICAÇÃO COMPLETA PRÉ-DEPLOY**

*Checklist detalhado para garantir deploy perfeito com todas as funcionalidades*

---

## 🏗️ **1. ESTRUTURA DO PROJETO**

### **1.1 Arquivos Críticos:**
```bash
✅ package.json (principal)
✅ package-lock.json
✅ client/package.json
✅ client/package-lock.json
✅ vercel.json
✅ tsconfig.json
✅ vite.config.ts
✅ tailwind.config.js
✅ .env.example
✅ .gitignore
✅ README.md
```

### **1.2 Pastas Importantes:**
```bash
✅ client/src/ (React/Vite)
✅ server/ (Express/TypeScript)
✅ supabase/migrations/
✅ scripts/
✅ shared/
✅ public/
```

### **1.3 Arquivos de Configuração:**
```bash
✅ vercel-final.json → vercel.json
✅ .env.production.example
✅ deployment.json
✅ build-info.json
```

---

## 🔧 **2. DEPENDÊNCIAS E BUILD**

### **2.1 Instalação de Dependências:**
```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..

# Verificar se todas foram instaladas
npm ls --depth=0
```

### **2.2 Build Local:**
```bash
# Testar build completo
npm run build:prod

# Verificar arquivos gerados
ls -la dist/
ls -la dist/client/
ls -la dist/server/
```

### **2.3 Testes de Build:**
```bash
# Testar servidor buildado
npm run start:prod

# Verificar se está respondendo
curl http://localhost:5000/api/status
```

---

## 🗄️ **3. SUPABASE - BANCO DE DADOS**

### **3.1 Conexão com Supabase:**
```bash
✅ VITE_SUPABASE_URL configurado
✅ VITE_SUPABASE_ANON_KEY configurado
✅ SUPABASE_SERVICE_ROLE configurado (opcional)
```

### **3.2 Migrations Executadas:**
```bash
# Executar todas as migrations
npm run db:migrate

# Verificar tabelas criadas
npm run db:check

# Verificar se tabelas de OCR existem
# - import_logs
# - import_configs  
# - import_history
# - field_mappings
```

### **3.3 Permissões RLS:**
```bash
# Verificar permissões
supabase db dump --schema-only | grep -i "grant\|policy"

# Testar acesso anônimo
supabase rpc test_anonymous_access

# Testar acesso autenticado
supabase rpc test_authenticated_access
```

### **3.4 Dados de Teste:**
```bash
# Executar seed (se disponível)
npm run db:seed

# Verificar se dados foram inseridos
supabase select * from service_areas limit 5
```

---

## 🔐 **4. SEGURANÇA**

### **4.1 Variáveis de Ambiente:**
```bash
✅ JWT_SECRET (mínimo 32 caracteres)
✅ ENCRYPTION_KEY (mínimo 32 caracteres)
✅ NODE_ENV=production
✅ VITE_APP_URL configurado
```

### **4.2 Headers de Segurança:**
```bash
# Testar headers
curl -I http://localhost:5000/api/status

# Verificar se incluem:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
```

### **4.3 Rate Limiting:**
```bash
# Testar limite de requisições
for i in {1..150}; do curl -s http://localhost:5000/api/status > /dev/null; done

# Verificar se bloqueia após limite
```

### **4.4 Validação de Dados:**
```bash
# Testar entrada inválida
curl -X POST http://localhost:5000/api/ocr/process \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Verificar mensagem de erro apropriada
```

---

## 🎯 **5. FUNCIONALIDADES - TESTES POR ÁREA**

### **5.1 Sistema OCR:**
```bash
# Testar processamento OCR
curl -X POST http://localhost:5000/api/ocr/process \
  -H "Content-Type: application/json" \
  -d '{"ocrText":"area publica av. teste casoni 1000,00 -23,3000000 -51,1500000 1","validateOnly":true}'

# Verificar resposta com estrutura correta
# - success: boolean
# - data.areas: array
# - data.total: number
```

### **5.2 Importação de Áreas:**
```bash
# Testar importação completa
curl -X POST http://localhost:5000/api/ocr/areas \
  -H "Content-Type: application/json" \
  -d '{"areas":[{"tipo_item":"area publica","endereco":"av. teste","bairro":"casoni","metragem_m2":1000}]}'

# Verificar se importou corretamente
# - imported: number
# - errors: number
# - skipped: number
```

### **5.3 Dashboard Analytics:**
```bash
# Testar KPIs
curl http://localhost:5000/api/analytics/kpis

# Testar performance do mês
curl "http://localhost:5000/api/analytics/performance?month=2024-11"

# Testar eficiência
curl http://localhost:5000/api/analytics/eficiencia
```

### **5.4 Consulta Pública:**
```bash
# Testar consulta de coleta
curl "http://localhost:5000/api/coleta/consulta?endereco=av. teste"

# Testar com diferentes parâmetros
# - endereco
# - bairro
# - cep
```

### **5.5 Mapa de Performance:**
```bash
# Testar mapa
curl http://localhost:5000/api/map/areas

# Testar clusters
curl http://localhost:5000/api/map/clusters

# Testar heatmap
curl http://localhost:5000/api/map/heatmap
```

### **5.6 Status e Health Checks:**
```bash
# Testar status geral
curl http://localhost:5000/api/status

# Testar health check detalhado
curl http://localhost:5000/api/status/health

# Verificar componentes:
# - database
# - api
# - frontend
# - security
```

---

## 📊 **6. PERFORMANCE E OTIMIZAÇÃO**

### **6.1 Tamanho do Bundle:**
```bash
# Verificar tamanho dos arquivos
ls -lh dist/client/assets/

# Tamanhos recomendados:
# - main.js: < 500KB
# - vendor.js: < 1MB
# - CSS: < 100KB
```

### **6.2 Tempo de Carregamento:**
```bash
# Testar performance local
npm run lighthouse

# Verificar Core Web Vitals:
# - LCP: < 2.5s
# - FID: < 100ms
# - CLS: < 0.1
```

### **6.3 Cache e Compressão:**
```bash
# Verificar headers de cache
curl -I http://localhost:5000/api/status

# Verificar compressão Gzip
curl -H "Accept-Encoding: gzip" -I http://localhost:5000/api/status
```

---

## 🧪 **7. TESTES AUTOMATIZADOS**

### **7.1 Executar Testes:**
```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm run test:ocr
npm run test:dashboard
npm run test:api
```

### **7.2 Testes de Integração:**
```bash
# Testar fluxo completo de importação
npm run test:integration

# Testar fluxo de consulta pública
npm run test:public-consultation
```

---

## 🌐 **8. VERIFICAÇÃO DE URLS**

### **8.1 Rotas Principais:**
```bash
# Testar todas as rotas principais
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/dashboard
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ocr-import
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/consulta-coleta
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/map-performance
```

### **8.2 APIs Rest:**
```bash
# Verificar todas as APIs retornam 200 ou 204
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/status
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/analytics/kpis
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/ocr/templates
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/coleta/consulta
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/map/areas
```

---

## 📱 **9. RESPONSIVIDADE E ACESSIBILIDADE**

### **9.1 Testes Mobile:**
```bash
# Testar em diferentes viewports
npm run test:mobile

# Verificar se interface OCR funciona em mobile
# - Upload de imagens
# - Processamento
# - Visualização de resultados
```

### **9.2 Acessibilidade:**
```bash
# Executar testes de acessibilidade
npm run test:a11y

# Verificar:
# - Contraste de cores
# - Navegação por teclado
# - Leitores de tela
```

---

## 🔍 **10. VERIFICAÇÃO FINAL**

### **10.1 Checklist Completo:**
```bash
# Executar verificação automática
npm run deploy:check

# Verificará:
# ✅ Build completo
# ✅ Banco de dados
# ✅ Segurança
# ✅ Funcionalidades
# ✅ Performance
# ✅ URLs
```

### **10.2 Documentação:**
```bash
✅ README.md atualizado
✅ GUIA_OCR_ROCAGEM.md criado
✅ DEPLOY_FINAL.md criado
✅ CHECKLIST_DEPLOY_FINAL.md criado
✅ TROUBLESHOOTING.md criado
```

---

## 🚨 **11. ALERTAS E CRÍTICOS**

### **11.1 Problemas Críticos (Bloqueiam Deploy):**
```bash
❌ Build falha
❌ Migrations não executam
❌ APIs não respondem
❌ Segurança comprometida
❌ Banco de dados inacessível
```

### **11.2 Problemas Importantes (Devem ser resolvidos):**
```bash
⚠️ Performance ruim (>3s)
⚠️ Bundle muito grande (>2MB)
⚠️ Muitos erros de validação
⚠️ Falta de documentação
⚠️ Testes falhando
```

### **11.3 Melhorias (Podem ser feitas pós-deploy):**
```bash
💡 Otimizações de performance
💡 Melhorias de UX
💡 Funcionalidades adicionais
💡 Documentação extra
💡 Testes adicionais
```

---

## 🎯 **12. COMANDOS ÚTEIS PARA VERIFICAÇÃO**

### **12.1 Verificação Rápida:**
```bash
# Executar tudo de uma vez
npm run deploy:verify

# Ou passo a passo:
npm run build:prod
npm run test:all
npm run security:check
npm run performance:check
npm run deploy:check
```

### **12.2 Comandos Individuais:**
```bash
# Build
npm run build:prod

# Testes
npm test
npm run test:integration

# Segurança
npm run security:check

# Performance
npm run performance:check

# Deploy
npm run deploy:check
npm run deploy:preview
```

---

## 🏆 **13. CONFIRMAÇÃO FINAL**

### **13.1 Assinatura Digital:**
```bash
# Gerar hash do build
sha256sum dist/manifest.json > build-hash.txt

# Verificar integridade
cat build-hash.txt
```

### **13.2 Snapshot Final:**
```bash
# Criar snapshot do estado final
tar -czf deploy-snapshot-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  .
```

---

## 🎉 **14. PRONTO PARA DEPLOY!**

### **14.1 Confirmação:**
```
✅ TODOS OS ITENS VERIFICADOS
✅ TODOS OS TESTES PASSANDO
✅ TODAS AS FUNCIONALIDADES OK
✅ SEGURANÇA APROVADA
✅ PERFORMANCE OTIMIZADA
✅ DOCUMENTAÇÃO COMPLETA

🚀 PROJETO PRONTO PARA DEPLOY EM PRODUÇÃO!
```

### **14.2 Próximo Passo:**
```bash
# Executar deploy final
npm run deploy:prod

# Ou manualmente:
vercel --prod
```

---

## 📞 **15. SUPORTE EMERGÊNCIAL**

### **15.1 Contatos:**
```bash
📧 Suporte Técnico: suporte-tecnico@londrina.pr.gov.br
📱 Telefone: (43) 3371-6000
💬 Chat: Disponível no dashboard
```

### **15.2 Documentação de Emergência:**
```bash
📖 Troubleshooting: TROUBLESHOOTING.md
🔧 Manutenção: MANUTENCAO.md
🚨 Rollback: ROLLBACK.md
```

---

**🏆 PARABÉNS! SEU PROJETO ESTÁ PRONTO PARA O DEPLOY FINAL!** 🚀

*Checklist concluído - Zeladoria Londrina indo para produção!* ✅🎯