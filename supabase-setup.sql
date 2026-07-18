-- Execute este SQL no Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/hsoapybhdjziqonfuxjz/sql

-- Tabela de dados do app
CREATE TABLE IF NOT EXISTS marias_data (
  key        text        PRIMARY KEY,
  value      jsonb       NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE marias_data ENABLE ROW LEVEL SECURITY;

-- Permitir acesso público (sem autenticação)
CREATE POLICY "acesso_publico" ON marias_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
