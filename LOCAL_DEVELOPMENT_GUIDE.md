# Guia de Desenvolvimento Local

Este projeto foi refatorado para rodar localmente com um servidor Node.js em TypeScript, mantendo a mesma API (`/api/**`) que funcionava no Vercel.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp env.example .env.local
```

Edite `.env.local` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beauty?schema=public"

# API Server Configuration
API_PORT=3001
NODE_ENV=development

# Frontend API Configuration
VITE_API_URL=http://localhost:3001
```

### 3. Configurar Banco de Dados

```bash
# Subir o banco de dados
npm run db:up

# Executar migrações
npm run db:migrate

# (Opcional) Popular com dados de exemplo
npm run db:seed
```

### 4. Iniciar Desenvolvimento

```bash
# Inicia tanto o servidor API quanto o frontend
npm run dev
```

Isso irá:
- Iniciar o servidor API na porta 3001
- Iniciar o Vite dev server na porta 5173
- Configurar proxy automático para `/api/**`

## 📁 Estrutura do Projeto

```
├── api/                    # Funções serverless (mantidas para compatibilidade)
│   ├── _lib/
│   │   └── prisma.ts      # Cliente Prisma
│   ├── health.ts          # Health check
│   ├── auth/
│   │   └── signup.ts      # Registro de usuário
│   └── ...
├── server/
│   └── index.ts           # Servidor Express principal
├── src/                    # Frontend React
└── dist/                   # Build do frontend
```

## 🔧 Como Funciona

### Servidor Express (`server/index.ts`)

- **Auto-registro de rotas**: Escaneia automaticamente todos os arquivos `api/**/*.ts`
- **Compatibilidade Vercel**: Converte handlers do Vercel para Express
- **Proxy automático**: Mapeia `api/users/create.ts` → `POST /api/users/create`
- **Parâmetros dinâmicos**: Suporta `api/users/[id]/profile.ts` → `/api/users/:id/profile`

### Vite Proxy

O `vite.config.ts` está configurado para:
- Proxy de `/api/**` para `http://localhost:3001`
- CORS habilitado para desenvolvimento
- Logs de requisições para debug

## 🧪 Testando a API

### Teste Manual

```bash
# Health check
curl http://localhost:3001/api/health

# Teste de endpoint
curl http://localhost:3001/api/test

# Listar serviços
curl http://localhost:3001/api/services
```

### Teste Automatizado

```bash
# Executar script de teste
node test-server.js
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor + frontend
npm run dev:server       # Apenas servidor API
npm run dev:client       # Apenas frontend

# Build
npm run build           # Build do frontend
npm run build:client    # Build do frontend (alias)

# Banco de dados
npm run db:up          # Subir PostgreSQL
npm run db:down        # Parar PostgreSQL
npm run db:migrate     # Executar migrações
npm run db:seed        # Popular com dados
npm run db:studio      # Abrir Prisma Studio
```

## 🔄 Migração de Handlers

Os handlers existentes em `api/**/*.ts` funcionam sem modificação:

```typescript
// api/users/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED' })
  }
  
  // Sua lógica aqui...
  return res.status(201).json({ success: true })
}
```

O servidor Express automaticamente:
- Converte `req.method`, `req.body`, `req.query`
- Mapeia `res.status().json()` para Express
- Preserva headers e cookies
- Suporta parâmetros de rota dinâmica

## 🚀 Deploy

Para deploy no Vercel, o `vercel.json` ainda funciona normalmente. O servidor local é apenas para desenvolvimento.

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Verificar processos na porta 3001
lsof -i :3001

# Matar processo se necessário
kill -9 <PID>
```

### Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando
npm run db:up

# Verificar logs
docker logs beauty-snap-show-postgres-1
```

### Proxy não funciona
- Verifique se o servidor está rodando na porta 3001
- Confirme se `VITE_API_URL` está correto no `.env.local`
- Verifique os logs do Vite para erros de proxy

## 📚 Recursos Adicionais

- [Documentação do Express](https://expressjs.com/)
- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do Prisma](https://www.prisma.io/docs/)
