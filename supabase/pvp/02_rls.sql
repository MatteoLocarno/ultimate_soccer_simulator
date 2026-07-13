-- ============================================================================
--  DINASTIA SCUDETTO — RLS (Row Level Security) per il PvP
-- ----------------------------------------------------------------------------
--  Principi:
--    · profiles       — leggibili da tutti (classifiche pubbliche); ognuno
--                       scrive solo la propria riga.
--    · pvp_tournaments — leggibili da tutti; scritti solo dal backend
--                       (service_role / funzioni SECURITY DEFINER).
--    · pvp_entries    — REGOLA CHIAVE ANTI-COPIA: la rosa di un altro utente è
--                       leggibile SOLO dopo la chiusura iscrizioni del suo
--                       torneo (sabato 12:00). La propria è sempre leggibile.
--                       Iscrizione/modifica solo a torneo aperto e prima della
--                       scadenza.
--    · pvp_results    — leggibili da tutti; scritti solo dal backend.
--
--  Applicare dopo 01_schema.sql.
-- ============================================================================

alter table profiles         enable row level security;
alter table pvp_tournaments  enable row level security;
alter table pvp_entries      enable row level security;
alter table pvp_results      enable row level security;

-- ---------------------------------------------------------------------------
--  profiles
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select_all on profiles;
create policy profiles_select_all on profiles
  for select using (true);

drop policy if exists profiles_insert_self on profiles;
create policy profiles_insert_self on profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Nota: scudetti/partecipazioni/miglior_piazza vengono aggiornati SOLO dal
-- backend (Edge Function con service_role, che bypassa la RLS). Un client
-- potrebbe teoricamente modificarli via update_self: per blindarli si può
-- revocare l'update su quelle colonne (vedi 03) o gestirli con un trigger che
-- vieta variazioni non provenienti dal service_role.

-- ---------------------------------------------------------------------------
--  pvp_tournaments — sola lettura per i client
-- ---------------------------------------------------------------------------
drop policy if exists tornei_select_all on pvp_tournaments;
create policy tornei_select_all on pvp_tournaments
  for select using (true);

-- ---------------------------------------------------------------------------
--  pvp_entries
-- ---------------------------------------------------------------------------
-- Lettura: la propria entry sempre; quelle altrui solo dopo la chiusura
-- iscrizioni del torneo (così non si copia la rosa migliore prima del tempo).
drop policy if exists entries_select on pvp_entries;
create policy entries_select on pvp_entries
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from pvp_tournaments t
      where t.id = pvp_entries.tournament_id
        and now() >= t.chiusura_iscrizioni
    )
  );

-- Iscrizione: solo la propria, su un torneo aperto e non ancora scaduto.
drop policy if exists entries_insert on pvp_entries;
create policy entries_insert on pvp_entries
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from pvp_tournaments t
      where t.id = tournament_id
        and t.stato = 'aperto'
        and now() < t.chiusura_iscrizioni
    )
  );

-- Modifica: solo la propria, finché il torneo è aperto (si può rifare il draft
-- fino alla scadenza).
drop policy if exists entries_update on pvp_entries;
create policy entries_update on pvp_entries
  for update using (
    user_id = auth.uid()
    and exists (
      select 1 from pvp_tournaments t
      where t.id = pvp_entries.tournament_id
        and t.stato = 'aperto'
        and now() < t.chiusura_iscrizioni
    )
  ) with check (user_id = auth.uid());

-- Cancellazione: la propria, a torneo ancora aperto.
drop policy if exists entries_delete on pvp_entries;
create policy entries_delete on pvp_entries
  for delete using (
    user_id = auth.uid()
    and exists (
      select 1 from pvp_tournaments t
      where t.id = pvp_entries.tournament_id
        and t.stato = 'aperto'
        and now() < t.chiusura_iscrizioni
    )
  );

-- ---------------------------------------------------------------------------
--  pvp_results — sola lettura per i client
-- ---------------------------------------------------------------------------
drop policy if exists results_select_all on pvp_results;
create policy results_select_all on pvp_results
  for select using (true);
