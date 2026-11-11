-- Diretório público voluntário de membros.
-- Execute no SQL Editor do projeto antes de mesclar a PR. Não altera profiles/user_settings.
-- Cada linha corresponde a uma pessoa que escolheu aparecer; apagar a linha é sair da lista.
create table if not exists public.member_directory (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  game_uid text not null check (char_length(btrim(game_uid)) between 1 and 80),
  last_seen_at timestamptz not null default now()
);

-- A data de atividade usa o relógio do banco, mesmo quando o cliente manda outra data.
create or replace function public.stamp_member_activity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.display_name := btrim(new.display_name);
  new.game_uid := btrim(new.game_uid);
  new.last_seen_at := now();
  return new;
end;
$$;

drop trigger if exists member_activity_stamp on public.member_directory;
create trigger member_activity_stamp
  before insert or update on public.member_directory
  for each row execute function public.stamp_member_activity();

alter table public.member_directory enable row level security;

-- Nesta tabela há somente dados que a pessoa autorizou publicar.
revoke all on table public.member_directory from anon, authenticated;
grant select on table public.member_directory to anon;
grant select, insert, update, delete on table public.member_directory to authenticated;

drop policy if exists member_directory_read on public.member_directory;
create policy member_directory_read
  on public.member_directory for select
  to anon, authenticated
  using (true);

drop policy if exists member_directory_insert_own on public.member_directory;
create policy member_directory_insert_own
  on public.member_directory for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists member_directory_update_own on public.member_directory;
create policy member_directory_update_own
  on public.member_directory for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists member_directory_delete_own on public.member_directory;
create policy member_directory_delete_own
  on public.member_directory for delete
  to authenticated
  using ((select auth.uid()) = id);
