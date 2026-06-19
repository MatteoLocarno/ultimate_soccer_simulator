-- ============================================================================
--  SCHEMA SUPABASE — Dinastia Scudetto
--  Esegui questo file nell'editor SQL di Supabase (una sola volta), poi seed.sql.
-- ============================================================================

create table if not exists squadre (
  id      text primary key,
  squadra text not null,
  anno    text not null,
  colore  text
);

create table if not exists giocatori (
  id         bigint generated always as identity primary key,
  squadra_id text not null references squadre(id) on delete cascade,
  nome       text not null,
  cognome    text,
  ruolo      text not null check (ruolo in ('P','D','C','A')),
  overall    int  not null
);

create table if not exists allenatori (
  id      bigint generated always as identity primary key,
  nome    text not null,
  cognome text not null,
  overall int  not null
);

create index if not exists idx_giocatori_squadra on giocatori(squadra_id);

-- ----------------------------------------------------------------------------
--  Lettura pubblica (il gioco usa la publishable/anon key, sola lettura).
-- ----------------------------------------------------------------------------
alter table squadre    enable row level security;
alter table giocatori  enable row level security;
alter table allenatori enable row level security;

drop policy if exists "lettura pubblica squadre"    on squadre;
drop policy if exists "lettura pubblica giocatori"  on giocatori;
drop policy if exists "lettura pubblica allenatori" on allenatori;

create policy "lettura pubblica squadre"    on squadre    for select using (true);
create policy "lettura pubblica giocatori"  on giocatori  for select using (true);
create policy "lettura pubblica allenatori" on allenatori for select using (true);
