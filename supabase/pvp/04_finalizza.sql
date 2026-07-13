-- ============================================================================
--  DINASTIA SCUDETTO — FINALIZZAZIONE TORNEO (chiamata dalla Edge Function)
-- ----------------------------------------------------------------------------
--  pvp_finalizza() scrive la classifica ufficiale, assegna lo Scudetto e
--  aggiorna le statistiche dei profili — tutto in un'unica transazione e in
--  modo IDEMPOTENTE (se il torneo è già 'concluso' non fa nulla, così un
--  eventuale doppio invio del cron non assegna scudetti doppi).
--
--  p_standings: array JSON di righe, una per squadra del campionato simulato:
--    { posizione, pos_iscritti, entry_id, user_id, nickname, nome_squadra,
--      colore, is_utente, punti, giocate, vinte, pareggiate, perse, gf, gs }
--
--  Applicare dopo 03_lifecycle_pgcron.sql.
-- ============================================================================

create or replace function pvp_finalizza(
  p_torneo        bigint,
  p_campione      uuid,
  p_campione_nick text,
  p_standings     jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stato text;
  v_num   int;
begin
  select stato into v_stato from pvp_tournaments where id = p_torneo for update;
  if v_stato is null then
    raise exception 'pvp_finalizza: torneo % inesistente', p_torneo;
  end if;
  if v_stato = 'concluso' then
    return;  -- già finalizzato: idempotente
  end if;

  -- Classifica ufficiale
  delete from pvp_results where tournament_id = p_torneo;
  insert into pvp_results (
    tournament_id, posizione, entry_id, user_id, nickname, nome_squadra,
    colore, is_utente, punti, giocate, vinte, pareggiate, perse, gf, gs)
  select
    p_torneo,
    (r->>'posizione')::int,
    nullif(r->>'entry_id','')::bigint,
    nullif(r->>'user_id','')::uuid,
    r->>'nickname',
    r->>'nome_squadra',
    r->>'colore',
    coalesce((r->>'is_utente')::boolean, false),
    coalesce((r->>'punti')::int, 0),
    coalesce((r->>'giocate')::int, 0),
    coalesce((r->>'vinte')::int, 0),
    coalesce((r->>'pareggiate')::int, 0),
    coalesce((r->>'perse')::int, 0),
    coalesce((r->>'gf')::int, 0),
    coalesce((r->>'gs')::int, 0)
  from jsonb_array_elements(p_standings) as r;

  select count(*) into v_num
  from jsonb_array_elements(p_standings) r
  where coalesce((r->>'is_utente')::boolean, false);

  -- Statistiche iscritti: +1 partecipazione, miglior piazzamento (tra iscritti)
  update profiles p set
    partecipazioni = p.partecipazioni + 1,
    miglior_piazza = least(coalesce(p.miglior_piazza, 2147483647), s.pos)
  from (
    select (r->>'user_id')::uuid as uid, (r->>'pos_iscritti')::int as pos
    from jsonb_array_elements(p_standings) r
    where coalesce((r->>'is_utente')::boolean, false)
      and nullif(r->>'user_id','') is not null
  ) s
  where p.id = s.uid;

  -- Scudetto al campione
  if p_campione is not null then
    update profiles set scudetti = scudetti + 1 where id = p_campione;
  end if;

  -- Torneo concluso
  update pvp_tournaments set
    stato             = 'concluso',
    campione_user_id  = p_campione,
    campione_nickname = p_campione_nick,
    num_iscritti      = v_num
  where id = p_torneo;
end;
$$;
