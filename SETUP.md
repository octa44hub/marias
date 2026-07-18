# Bazar PDV — Guia de Configuração

## Stack
- Next.js 14 · TypeScript · Tailwind CSS
- Prisma ORM + PostgreSQL (Supabase)
- NextAuth.js (autenticação simples)
- Zustand (estado do carrinho)
- PWA (instalável no celular)

---

## 1. Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [Vercel](https://vercel.com) (gratuita)
- Git + GitHub

---

## 2. Supabase — criar banco de dados

1. Acesse supabase.com → New Project
2. Anote as connection strings em **Settings → Database**:
   - **Connection string** (porta 6543) → `DATABASE_URL`
   - **Direct connection** (porta 5432) → `DIRECT_URL`

---

## 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
DATABASE_URL="postgresql://postgres.[ref]:[senha]@aws-0-[região].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[senha]@aws-0-[região].pooler.supabase.com:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-aqui"   ← rode: openssl rand -base64 32
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="sua-senha-segura"
```

Para gerar o NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## 4. Instalar e configurar

```bash
npm install
npx prisma generate
npx prisma db push        # cria as tabelas no Supabase
npm run db:seed           # cria 4 produtos de demonstração (opcional)
npm run dev               # inicia em http://localhost:3000
```

---

## 5. Ícones do PWA

Adicione os ícones na pasta `public/icons/` nos tamanhos:
`72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512`

Use o site https://realfavicongenerator.net para gerar os arquivos a partir de uma imagem.

---

## 6. Deploy na Vercel

1. Suba o projeto para o GitHub
2. Acesse vercel.com → New Project → importe o repositório
3. Em **Environment Variables**, adicione todas as variáveis do `.env.local`
   - Mude `NEXTAUTH_URL` para a URL da Vercel (ex: `https://bazar-pdv.vercel.app`)
4. Clique em **Deploy**

---

## 7. Instalar como PWA no celular

1. Acesse o sistema pelo navegador do celular (Chrome no Android, Safari no iPhone)
2. No Chrome: menu → "Adicionar à tela inicial"
3. No Safari: compartilhar → "Adicionar à Tela de Início"

---

## 8. Credenciais padrão (após o setup)

- Usuário: o que você definiu em `ADMIN_USERNAME`
- Senha: o que você definiu em `ADMIN_PASSWORD`

---

## Estrutura de pastas

```
app/
  api/            ← API Routes (Next.js)
  dashboard/      ← Tela inicial
  pdv/            ← Ponto de Venda
  produtos/       ← Cadastro e lista de produtos
  relatorios/     ← Relatório de vendas
  vendas/[id]/    ← Detalhes de uma venda
components/
  ui/             ← Componentes base (Button, Input, Modal etc)
  layout/         ← Header, BottomNav, AppLayout
  pdv/            ← Componentes do PDV
  products/       ← Componentes de produtos
  sales/          ← Componentes de relatório
lib/
  prisma.ts       ← Cliente do Prisma
  auth.ts         ← Configuração do NextAuth
  formatters.ts   ← Formatação de moeda, datas
store/
  pdvStore.ts     ← Estado global do carrinho (Zustand)
prisma/
  schema.prisma   ← Modelo do banco de dados
  seed.ts         ← Dados de demonstração
public/
  manifest.json   ← Configuração do PWA
  sw.js           ← Service Worker
  icons/          ← Ícones do PWA (adicionar manualmente)
```
