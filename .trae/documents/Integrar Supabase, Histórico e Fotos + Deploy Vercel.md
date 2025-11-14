## Diagnóstico do Projeto
- Frontend React + Vite em `client/` com Leaflet e React Query; build para `dist/public` (vite.config.ts:31)
- Backend Express centraliza API: rotas em `server/routes.ts`, servidor em `server/index.ts` (server/index.ts:49–79)
- Armazenamento de dados via Drizzle ORM sobre PostgreSQL; hoje usa Neon (`@neondatabase/serverless`) e alterna entre memória e DB por `DATABASE_URL` (server/storage.ts:343–356)
- Tabelas atuais: `service_areas`, `teams`, `app_config` (db/schema.ts:3–27,29–39,41–46)
- Rotas já úteis: listar áreas leves para mapa (server/routes.ts:77–129), atualizar posição (server/routes.ts:287–311), registrar roçagem com auditoria básica e recálculo (server/routes.ts:342–403), registro diário em lote (server/routes.ts:432–457), histórico simples (JSON) (server/routes.ts:405–430)
- Deploy Vercel já configurado: Node server `dist/index.js` para `/api` e estáticos em `dist/public` (vercel.json:1–33)

## Melhorias Prioritárias
1. Histórico estruturado e consultável
- Normalizar "histórico" em tabela própria (em vez de JSON em `service_areas.history`) para relatórios, filtros por período e anexos de fotos.
2. Fotos antes/depois com Supabase Storage
- Fluxo de upload direto do cliente para bucket dedicado, com metadados vinculados ao evento de roçagem.
3. Supabase como backend consolidado
- Usar o Postgres do Supabase para Drizzle (driver `node-postgres/pg`), manter Express/Drizzle atuais para compatibilidade.
- Opcional: Supabase Auth para operadores/supervisores com RLS.
4. UX no mapa/cartões
- Incluir visualização de últimas fotos no `MapInfoCard` e upload no `QuickRegisterModal`.
5. Observabilidade
- Melhorar logs e erros nas rotas críticas; já há middleware de log (server/index.ts:19–47).

## Plano de Implementação
### Fase 1 — Supabase Setup
- Criar projeto Supabase; buckets:
  - `rocagens` (público com políticas de escrita autenticada).
- Variáveis de ambiente (Vercel):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL` (connection string do Postgres do Supabase)
- Trocar driver Neon por `pg` em `DbStorage`: usar `drizzle-orm/node-postgres` com pool `pg`.

### Fase 2 — Modelo de Dados
- Novas tabelas Drizzle:
  - `mowing_events`: id, area_id (FK), date, type (`completed|forecast`), status, observation, registrado_por, data_registro, days_to_complete, proxima_previsao.
  - `event_photos`: id, event_id (FK), kind (`before|after|extra`), storage_path, taken_at, uploaded_by.
- Manter `service_areas` atual e descontinuar `history` JSON gradualmente.
- Migração Drizzle (`drizzle-kit`): criar e aplicar `push`.

### Fase 3 — API
- Novas rotas:
  - `GET /api/areas/:id/history` → paginação e filtros por período.
  - `POST /api/areas/:id/register` → cria `mowing_event` (substitui PATCH genérico), aceita `completed|forecast`.
  - `POST /api/events/:id/photos` → associa fotos (recebe `storage_path` e metadados; upload ocorre no cliente).
- Ajustes nas rotas existentes:
  - `POST /api/areas/register-daily` passa a criar eventos em lote e recalcular previsões (reutiliza `shared/schedulingAlgorithm`).

### Fase 4 — Frontend
- `QuickRegisterModal`:
  - Adicionar inputs de upload: "Antes" e "Depois"; fluxo:
    1) criar evento via API
    2) fazer upload direto com `@supabase/supabase-js` para `rocagens/area/<areaId>/event/<eventId>/<kind>.jpg`
    3) enviar metadados para `POST /api/events/:id/photos`
- `MapInfoCard`:
  - Mostrar últimas fotos (thumbnails com modal/lightbox).
- Lista/Timeline:
  - Nova view com histórico por área e filtros.

### Fase 5 — Deploy Vercel
- Ajustar build (se trocar driver): `build` já empacota servidor com esbuild (package.json:8) e estáticos com Vite.
- Configurar envs no projeto Vercel.
- Testar rotas `/api` e CORS de uploads do Supabase.

### Fase 6 — Segurança (Opcional nesta etapa)
- Habilitar Supabase Auth; perfis de usuário (operador/supervisor/admin).
- RLS: operadores podem escrever apenas em `mowing_events` e `event_photos`; leituras amplas nas áreas.

### Entregáveis
- Migrações Drizzle criadas e aplicadas
- Rotas API novas e ajustadas
- Upload de fotos funcionando com vinculação ao histórico
- UI com visualização e filtros de histórico
- Deploy Vercel com envs Supabase

### Observações
- Podemos começar com persistência híbrida (gravar eventos e também manter `service_areas.history` por compatibilidade) e remover JSON quando a nova tela de histórico estiver pronta.
- O recálculo de previsões já existe e será acionado ao registrar `completed` (server/routes.ts:464–518).