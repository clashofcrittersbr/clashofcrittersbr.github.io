-- Edições automáticas dos seis eventos rotativos (Global).
-- Executar depois de 004_event_groups.sql. O jogo pode alterar a rotação:
-- confira as datas na interface do jogo antes de mudar a âncora/ordem.
begin;

create or replace function public.ensure_event_rotation()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  anchor timestamptz := '2026-11-26 00:00:00+00';
  codes text[] := array['treasure','race','artifacts','zobo','farm','fishing'];
  block_no integer;
  offset_no integer;
  v_code text;
  start_time timestamptz;
  event_info public.event_group_events%rowtype;
  created integer := 0;
  affected integer;
begin
  -- Apenas a edição corrente e as sete seguintes; chamadas repetidas são idempotentes.
  block_no := greatest(0, floor(extract(epoch from (clock_timestamp() - anchor)) / 259200)::integer);
  for offset_no in 0..7 loop
    v_code := codes[1 + ((block_no + offset_no) % 6)];
    start_time := anchor + ((block_no + offset_no) * interval '3 days');
    select * into event_info from public.event_group_events where event_group_events.code = v_code;
    if not found then raise exception 'Evento da rotação não cadastrado: %', v_code; end if;
    insert into public.event_group_editions
      (event_code, name, server_label, capacity, starts_at, ends_at, registration_closes_at)
    select v_code, to_char(start_time at time zone 'UTC', 'DD/MM/YYYY') || ' · rotação',
      'Global', event_info.capacity, start_time, start_time + interval '3 days',
      start_time + interval '3 days'
    where not exists (
      select 1 from public.event_group_editions existing
      where existing.event_code = v_code and existing.starts_at = start_time
    )
    on conflict do nothing;
    get diagnostics affected = row_count;
    created := created + affected;
  end loop;
  return created;
end;
$$;
revoke all on function public.ensure_event_rotation() from public;
grant execute on function public.ensure_event_rotation() to anon, authenticated;

-- A primeira visita também pode preparar as edições, mas esta chamada as publica
-- imediatamente após a migração, sem precisar de um acesso à página.
select public.ensure_event_rotation();
commit;
