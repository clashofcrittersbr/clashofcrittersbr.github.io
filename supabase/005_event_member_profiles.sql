-- Informações voluntárias para organização dos times de eventos.
-- Execute após 004_event_groups.sql no SQL Editor > Database.
-- Registros existentes permanecem; nível passa a ser exigido em novas participações.
begin;

alter table public.member_directory
  add column if not exists trainer_level integer,
  add column if not exists availability text,
  add column if not exists event_goal text;

alter table public.member_directory
  drop constraint if exists member_directory_trainer_level_check,
  add constraint member_directory_trainer_level_check
    check (trainer_level is null or trainer_level between 1 and 9999),
  drop constraint if exists member_directory_availability_check,
  add constraint member_directory_availability_check
    check (availability is null or char_length(btrim(availability)) <= 200),
  drop constraint if exists member_directory_event_goal_check,
  add constraint member_directory_event_goal_check
    check (event_goal is null or char_length(btrim(event_goal)) <= 120);

create or replace function public.require_event_member_level()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status in ('pending','active','confirmed')
    and not exists (
      select 1 from public.member_directory d
      where d.id = new.user_id and d.trainer_level is not null
    ) then
    raise exception 'Informe o nível da sua conta em Minha conta antes de participar de times ou elencos.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists event_group_member_level on public.event_group_members;
create trigger event_group_member_level
  before insert or update of status on public.event_group_members
  for each row execute function public.require_event_member_level();

drop trigger if exists event_group_signup_level on public.event_group_signups;
create trigger event_group_signup_level
  before insert or update of status on public.event_group_signups
  for each row execute function public.require_event_member_level();

commit;
