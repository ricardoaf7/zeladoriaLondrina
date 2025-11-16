# 🔒 Segurança - Zeladoria Londrina

## 📋 Visão Geral

Este documento descreve as medidas de segurança implementadas no sistema Zeladoria Londrina e fornece instruções para manter a segurança da aplicação.

## 🚨 Configuração Inicial Obrigatória

### 1. Variáveis de Ambiente

Antes de iniciar o servidor, **configure obrigatoriamente** as seguintes variáveis:

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as variáveis obrigatórias
VITE_SUPABASE_URL=https://sua-instancia.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
JWT_SECRET=uma-chave-secreta-super-segura-de-pelo-menos-32-caracteres
ENCRYPTION_KEY=uma-chave-de-criptografia-de-32-bytes-hexadecimal
```

### 2. Gerar Chaves Seguras Automaticamente

Execute o script de segurança para gerar chaves criptográficas:

```bash
# Gerar chaves automaticamente
npm run security:keys

# Verificar configuração
npm run security:validate

# Configuração completa (gerar + validar)
npm run security:setup
```

## 🛡️ Medidas de Segurança Implementadas

### 1. Headers de Segurança

- **X-Content-Type-Options**: Previne MIME-sniffing
- **X-Frame-Options**: Protege contra clickjacking
- **X-XSS-Protection**: Ativa proteção XSS do navegador
- **Strict-Transport-Security**: Força HTTPS
- **Content-Security-Policy**: Define política de conteúdo
- **Referrer-Policy**: Controla informações de referrer
- **Permissions-Policy**: Restringe acesso a APIs do navegador

### 2. Rate Limiting

- **Limite global**: 1000 requisições por IP a cada 15 minutos
- **Proteção login**: 5 tentativas por IP a cada 15 minutos
- **Headers informativos**: X-RateLimit-Limit, X-RateLimit-Remaining

### 3. CORS Configurado

```typescript
const allowedOrigins = [
  'http://localhost:5173',    // Desenvolvimento
  'http://localhost:3000',    // Alternativo
  'https://zeladoria-londrina.vercel.app' // Produção
];
```

### 4. Proteção CSRF

- Token CSRF gerado automaticamente
- Verificação em todas as requisições não-GET
- Token incluído em todas as respostas

### 5. Validação de Entrada

- **XSS**: Bloqueia tags HTML e JavaScript
- **SQL Injection**: Detecta padrões de SQL maliciosos
- **Path Traversal**: Previne acesso a arquivos do sistema
- **Tamanho máximo**: 10KB por campo de entrada

### 6. Criptografia

- **AES-256-GCM**: Para dados sensíveis no banco
- **PBKDF2**: Para hash de senhas (100k iterações)
- **SHA-256**: Para verificação de integridade
- **HMAC**: Para assinatura de dados

### 7. Sanitização de Saída

- Escapamento automático de HTML
- Remoção de dados sensíveis de respostas
- Redação de campos confidenciais

### 8. Logging de Segurança

- Registro de tentativas de login falhadas
- Monitoramento de requisições suspeitas
- Alertas de possíveis ataques
- Auditoria de acessos

## 🔐 Gerenciamento de Chaves

### Chaves Necessárias

1. **JWT_SECRET**: Para assinatura de tokens (mínimo 32 caracteres)
2. **ENCRYPTION_KEY**: Para criptografia de dados (32 bytes hex)
3. **SESSION_SECRET**: Para sessões (opcional, usa JWT_SECRET se não definido)

### Gerar Chaves Seguras

```bash
# Método 1: Usar o script (recomendado)
npm run security:keys -- --show

# Método 2: Manual com OpenSSL
openssl rand -hex 32  # Para JWT_SECRET
openssl rand -hex 32  # Para ENCRYPTION_KEY
```

### Armazenamento Seguro

- **Nunca** commite arquivos `.env` para o repositório
- Use diferentes chaves para cada ambiente (dev, staging, prod)
- Considere usar um gerenciador de segredos (AWS Secrets Manager, etc.)
- Rotação periódica de chaves (recomendado: a cada 90 dias)

## 🚫 Dados Sensíveis Protegidos

### Campos Automaticamente Redatados

```typescript
const SENSITIVE_FIELDS = [
  'password', 'senha', 'token', 'secret', 'key',
  'api_key', 'auth', 'authorization', 'cookie',
  'creditcard', 'cvv', 'pin', 'ssn', 'cpf',
  'email', 'phone', 'address', 'location'
];
```

### Exemplo de Proteção

```javascript
// Entrada do usuário
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456",
  "cpf": "123.456.789-00"
}

// Saída sanitizada (logs/respostas)
{
  "name": "João Silva",
  "email": "[REDACTED]",
  "password": "[REDACTED]",
  "cpf": "[REDACTED]"
}
```

## 📊 Monitoramento e Alertas

### Eventos Monitorados

- Tentativas de login falhadas (5+ tentativas)
- Requisições bloqueadas por rate limiting
- Padrões de entrada suspeitos
- Acessos não autorizados
- Mudanças de permissões

### Headers de Segurança Adicionais

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2024-01-01T00:00:00.000Z
X-CSRF-Token: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## 🔍 Validação de Segurança

### Comandos de Validação

```bash
# Validar todas as configurações
npm run security:validate

# Verificar variáveis de ambiente
node scripts/validate-env.js

# Gerar novo par de chaves
npm run security:keys
```

### Checklist de Segurança

- [ ] Variáveis de ambiente configuradas
- [ ] Chaves criptográficas geradas
- [ ] HTTPS habilitado em produção
- [ ] Rate limiting configurado
- [ ] CORS apropriadamente restrito
- [ ] Logs de segurança habilitados
- [ ] Backup de segurança configurado
- [ ] Rotação de chaves agendada

## 🚨 Resposta a Incidentes

### Em Caso de Suspeita de Violação

1. **Imediatamente**:
   - Revogue todas as chaves comprometidas
   - Reset senhas de usuários afetados
   - Desative acessos suspeitos

2. **Investigação**:
   - Analise logs de segurança
   - Identifique o vetor de ataque
   - Avalie o escopo do dano

3. **Recuperação**:
   - Aplique patches de segurança
   - Restaure de backups limpos
   - Reconfigure segurança

4. **Documentação**:
   - Registre o incidente
   - Atualize procedimentos
   - Treine a equipe

## 📞 Contato e Suporte

Em caso de dúvidas sobre segurança:

1. Verifique este documento
2. Consulte logs de segurança
3. Execute validação: `npm run security:validate`
4. Contate a equipe de desenvolvimento

---

**⚠️ Importante**: Esta é uma camada de segurança adicional. Sempre mantenha o sistema operacional, dependências e navegadores atualizados para segurança máxima.