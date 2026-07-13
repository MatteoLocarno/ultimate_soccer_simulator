-- ============================================================================
--  DINASTIA SCUDETTO — CICLO DI VITA DEI TORNEI + SCHEDULAZIONE (pg_cron)
-- ----------------------------------------------------------------------------
--  · pvp_torneo_corrente()  crea/ritorna il torneo della settimana in corso
--    (fusi orari Europe/Rome). Chiamabile anche dal client per assicurarsi
--    che il torneo esista.
--  · pvp_rollover()         il job orario: apre la nuova settimana, chiude le
--    iscrizioni scadute (sabato 12:00) e, alla rivelazione (domenica 12:00),
--    invoca la Edge Function che simula il campionato e assegna lo Scudetto.
--
--  Applicare dopo 01_schema.sql e 02_rls.sql.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
--  Config: URL + chiave della Edge Function (letti da pvp_rollover). Riempire
--  con i valori del proprio progetto (vedi README).
-- ---------------------------------------------------------------------------
create table if not exists pvp_config (
  chiave text primary key,
  valore text
);
-- Esempio (da eseguire a mano coi valori veri, NON committare la service_key):
--   insert into pvp_config (chiave, valore) values
--     ('edge_url', 'https://<PROJECT_REF>.functions.supabase.co/pvp-simula'),
--     ('service_key', '<SERVICE_ROLE_KEY>')
--   on conflict (chiave) do update set valore = excluded.valore;

-- ---------------------------------------------------------------------------
--  Torneo della settimana corrente (crea al volo se manca). SECURITY DEFINER:
--  così anche un client anonimo/loggato può assicurarne l'esistenza.
-- ---------------------------------------------------------------------------
create or replace function pvp_torneo_corrente()
returns pvp_tournaments
language plpgsql
security definer
set search_path = public
as $$
declare
  loc         timestamp;     -- lunedì 00:00 orario locale (Europe/Rome)
  monday_ts   timestamptz;
  chiusura_ts timestamptz;
  rivel_ts    timestamptz;
  sett        text;
  t           pvp_tournaments;
begin
  loc         := date_trunc('week', (now() at time zone 'Europe/Rome'));
  monday_ts   := loc at time zone 'Europe/Rome';
  chiusura_ts := (loc + interval '5 days 12 hours') at time zone 'Europe/Rome';  -- sab 12:00
  rivel_ts    := (loc + interval '6 days 12 hours') at time zone 'Europe/Rome';  -- dom 12:00
  sett        := to_char(loc, 'IYYY"-W"IW');

  insert into pvp_tournaments (settimana, apertura, chiusura_iscrizioni, rivelazione, seed, stato)
  values (sett, monday_ts, chiusura_ts, rivel_ts, sett, 'aperto')
  on conflict (settimana) do nothing;

  select * into t from pvp_tournaments where settimana = sett;
  return t;
end;
$$;

grant execute on function pvp_torneo_corrente() to anon, authenticated;

-- ---------------------------------------------------------------------------
--  Invoca la Edge Function di simulazione per un torneo (via pg_net).
-- ---------------------------------------------------------------------------
create or replace function pvp_invoca_simulazione(p_torneo bigint)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_url text;
  v_key text;
begin
  select valore into v_url from pvp_config where chiave = 'edge_url';
  select valore into v_key from pvp_config where chiave = 'service_key';
  if v_url is null then
    raise notice 'pvp_config.edge_url mancante: simulazione non invocata per torneo %', p_torneo;
    return;
  end if;
  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || coalesce(v_key, '')),
    body    := jsonb_build_object('tournament_id', p_torneo)
  );
end;
$$;

-- ---------------------------------------------------------------------------
--  Rollover orario: crea la settimana nuova, chiude le iscrizioni scadute e
--  fa scattare la simulazione alla rivelazione.
-- ---------------------------------------------------------------------------
create or replace function pvp_rollover()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r pvp_tournaments;
begin
  -- assicura che il torneo di questa settimana esista
  perform pvp_torneo_corrente();

  -- sabato 12:00: iscrizioni chiuse
  update pvp_tournaments
     set stato = 'chiuso'
   where stato = 'aperto'
     and now() >= chiusura_iscrizioni;

  -- domenica 12:00: simula e proclama (idempotente: solo i 'chiuso' scaduti,
  -- la Edge Function poi li porta a 'concluso')
  for r in
    select * from pvp_tournaments
     where stato = 'chiuso'
       and now() >= rivelazione
  loop
    perform pvp_invoca_simulazione(r.id);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
--  Trigger: tieni aggiornato num_iscritti sul torneo.
-- ---------------------------------------------------------------------------
create or replace function pvp_aggiorna_num_iscritti()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update pvp_tournaments set num_iscritti = num_iscritti + 1 where id = new.tournament_id;
  elsif (tg_op = 'DELETE') then
    update pvp_tournaments set num_iscritti = greatest(0, num_iscritti - 1) where id = old.tournament_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_num_iscritti on pvp_entries;
create trigger trg_num_iscritti
  after insert or delete on pvp_entries
  for each row execute function pvp_aggiorna_num_iscritti();

-- ---------------------------------------------------------------------------
--  Trigger: blinda le statistiche del profilo. Gli aggiornamenti dei client
--  (ruolo 'authenticated'/'anon') non possono toccare scudetti/partecipazioni/
--  miglior_piazza — li cambia solo il backend (Edge Function, service_role).
-- ---------------------------------------------------------------------------
create or replace function profiles_blinda_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    new.scudetti       := old.scudetti;
    new.partecipazioni := old.partecipazioni;
    new.miglior_piazza := old.miglior_piazza;
  end if;
  new.aggiornato_il := now();
  return new;
end;
$$;

drop trigger if exists trg_blinda_stats on profiles;
create trigger trg_blinda_stats
  before update on profiles
  for each row execute function profiles_blinda_stats();

-- ---------------------------------------------------------------------------
--  Schedulazione: rollover ogni 10 minuti (risoluzione ampiamente sufficiente
--  per scadenze all'ora tonda).
-- ---------------------------------------------------------------------------
-- Rimuove un'eventuale schedulazione precedente con lo stesso nome, poi crea.
select cron.unschedule('pvp_rollover')
  where exists (select 1 from cron.job where jobname = 'pvp_rollover');

select cron.schedule('pvp_rollover', '*/10 * * * *', $$ select pvp_rollover(); $$);
