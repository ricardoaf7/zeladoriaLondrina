# 🚨 TROUBLESHOOTING - ZELADORIA LONDRINA

## 📋 **GUIA COMPLETO DE RESOLUÇÃO DE PROBLEMAS**

*Soluções para problemas comuns no deploy e operação do sistema*

---

## 🎯 **ÍNDICE DE PROBLEMAS**

### **🚀 Deploy**
- [Build Falha](#build-falha)
- [Deploy Falha](#deploy-falha)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

### **🌐 Frontend**
- [Página em Branco](#página-em-branco)
- [Assets Não Carregam](#assets-não-carregam)
- [Erro de CORS](#erro-de-cors)

### **⚙️ Backend**
- [API Não Responde](#api-não-responde)
- [Erro 500](#erro-500)
- [Erro 404](#erro-404)
- [Rate Limiting](#rate-limiting)

### **🗄️ Banco de Dados**
- [Conexão Falha](#conexão-falha)
- [Permissões RLS](#permissões-rls)
- [Migrations Falham](#migrations-falham)

### **📸 Sistema OCR**
- [OCR Não Processa](#ocr-não-processa)
- [Importação Falha](#importação-falha)
- [Coordenadas Incorretas](#coordenadas-incorretas)

### **📊 Analytics**
- [Dados Não Aparecem](#dados-não-aparecem)
- [Performance Lenta](#performance-lenta)

### **🛡️ Segurança**
- [CSRF Token Inválido](#csrf-token-inválido)
- [Autenticação Falha](#autenticação-falha)

---

## 🚀 **DEPLOY**

### **Build Falha**

#### **Sintomas:**
```bash
❌ npm run build:prod falha
❌ Erro de TypeScript
❌ Module not found
❌ Out of memory
```

#### **Soluções:**

**1. Limpar cache e rebuildar:**
```bash
# Limpar completamente
rm -rf node_modules package-lock.json dist build
rm -rf client/node_modules client/package-lock.json

# Reinstalar
cd client && npm install && cd ..
npm install

# Rebuildar
npm run build:prod
```

**2. Verificar erros de TypeScript:**
```bash
# Verificar erros de tipo
npm run check

# Verificar erros específicos
npx tsc --noEmit

# Ver no client
cd client && npm run check
```

**3. Aumentar memória:**
```bash
# Para builds grandes
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:prod
```

**4. Verificar imports:**
```bash
# Procurar imports quebrados
grep -r "from '@" client/src/
grep -r "require(" server/
```

### **Deploy Falha**

#### **Sintomas:**
```bash
❌ Vercel build falha
❌ Timeout no deploy
❌ Arquivos grandes demais
❌ Dependências faltando
```

#### **Soluções:**

**1. Verificar logs da Vercel:**
```bash
# Ver logs completos
vercel logs --follow

# Ver logs de build específico
vercel logs deployment-id
```

**2. Verificar tamanho do bundle:**
```bash
# Verificar tamanhos
ls -lh dist/client/assets/

# Tamanhos recomendados:
# - main.js: < 500KB
# - vendor.js: < 1MB
# - CSS: < 100KB
```

**3. Otimizar build:**
```bash
# Usar build otimizada
npm run build:prod

# Verificar bundle analyzer
npm run build:analyze
```

**4. Verificar vercel.json:**
```json
{
  "functions": {
    "server/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### **Variáveis de Ambiente**

#### **Sintomas:**
```bash
❌ undefined is not a function
❌ Cannot read property of undefined
❌ API keys não funcionam
```

#### **Soluções:**

**1. Verificar variáveis na Vercel:**
```bash
# Listar variáveis
vercel env ls

# Adicionar variável
vercel env add VAR_NAME production

# Remover variável
vercel env rm VAR_NAME production
```

**2. Verificar nomes corretos:**
```bash
# Variáveis obrigatórias:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
JWT_SECRET
ENCRYPTION_KEY
NODE_ENV=production
```

**3. Testar variáveis:**
```bash
# Criar arquivo de teste
echo "console.log(process.env.VITE_SUPABASE_URL)" > test-env.js
node test-env.js
```

---

## 🌐 **FRONTEND**

### **Página em Branco**

#### **Sintomas:**
```bash
❌ Página totalmente branca
❌ Console vazio
❌ Nenhum erro aparente
```

#### **Soluções:**

**1. Verificar console do navegador:**
```javascript
// Abrir console (F12)
// Verificar erros de JavaScript
// Verificar network requests
```

**2. Verificar imports:**
```bash
# Verificar se todos os componentes existem
grep -r "import.*from" client/src/ | grep -v "node_modules"
```

**3. Verificar rotas:**
```bash
# Verificar App.tsx
# Verificar se todas as rotas estão definidas
# Verificar lazy loading
```

**4. Verificar build:**
```bash
# Rebuildar cliente
cd client && npm run build

# Verificar erros de build
npm run build 2>&1 | grep -i error
```

### **Assets Não Carregam**

#### **Sintomas:**
```bash
❌ Imagens não aparecem
❌ CSS não carrega
❌ Fontes quebradas
❌ 404 em assets
```

#### **Soluções:**

**1. Verificar caminhos:**
```bash
# Verificar public/
ls -la public/

# Verificar imports de assets
import logo from '/assets/logo.png'
```

**2. Verificar Vite config:**
```javascript
// vite.config.ts
export default defineConfig({
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg']
})
```

**3. Verificar build output:**
```bash
# Verificar se assets foram copiados
ls -la dist/client/assets/
```

### **Erro de CORS**

#### **Sintomas:**
```bash
❌ CORS policy blocked
❌ No 'Access-Control-Allow-Origin'
❌ Preflight request fails
```

#### **Soluções:**

**1. Verificar configuração CORS:**
```javascript
// server/index.ts
app.use(cors({
  origin: ['https://zeladoria-londrina.vercel.app'],
  credentials: true
}))
```

**2. Verificar variável de ambiente:**
```bash
CORS_ORIGIN=https://zeladoria-londrina.vercel.app
```

---

## ⚙️ **BACKEND**

### **API Não Responde**

#### **Sintomas:**
```bash
❌ Connection refused
❌ Timeout
❌ 502 Bad Gateway
❌ Service unavailable
```

#### **Soluções:**

**1. Verificar se servidor está rodando:**
```bash
# Verificar processo
ps aux | grep node

# Verificar porta
netstat -tlnp | grep 5000

# Testar localmente
curl http://localhost:5000/api/status
```

**2. Verificar logs:**
```bash
# Ver logs do servidor
npm run dev

# Ver logs de erro
tail -f logs/error.log
```

**3. Verificar Vercel functions:**
```bash
# Ver logs da Vercel
vercel logs --follow

# Ver functions
vercel ls
```

### **Erro 500**

#### **Sintomas:**
```bash
❌ Internal Server Error
❌ Cannot read property of undefined
❌ Database connection failed
```

#### **Soluções:**

**1. Verificar logs de erro:**
```bash
# Ver últimos erros
tail -n 50 logs/error.log

# Ver erros específicos
grep -i "error" logs/app.log
```

**2. Verificar conexão com banco:**
```bash
# Testar conexão Supabase
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  $VITE_SUPABASE_URL/rest/v1/?select=*
```

**3. Verificar variáveis de ambiente:**
```bash
# Verificar se todas as variáveis estão setadas
env | grep -E "(SUPABASE|JWT|ENCRYPTION)"
```

**4. Debug específico:**
```javascript
// Adicionar logs detalhados
console.error('Erro detalhado:', error)
console.error('Stack:', error.stack)
console.error('Variáveis:', process.env.NODE_ENV)
```

### **Erro 404**

#### **Sintomas:**
```bash
❌ Cannot GET /api/endpoint
❌ Route not found
❌ 404 on valid endpoints
```

#### **Soluções:**

**1. Verificar rotas:**
```bash
# Verificar server/routes.ts
# Verificar se rotas estão definidas
# Verificar ordem das rotas
```

**2. Verificar Vercel config:**
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "server/index.ts" }
  ]
}
```

**3. Testar rotas individualmente:**
```bash
# Testar cada endpoint
curl http://localhost:5000/api/status
curl http://localhost:5000/api/analytics/kpis
```

### **Rate Limiting**

#### **Sintomas:**
```bash
❌ 429 Too Many Requests
❌ Rate limit exceeded
❌ Tempo de espera muito longo
```

#### **Soluções:**

**1. Verificar limites:**
```javascript
// Verificar config de rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100 // limite de 100 requests
})
```

**2. Verificar headers:**
```bash
# Ver headers de rate limit
curl -i http://localhost:5000/api/status
# Look for: X-RateLimit-Limit, X-RateLimit-Remaining
```

**3. Ajustar limites:**
```bash
# Aumentar se necessário
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=60000
```

---

## 🗄️ **BANCO DE DADOS**

### **Conexão Falha**

#### **Sintomas:**
```bash
❌ connection refused
❌ unable to connect to server
❌ timeout
❌ authentication failed
```

#### **Soluções:**

**1. Verificar credenciais:**
```bash
# Testar conexão manual
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  $VITE_SUPABASE_URL/rest/v1/?select=*
```

**2. Verificar URL:**
```bash
# Verificar se URL está correta
echo $VITE_SUPABASE_URL
# Deve ser: https://projeto.supabase.co
```

**3. Verificar chaves:**
```bash
# Verificar se chave é válida
# No Supabase Dashboard: Settings > API
```

**4. Testar conexão simples:**
```bash
# Testar com curl
curl -X GET \
  -H "apikey: SUA_ANON_KEY" \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  https://projeto.supabase.co/rest/v1/
```

### **Permissões RLS**

#### **Sintomas:**
```bash
❌ permission denied for table
❌ RLS policy violation
❌ Insufficient permissions
```

#### **Soluções:**

**1. Verificar políticas RLS:**
```sql
-- Ver políticas existentes
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Ver grants
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public';
```

**2. Conceder permissões:**
```sql
-- Para anon (usuários não logados)
GRANT SELECT ON service_areas TO anon;

-- Para authenticated (usuários logados)
GRANT ALL ON service_areas TO authenticated;
```

**3. Verificar políticas específicas:**
```sql
-- Ver política de service_areas
SELECT * FROM pg_policies 
WHERE tablename = 'service_areas';
```

**4. Desabilitar RLS temporariamente (teste):**
```sql
-- APENAS PARA TESTE!
ALTER TABLE service_areas DISABLE ROW LEVEL SECURITY;
```

### **Migrations Falham**

#### **Sintomas:**
```bash
❌ Migration failed
❌ Table already exists
❌ Column already exists
❌ Constraint violation
```

#### **Soluções:**

**1. Verificar migrations aplicadas:**
```bash
# Ver no Supabase Dashboard
# Ou via SQL:
SELECT * FROM supabase_migrations;
```

**2. Resetar migrations (cuidado):**
```bash
# Apagar tudo e recriar (PERDE DADOS!)
supabase db reset

# Ou manualmente:
supabase migration new reset_all
```

**3. Corrigir migration específica:**
```sql
-- Adicionar IF NOT EXISTS
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

-- Adicionar IF NOT EXISTS para colunas
ALTER TABLE service_areas 
ADD COLUMN IF NOT EXISTS name TEXT;
```

**4. Debug migration:**
```bash
# Ver qual migration falhou
supabase migration list

# Ver erro específico
supabase migration up --debug
```

---

## 📸 **SISTEMA OCR**

### **OCR Não Processa**

#### **Sintomas:**
```bash
❌ OCR returns empty data
❌ No areas found
❌ Processing error
❌ Timeout on OCR
```

#### **Soluções:**

**1. Testar com dados simples:**
```bash
# Testar endpoint diretamente
curl -X POST http://localhost:5000/api/ocr/process \
  -H "Content-Type: application/json" \
  -d '{"ocrText":"area publica av. teste casoni 1000,00 -23,3000000 -51,1500000 1"}'
```

**2. Verificar formato dos dados:**
```bash
# Formato esperado:
tipo_item endereco bairro metragem_m2 latitude longitude lote observações
area publica av. jorge casoni casoni 1000,00 -23,3000000 -51,1500000 1
```

**3. Verificar logs do OCR:**
```bash
# Ver logs específicos
tail -f logs/ocr.log

# Ver erros de processamento
grep -i "ocr" logs/error.log
```

**4. Debug do processamento:**
```javascript
// Adicionar logs detalhados no ocr-import.ts
console.log('OCR Text recebido:', ocrText)
console.log('Linhas processadas:', lines.length)
console.log('Áreas encontradas:', areas.length)
```

### **Importação Falha**

#### **Sintomas:**
```bash
❌ Import to Supabase failed
❌ Duplicate entries
❌ Validation errors
❌ Database constraint violation
```

#### **Soluções:**

**1. Verificar duplicatas:**
```sql
-- Verificar duplicatas por endereço
SELECT endereco, COUNT(*) 
FROM service_areas 
GROUP BY endereco 
HAVING COUNT(*) > 1;
```

**2. Verificar validação:**
```javascript
// Ver erros de validação específicos
console.log('Erros de validação:', validationErrors)
console.log('Campos inválidos:', invalidFields)
```

**3. Testar inserção manual:**
```sql
-- Testar insert manual
INSERT INTO service_areas (name, description, service_type) 
VALUES ('Teste', 'Descrição teste', 'ROCAGEM');
```

**4. Verificar constraints:**
```sql
-- Ver constraints da tabela
\d service_areas

-- Ver triggers
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'service_areas';
```

### **Coordenadas Incorretas**

#### **Sintomas:**
```bash
❌ Coordinates out of bounds
❌ Invalid coordinate format
❌ Areas outside Londrina
❌ Precision issues
```

#### **Soluções:**

**1. Verificar formato:**
```bash
# Formato correto:
# Latitude: -23,XXXXXX (ex: -23,3044206)
# Longitude: -51,XXXXXX (ex: -51,1531729)
```

**2. Verificar limites de Londrina:**
```javascript
// Limites aproximados de Londrina:
const bounds = {
  north: -23.25,
  south: -23.35,
  east: -51.05,
  west: -51.25
}
```

**3. Converter formato:**
```javascript
// Converter vírgula para ponto
const lat = parseFloat(latitudeString.replace(',', '.'))
const lng = parseFloat(longitudeString.replace(',', '.'))
```

**4. Validar coordenadas:**
```javascript
// Função de validação
function isValidCoordinate(lat, lng) {
  return lat >= -23.35 && lat <= -23.25 &&
         lng >= -51.25 && lng <= -51.05
}
```

---

## 📊 **ANALYTICS**

### **Dados Não Aparecem**

#### **Sintomas:**
```bash
❌ Empty dashboard
❌ No KPIs displayed
❌ Charts show no data
❌ Analytics API returns empty
```

#### **Soluções:**

**1. Verificar se há dados no banco:**
```sql
-- Verificar se há dados
SELECT COUNT(*) FROM service_areas;
SELECT COUNT(*) FROM service_schedules;
SELECT COUNT(*) FROM analytics_events;
```

**2. Verificar queries:**
```sql
-- Testar query de KPIs manualmente
SELECT 
  COUNT(*) as total_areas,
  AVG(cost_estimate) as avg_cost,
  SUM(estimated_duration) as total_duration
FROM service_areas;
```

**3. Verificar permissões:**
```sql
-- Ver se pode acessar analytics tables
SELECT * FROM analytics_kpis LIMIT 1;
```

**4. Popular dados de teste:**
```bash
# Executar script de seed
npm run db:seed

# Ou manualmente
npm run db:import-test-data
```

### **Performance Lenta**

#### **Sintomas:**
```bash
❌ Dashboard takes > 5s to load
❌ API timeouts
❌ Charts render slowly
❌ Memory usage high
```

#### **Soluções:**

**1. Adicionar índices:**
```sql
-- Índices para performance
CREATE INDEX idx_service_areas_created_at ON service_areas(created_at);
CREATE INDEX idx_service_areas_status ON service_areas(status);
CREATE INDEX idx_service_areas_bairro ON service_areas(bairro);
```

**2. Otimizar queries:**
```sql
-- Usar LIMIT e filtros
SELECT * FROM service_areas 
WHERE created_at > NOW() - INTERVAL '30 days'
LIMIT 1000;
```

**3. Implementar cache:**
```javascript
// Adicionar cache de 5 minutos
const cacheKey = 'analytics_kpis'
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

// ... executar query ...
await redis.setex(cacheKey, 300, JSON.stringify(result))
```

**4. Paginação:**
```javascript
// Implementar paginação
const page = parseInt(req.query.page) || 1
const limit = parseInt(req.query.limit) || 50
const offset = (page - 1) * limit

const results = await query.limit(limit).offset(offset)
```

---

## 🛡️ **SEGURANÇA**

### **CSRF Token Inválido**

#### **Sintomas:**
```bash
❌ CSRF token inválido
❌ Token de segurança ausente
❌ 403 Forbidden
```

#### **Soluções:**

**1. Verificar headers:**
```bash
# Verificar se está enviando headers corretos
curl -X POST http://localhost:5000/api/endpoint \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: token-aqui"
```

**2. Desabilitar CSRF temporariamente (teste):**
```javascript
// Em development apenas
if (process.env.NODE_ENV === 'development') {
  app.use(csrf({ ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] }))
}
```

**3. Verificar configuração:**
```javascript
// Ver config do CSRF
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}))
```

### **Autenticação Falha**

#### **Sintomas:**
```bash
❌ Invalid JWT token
❌ Authentication failed
❌ Unauthorized access
❌ Token expired
```

#### **Soluções:**

**1. Verificar JWT secret:**
```bash
# Verificar se JWT_SECRET está correto
echo $JWT_SECRET
# Deve ter no mínimo 32 caracteres
```

**2. Verificar token:**
```bash
# Decodificar token (não validar)
echo $TOKEN | cut -d. -f2 | base64 -d
```

**3. Verificar expiração:**
```javascript
// Verificar exp do token
const decoded = jwt.decode(token)
if (decoded.exp < Date.now() / 1000) {
  console.log('Token expirado')
}
```

**4. Gerar novo token de teste:**
```javascript
// Gerar token válido para teste
const testToken = jwt.sign(
  { user_id: 'test-user' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)
```

---

## 🔧 **FERRAMENTAS DE DEBUG**

### **Comandos Úteis:**

```bash
# Ver todos os logs
tail -f logs/*.log

# Ver erros recentes
grep -i error logs/error.log | tail -20

# Ver requisições HTTP
grep -i "GET\|POST" logs/access.log | tail -20

# Monitorar em tempo real
pm2 logs

# Ver uso de memória
htop

# Ver conexões de rede
netstat -tlnp

# Testar APIs rapidamente
http :5000/api/status
http :5000/api/analytics/kpis
```

### **Scripts de Teste:**

```bash
# Testar OCR
curl -X POST localhost:5000/api/ocr/process \
  -H "Content-Type: application/json" \
  -d '{"ocrText":"area publica av. teste casoni 1000,00"}'

# Testar importação
curl -X POST localhost:5000/api/ocr/areas \
  -H "Content-Type: application/json" \
  -d '{"areas":[{"tipo_item":"area publica","endereco":"av. teste","metragem_m2":1000}]}'

# Testar consulta
curl "localhost:5000/api/coleta/consulta?endereco=av. teste"

# Testar status
curl localhost:5000/api/status
```

---

## 📞 **SUPORTE E CONTATOS**

### **Recursos de Suporte:**

```bash
📖 Documentação Completa:
   - DEPLOY_FINAL.md
   - GUIA_OCR_ROCAGEM.md
   - CHECKLIST_DEPLOY_FINAL.md
   - TROUBLESHOOTING.md (este arquivo)

🔧 Ferramentas de Diagnóstico:
   - node scripts/startup-healthcheck.js health
   - node scripts/startup-healthcheck.js check
   - npm run test:all

📧 Contato Técnico:
   - Email: suporte-tecnico@londrina.pr.gov.br
   - Telefone: (43) 3371-6000
   - Chat: Disponível no dashboard
```

### **Escalonamento de Problemas:**

```bash
🔴 CRÍTICO (Sistema fora do ar):
   1. Verificar logs imediatamente
   2. Executar health check
   3. Contatar equipe técnica
   4. Preparar rollback se necessário

🟡 IMPORTANTE (Funcionalidade comprometida):
   1. Identificar componente afetado
   2. Executar testes específicos
   3. Verificar documentação
   4. Aplicar soluções sugeridas

🟢 MELHORIA (Performance ou UX):
   1. Coletar métricas detalhadas
   2. Identificar gargalos
   3. Implementar otimizações
   4. Monitorar resultados
```

---

## 🎯 **DICAS FINAIS**

### **Antes de Pedir Ajuda:**

1. **Leia os logs completos**
2. **Teste as soluções sugeridas**
3. **Documente o erro exato**
4. **Colete informações do ambiente**
5. **Teste em ambiente local primeiro**

### **Informações Necessárias para Suporte:**

```bash
📝 Para reportar problema:
   - Descrição detalhada do erro
   - Logs completos do erro
   - Passos para reproduzir
   - Ambiente (dev/staging/prod)
   - Navegador/SO utilizado
   - Horário do erro
   - Screenshots se relevante
```

---

**🏆 LEMBRE-SE: Todo problema tem solução!**

*Mantenha a calma, siga o checklist e você resolverá!* 💪✨