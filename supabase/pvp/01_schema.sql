-- ============================================================================
--  DINASTIA SCUDETTO — SCHEMA PvP (sfida settimanale online)
-- ----------------------------------------------------------------------------
--  Ciclo settimanale:
--    · lunedì 00:00 (Europe/Rome)  → si apre un nuovo torneo, iscrizioni aperte
--    · sabato 12:00                → iscrizioni CHIUSE (nessun nuovo draft)
--    · domenica 12:00              → RIVELAZIONE: si simula un campionato tra
--                                     tutte le squadre iscritte e si assegna lo
--                                     Scudetto al miglior iscritto in classifica
--
--  Tabelle:
--    profiles          — account pubblico (nickname, scudetti vinti)
--    pvp_tournaments   — un torneo per settimana
--    pvp_entries       — la rosa draftata da un utente per un torneo
--    pvp_results       — classifica finale ufficiale del campionato simulato
--
--  Applicare questo file per primo, poi 02_rls.sql e 03_lifecycle_pgcron.sql.
--  (dashboard Supabase → SQL editor, oppure MCP apply_migration.)
-- ============================================================================

-- Ricerca case-insensitive sul nickname (unicità "Marco" == "marco").
create extension if not exists citext;

-- ---------------------------------------------------------------------------
--  profiles — profilo pubblico dell'utente. L'account vero è in auth.users;
--  qui vivono nickname e statistiche mostrate nelle classifiche.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  nickname       citext not null unique
                   check (char_length(nickname) between 3 and 20
                          and nickname ~ '^[A-Za-z0-9_ ]+$'),
  scudetti       int  not null default 0,
  partecipazioni int  not null default 0,
  miglior_piazza int,                        -- miglior posizione mai ottenuta
  creato_il      timestamptz not null default now(),
  aggiornato_il  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  pvp_tournaments — un torneo a settimana.
-- ---------------------------------------------------------------------------
create table if not exists pvp_tournaments (
  id                   bigint generated always as identity primary key,
  settimana            text not null unique,           -- es. "2026-W28"
  apertura             timestamptz not null,           -- lunedì 00:00
  chiusura_iscrizioni  timestamptz not null,           -- sabato 12:00
  rivelazione          timestamptz not null,           -- domenica 12:00
  seed                 text not null,                  -- seme RNG (= settimana)
  stato                text not null default 'aperto'
                         check (stato in ('aperto','chiuso','concluso')),
  num_iscritti         int  not null default 0,
  campione_user_id     uuid references profiles (id) on delete set null,
  campione_nickname    text,
  creato_il            timestamptz not null default now()
);

create index if not exists idx_tornei_stato on pvp_tournaments (stato);

-- ---------------------------------------------------------------------------
--  pvp_entries — la squadra draftata da un utente per un torneo.
--  `titolari`: array di 11 oggetti { nome, cognome, ruolo, overall, x, y }.
--  `allenatore`: { nome, cognome, overall } | null.
--  `forza`: media overall titolari + bonus allenatore, precalcolata lato
--  client per anteprime/ordinamenti (NON autorevole: la simulazione ufficiale
--  la ricalcola dai titolari).
-- ---------------------------------------------------------------------------
create table if not exists pvp_entries (
  id            bigint generated always as identity primary key,
  tournament_id bigint not null references pvp_tournaments (id) on delete cascade,
  user_id       uuid   not null references profiles (id) on delete cascade,
  nickname      text   not null,                 -- snapshot al momento dell'iscrizione
  nome_squadra  text   not null,
  colore        text   not null default '#3f6b3a',
  modulo        text,
  titolari      jsonb  not null,
  allenatore    jsonb,
  capitano      text,
  forza         numeric not null default 0,
  creato_il     timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  unique (tournament_id, user_id)
);

create index if not exists idx_entries_torneo on pvp_entries (tournament_id);

-- ---------------------------------------------------------------------------
--  pvp_results — classifica finale ufficiale del campionato simulato di un
--  torneo (scritta dalla Edge Function alla rivelazione). Una riga per
--  squadra: sia gli iscritti reali (is_utente=true) sia le eventuali squadre
--  storiche "riempitive" quando gli iscritti sono meno di 20.
-- ---------------------------------------------------------------------------
create table if not exists pvp_results (
  id            bigint generated always as identity primary key,
  tournament_id bigint not null references pvp_tournaments (id) on delete cascade,
  posizione     int not null,
  entry_id      bigint references pvp_entries (id) on delete set null,
  user_id       uuid,
  nickname      text,
  nome_squadra  text not null,
  colore        text,
  is_utente     boolean not null default false,
  punti         int not null default 0,
  giocate       int not null default 0,
  vinte         int not null default 0,
  pareggiate    int not null default 0,
  perse         int not null default 0,
  gf            int not null default 0,
  gs            int not null default 0,
  creato_il     timestamptz not null default now(),
  unique (tournament_id, posizione)
);

create index if not exists idx_results_torneo on pvp_results (tournament_id);

-- ---------------------------------------------------------------------------
--  Vista classifica generale (albo): utenti ordinati per scudetti vinti.
-- ---------------------------------------------------------------------------
create or replace view pvp_classifica_generale as
  select
    id as user_id,
    nickname,
    scudetti,
    partecipazioni,
    miglior_piazza,
    rank() over (order by scudetti desc, partecipazioni desc) as posizione
  from profiles
  where partecipazioni > 0 or scudetti > 0;
