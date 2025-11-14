## Confirmação Inicial

* A URL do projeto Supabase está correta: `https://jwdflbhefsvxesojvmjb.supabase.co`

* Bucket `rocagens` criado: perfeito para armazenar fotos de roçagem.

## Passo 1 — Conectar ao banco (DATABASE\_URL)

* Obter a connection string Postgres no Supabase: `Database` → `Connection strings` → `URI` (postgresql com `sslmode=require`).

* Adicionar nas variáveis:

  * Local: `.env` → `DATABASE_URL=<string do Postgres Supabase>`

  * Vercel: Project Settings → Environment Variables → `DATABASE_URL`.

* Aplicar migrações Drizzle: `npm run db:push`.

## Passo 2 — Políticas do Storage (Segurança)

* Leitura pública: manter o bucket `rocagens` com leitura pública para facilitar exibição no app.

* Escrita autenticada (recomendado): criar policy em `storage.objects` para permitir `INSERT` somente para `authenticated`, restrita ao bucket `rocagens`.

* Alternativa: uploads somente via backend com `SERVICE_ROLE_KEY` (maior controle). Se desejar, aplico a policy mais restritiva.

## Passo 3 — Cliente Supabase

* Variáveis do cliente já preparadas: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

* Fluxo de upload no `QuickRegisterModal`:

  1. Cria evento via `POST /api/areas/:id/register` (type `completed`).
  2. Faz upload para `rocagens/area/<areaId>/event/<eventId>/before_*.jpg` e `after_*.jpg`.
  3. Registra metadados com `POST /api/events/:id/photos`.

* Visualização no `MapInfoCard`: obtém `GET /api/areas/:id/history` + `GET /api/events/:id/photos` e mostra thumbnails.

## Passo 4 — Validação Local

* Subir servidor em dev e testar endpoints:

  * `GET /api/areas/light?servico=rocagem` (mapa)

  * `POST /api/areas/1/register` com corpo `{ "date": "2025-11-12", "type": "completed" }`

  * Upload de fotos pelo modal e ver thumbnails no `MapInfoCard`.

## Passo 5 — Deploy na Vercel

* Adicionar envs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATABASE_URL`.

* Executar build e deploy.

* Validação em produção dos fluxos: registro, upload, exibição.

## Passo 6 — Opcional (Auth e Auditoria)

* Habilitar Supabase Auth para operadores e guardar `registradoPor`/`uploadedBy` com `auth.uid()`.

* Usar URLs assinadas caso queira restringir leitura pública.

## Entregáveis

* Migrações aplicadas no Supabase

* Rotas API funcionando para histórico e fotos

* Upload e exibição de fotos end-to-end

* Deploy na Vercel com variáveis configuradas

