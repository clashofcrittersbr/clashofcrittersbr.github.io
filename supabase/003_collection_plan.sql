-- Plano privado de coleção/evolução. Execute no SQL Editor > Query source: Database.
-- A tabela user_settings já possui RLS de leitura/escrita restrita ao próprio usuário (001_accounts.sql).
alter table public.user_settings
  add column if not exists collection_plan jsonb not null
  default '{"version":1,"progress":{}}'::jsonb;

comment on column public.user_settings.collection_plan is
  'Progresso e metas T1–T4 escolhidos pelo usuário no planejador da wiki; privado por RLS.';
