-- Times fixos e inscrições por edição. Executar no SQL Editor > Database.
-- Depende de 001_accounts.sql e 002_member_directory.sql. Não contém credenciais.
begin;

create table if not exists public.event_group_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.event_group_events (
  code text primary key,
  name text not null,
  capacity integer not null check (capacity between 2 and 20),
  entries_per_player integer not null default 1 check (entries_per_player between 1 and 4)
);
insert into public.event_group_events(code,name,capacity,entries_per_player) values
 ('artifacts','Aventura dos Artefatos',4,1),
 ('fishing','Concurso de Pesca',4,1),
 ('zobo','Tiro aos Zobos',4,1),
 ('farm','Fazenda · Cozy Farm',4,1),
 ('race','Marathon Party / Raft Race',4,1),
 ('treasure','Caça ao Tesouro · parceria',2,4),
 ('horde','Horda · dupla',2,1),
 ('goldrush','Corrida do Ouro · time da liga',4,1)
on conflict (code) do nothing;

create table if not exists public.event_group_editions (
  id uuid primary key default gen_random_uuid(),
  event_code text not null references public.event_group_events(code),
  name text not null check (char_length(btrim(name)) between 3 and 100),
  server_label text not null check (char_length(btrim(server_label)) between 2 and 80),
  capacity integer not null check (capacity between 2 and 20),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  registration_closes_at timestamptz not null,
  cancelled_at timestamptz,
  cancellation_reason text check (char_length(cancellation_reason) <= 300),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (registration_closes_at <= ends_at)
);
create table if not exists public.event_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 3 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  play_window text not null default '' check (char_length(play_window) <= 200),
  discord_url text not null default '' check (discord_url = '' or discord_url ~ '^https://(discord[.]gg/|discord[.]com/invite/)[A-Za-z0-9_-]+/?$'),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.event_group_members (
  group_id uuid not null references public.event_groups(id) on delete cascade,
  user_id uuid not null references public.member_directory(id) on delete cascade,
  status text not null check (status in ('pending','active')),
  created_at timestamptz not null default now(),
  primary key(group_id,user_id)
);
create table if not exists public.event_group_rosters (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.event_groups(id) on delete cascade,
  edition_id uuid not null references public.event_group_editions(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  note text not null default '' check (char_length(note) <= 1000),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  unique(group_id,edition_id,name)
);
create table if not exists public.event_group_signups (
  roster_id uuid not null references public.event_group_rosters(id) on delete cascade,
  user_id uuid not null references public.member_directory(id) on delete cascade,
  game_uid text not null check (char_length(btrim(game_uid)) between 1 and 80),
  status text not null check (status in ('pending','confirmed')),
  created_at timestamptz not null default now(),
  primary key(roster_id,user_id)
);
create index if not exists event_group_members_user on public.event_group_members(user_id,status);
create unique index if not exists event_group_editions_identity
  on public.event_group_editions(event_code, lower(btrim(server_label)), starts_at);
create index if not exists event_group_rosters_edition on public.event_group_rosters(edition_id);
create index if not exists event_group_signups_user on public.event_group_signups(user_id,status);

create or replace function public.is_event_groups_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.event_group_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_event_groups_admin() from public;
grant execute on function public.is_event_groups_admin() to anon, authenticated;

-- Leitura pública apenas de dados do módulo; nenhum acesso a profiles/auth.users.
alter table public.event_group_admins enable row level security;
alter table public.event_group_events enable row level security;
alter table public.event_group_editions enable row level security;
alter table public.event_groups enable row level security;
alter table public.event_group_members enable row level security;
alter table public.event_group_rosters enable row level security;
alter table public.event_group_signups enable row level security;
revoke all on public.event_group_admins, public.event_group_events, public.event_group_editions,
 public.event_groups, public.event_group_members, public.event_group_rosters, public.event_group_signups from public, anon, authenticated;
grant select on public.event_group_events, public.event_group_editions, public.event_groups,
 public.event_group_members, public.event_group_rosters, public.event_group_signups to anon, authenticated;

drop policy if exists event_groups_events_read on public.event_group_events;
create policy event_groups_events_read on public.event_group_events for select to anon, authenticated using (true);
drop policy if exists event_groups_editions_read on public.event_group_editions;
create policy event_groups_editions_read on public.event_group_editions for select to anon, authenticated using (true);
drop policy if exists event_groups_read on public.event_groups;
create policy event_groups_read on public.event_groups for select to anon, authenticated using (true);
drop policy if exists event_groups_rosters_read on public.event_group_rosters;
create policy event_groups_rosters_read on public.event_group_rosters for select to anon, authenticated using (true);
drop policy if exists event_groups_members_read on public.event_group_members;
create policy event_groups_members_read on public.event_group_members for select to anon, authenticated
 using (status = 'active' or user_id = (select auth.uid()) or exists
  (select 1 from public.event_groups g where g.id = group_id and g.owner_id = (select auth.uid())));
drop policy if exists event_groups_signups_read on public.event_group_signups;
create policy event_groups_signups_read on public.event_group_signups for select to anon, authenticated
 using (status = 'confirmed' or user_id = (select auth.uid()) or exists
  (select 1 from public.event_group_rosters r join public.event_groups g on g.id = r.group_id
   where r.id = roster_id and g.owner_id = (select auth.uid())));

-- Toda escrita passa por esta RPC. As permissões não dependem da interface.
create or replace function public.event_groups_apply(p_action text, p_data jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  target uuid;
  gid uuid;
  entity uuid;
  g public.event_groups%rowtype;
  r public.event_group_rosters%rowtype;
  e public.event_group_editions%rowtype;
  ev public.event_group_events%rowtype;
  occupied integer;
  registrations integer;
  partner uuid;
  requested_uid text;
begin
  if actor is null then raise exception 'Entre na sua conta para continuar.'; end if;
  if jsonb_typeof(p_data) is distinct from 'object' then raise exception 'Dados inválidos.'; end if;
  if p_action is null or p_action not in ('edition_create','edition_cancel','team_create','team_edit','team_archive','team_restore','team_transfer','team_request','team_leave','team_remove','member_approve','member_reject','roster_create','roster_edit','roster_cancel','signup_request','signup_approve','signup_reject','signup_remove','signup_cancel') then
    raise exception 'Ação desconhecida.';
  end if;

  if p_action in ('edition_create','edition_cancel') then
    if not public.is_event_groups_admin() then raise exception 'Apenas a administração pode gerenciar edições.'; end if;
    if p_action = 'edition_create' then
      select * into ev from public.event_group_events where code = p_data->>'event_code';
      if not found then raise exception 'Escolha um evento cadastrado.'; end if;
      if ev.code = 'treasure' and (p_data->>'capacity')::integer <> 2 then
        raise exception 'Cada parceria de Caça ao Tesouro tem dois participantes.';
      end if;
      insert into public.event_group_editions(event_code,name,server_label,capacity,starts_at,ends_at,registration_closes_at,created_by)
      values(ev.code,btrim(p_data->>'name'),btrim(p_data->>'server_label'),
       coalesce((p_data->>'capacity')::integer,ev.capacity),
       (p_data->>'starts_at')::timestamptz,(p_data->>'ends_at')::timestamptz,
       (p_data->>'registration_closes_at')::timestamptz,actor) returning id into entity;
      return entity;
    end if;
    select * into e from public.event_group_editions where id = (p_data->>'edition_id')::uuid for update;
    if not found then raise exception 'Edição não encontrada.'; end if;
    if char_length(btrim(coalesce(p_data->>'reason',''))) < 3 then raise exception 'Informe o motivo do cancelamento.'; end if;
    update public.event_group_editions set cancelled_at = now(), cancellation_reason = btrim(p_data->>'reason') where id = e.id;
    return e.id;
  end if;

  -- A adesão ao diretório público é revogável. Sair/cancelar continua permitido.
  if p_action not in ('team_leave','team_remove','team_archive','roster_cancel','signup_cancel','signup_remove','signup_reject','member_reject','team_transfer')
     and not exists(select 1 from public.member_directory where id = actor) then
    raise exception 'Cadastre seu Nick e UID e participe da lista pública de membros em Minha conta.';
  end if;

  if p_action = 'team_create' then
    insert into public.event_groups(owner_id,name,description,play_window,discord_url)
      values(actor,btrim(p_data->>'name'),coalesce(p_data->>'description',''),coalesce(p_data->>'play_window',''),coalesce(p_data->>'discord_url','')) returning id into gid;
    insert into public.event_group_members(group_id,user_id,status) values(gid,actor,'active');
    return gid;
  end if;

  if p_action like 'signup_%' or p_action in ('roster_cancel','roster_edit') then
    select * into r from public.event_group_rosters where id = (p_data->>'roster_id')::uuid;
    if not found then raise exception 'Inscrição não encontrada.'; end if;
    gid := r.group_id;
  else gid := (p_data->>'group_id')::uuid;
  end if;
  select * into g from public.event_groups where id = gid for update;
  if not found then raise exception 'Time não encontrado.'; end if;
  target := coalesce((p_data->>'user_id')::uuid,actor);

  if p_action in ('team_edit','team_archive','team_restore','team_transfer','team_remove','member_approve','member_reject','roster_create','roster_cancel','roster_edit','signup_approve','signup_reject','signup_remove')
     and g.owner_id <> actor then raise exception 'Apenas o líder pode fazer essa alteração.'; end if;
  if g.archived_at is not null and p_action not in ('team_leave','signup_cancel','team_restore') then raise exception 'Este time foi arquivado.'; end if;

  if p_action = 'team_edit' then
    update public.event_groups set name=btrim(p_data->>'name'),description=coalesce(p_data->>'description',''),
      play_window=coalesce(p_data->>'play_window',''),discord_url=coalesce(p_data->>'discord_url','') where id=gid;
  elsif p_action = 'team_request' then
    if exists(select 1 from public.event_group_members where group_id=gid and user_id=actor) then raise exception 'Você já participa ou aguarda aprovação.'; end if;
    insert into public.event_group_members(group_id,user_id,status) values(gid,actor,case when actor=g.owner_id then 'active' else 'pending' end);
  elsif p_action = 'member_approve' then
    update public.event_group_members set status='active' where group_id=gid and user_id=target and status='pending';
    if not found then raise exception 'Pedido não encontrado.'; end if;
  elsif p_action in ('member_reject','team_remove','team_leave') then
    if p_action = 'team_leave' then target := actor; end if;
    if target=g.owner_id then raise exception 'Transfira a liderança antes de sair.'; end if;
    if p_action='member_reject' then
      delete from public.event_group_members where group_id=gid and user_id=target and status='pending';
    else
      delete from public.event_group_members where group_id=gid and user_id=target;
      -- Preserva elencos já fechados, mas libera inscrições ainda abertas.
      delete from public.event_group_signups s using public.event_group_rosters rr, public.event_group_editions ee
        where s.roster_id=rr.id and rr.edition_id=ee.id and rr.group_id=gid and s.user_id=target
          and ee.registration_closes_at > now();
    end if;
  elsif p_action = 'team_transfer' then
    if not exists(select 1 from public.event_group_members where group_id=gid and user_id=target and status='active') then raise exception 'Escolha um integrante confirmado.'; end if;
    update public.event_groups set owner_id=target where id=gid;
  elsif p_action = 'team_archive' then
    if exists(select 1 from public.event_group_rosters rr join public.event_group_editions ee on ee.id=rr.edition_id
      where rr.group_id=gid and rr.cancelled_at is null and ee.cancelled_at is null and ee.ends_at>now()) then
      raise exception 'Cancele as inscrições abertas ou aguarde o fim das edições antes de arquivar.';
    end if;
    update public.event_groups set archived_at=now() where id=gid;
  elsif p_action = 'team_restore' then
    update public.event_groups set archived_at=null where id=gid;
  elsif p_action = 'roster_create' then
    select * into e from public.event_group_editions where id=(p_data->>'edition_id')::uuid for update;
    if not found then raise exception 'Edição não encontrada.'; end if;
    if e.cancelled_at is not null or clock_timestamp() >= e.registration_closes_at then raise exception 'As inscrições desta edição estão fechadas.'; end if;
    insert into public.event_group_rosters(group_id,edition_id,name,note)
      values(gid,e.id,btrim(p_data->>'name'),coalesce(p_data->>'note','')) returning id into entity;
    return entity;
  elsif p_action like 'signup_%' or p_action in ('roster_cancel','roster_edit') then
    -- Releitura depois do lock do time: outro pedido pode ter cancelado o
    -- elenco enquanto esta transação aguardava a mesma linha de liderança.
    select * into r from public.event_group_rosters where id=(p_data->>'roster_id')::uuid;
    -- Serializa confirmações da edição inteira: evita lotação e inscrição dupla
    -- mesmo quando pedidos de times diferentes chegam ao mesmo tempo.
    select * into e from public.event_group_editions where id=r.edition_id for update;
    if e.cancelled_at is not null or r.cancelled_at is not null then raise exception 'Esta inscrição foi cancelada.'; end if;
    if clock_timestamp() >= e.registration_closes_at then raise exception 'O elenco já foi fechado para esta edição.'; end if;
    if p_action='roster_cancel' then
      update public.event_group_rosters set cancelled_at=now() where id=r.id;
    elsif p_action='roster_edit' then
      update public.event_group_rosters set name=btrim(p_data->>'name'), note=coalesce(p_data->>'note','') where id=r.id;
    elsif p_action='signup_cancel' then
      delete from public.event_group_signups where roster_id=r.id and user_id=actor;
    elsif p_action='signup_reject' then
      delete from public.event_group_signups where roster_id=r.id and user_id=target and status='pending';
    elsif p_action='signup_remove' then
      delete from public.event_group_signups where roster_id=r.id and user_id=target;
    else
      if p_action='signup_request' then target := actor; end if;
      if not exists(select 1 from public.event_group_members where group_id=gid and user_id=target and status='active') then
        raise exception 'O jogador precisa ser aprovado no time fixo primeiro.';
      end if;
      select btrim(game_uid) into requested_uid from public.member_directory where id=target;
      -- Conta Google e conta Discord com o mesmo UID não ocupam duas vagas.
      if exists(select 1 from public.event_group_signups where roster_id=r.id and status='confirmed'
        and (user_id=target or lower(btrim(game_uid))=lower(requested_uid))) then
        raise exception 'Este jogador ou UID já está confirmado neste elenco.';
      end if;
      select * into ev from public.event_group_events where code=e.event_code;
      select count(*) into registrations from public.event_group_signups s
        join public.event_group_rosters rr on rr.id=s.roster_id
        where rr.edition_id=e.id and rr.cancelled_at is null and s.status='confirmed'
          and (s.user_id=target or lower(btrim(s.game_uid))=lower(requested_uid));
      if registrations >= ev.entries_per_player then raise exception 'O jogador já atingiu o limite de inscrições nesta edição.'; end if;
      select count(*) into occupied from public.event_group_signups where roster_id=r.id and status='confirmed';
      if occupied >= e.capacity then raise exception 'O elenco ficou completo. Atualize a página para conferir.'; end if;
      if p_action='signup_request' then
        if exists(select 1 from public.event_group_signups where roster_id=r.id and user_id=actor) then raise exception 'Você já está inscrito ou aguarda aprovação.'; end if;
        insert into public.event_group_signups(roster_id,user_id,game_uid,status) values(r.id,actor,requested_uid,'pending');
      end if;
      if p_action='signup_approve' or (p_action='signup_request' and actor=g.owner_id) then
        if ev.code='treasure' then
          select user_id into partner from public.event_group_signups where roster_id=r.id and status='confirmed' and user_id<>target limit 1;
          if partner is not null and exists(
            select 1 from public.event_group_rosters rr
            join public.event_group_signups a on a.roster_id=rr.id and a.status='confirmed'
              and (a.user_id=target or lower(btrim(a.game_uid))=lower(requested_uid))
            join public.event_group_signups b on b.roster_id=rr.id and b.status='confirmed'
              and (b.user_id=partner or lower(btrim(b.game_uid))=(select lower(btrim(game_uid)) from public.event_group_signups where roster_id=r.id and user_id=partner))
            where rr.edition_id=e.id and rr.id<>r.id and rr.cancelled_at is null
          ) then raise exception 'Esta dupla já está confirmada em outra parceria da edição.'; end if;
        end if;
        update public.event_group_signups set status='confirmed',game_uid=requested_uid where roster_id=r.id and user_id=target and status='pending';
        if not found then raise exception 'Pedido não encontrado.'; end if;
      end if;
    end if;
  else raise exception 'Ação desconhecida.';
  end if;
  return gid;
end;
$$;
revoke all on function public.event_groups_apply(text,jsonb) from public;
grant execute on function public.event_groups_apply(text,jsonb) to authenticated;
comment on function public.event_groups_apply(text,jsonb) is 'Escrita autorizada de times e inscrições; confirmações serializadas por edição, sem service_role no navegador.';
commit;
