-- ============================================================================
--  SEED — Napoli 1986-87 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Napoli' and s.anno = '1986-1987'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Claudio', 'Garella', 'Claudio Garella', 'Italia'),
  ('Raffaele', 'Di Fusco', 'Raffaele Di Fusco', 'Italia'),
  ('Ciro', 'Ferrara', 'Ciro Ferrara', 'Italia'),
  ('Alessandro', 'Renica', 'Alessandro Renica', 'Italia'),
  ('Moreno', 'Ferrario', 'Moreno Ferrario', 'Italia'),
  ('Giovanni', 'Francini', 'Giovanni Francini', 'Italia'),
  ('Tebaldo', 'Bigliardi', 'Tebaldo Bigliardi', 'Italia'),
  ('Fernando', 'De Napoli', 'Fernando De Napoli', 'Italia'),
  ('Salvatore', 'Bagni', 'Salvatore Bagni', 'Italia'),
  ('Francesco', 'Romano', 'Francesco Romano', 'Italia'),
  ('Eraldo', 'Pecci', 'Eraldo Pecci', 'Italia'),
  ('Diego', 'Maradona', 'Diego Maradona', 'Argentina'),
  ('Bruno', 'Giordano', 'Bruno Giordano', 'Italia'),
  ('Andrea', 'Carnevale', 'Andrea Carnevale', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Claudio Garella', 'PORTIERE'),
  ('Raffaele Di Fusco', 'PORTIERE'),
  ('Ciro Ferrara', 'DIFENSORE'),
  ('Alessandro Renica', 'DIFENSORE'),
  ('Moreno Ferrario', 'DIFENSORE'),
  ('Giovanni Francini', 'DIFENSORE'),
  ('Tebaldo Bigliardi', 'DIFENSORE'),
  ('Fernando De Napoli', 'CENTROCAMPISTA'),
  ('Salvatore Bagni', 'CENTROCAMPISTA'),
  ('Francesco Romano', 'CENTROCAMPISTA'),
  ('Eraldo Pecci', 'CENTROCAMPISTA'),
  ('Diego Maradona', 'ATTACCANTE'),
  ('Bruno Giordano', 'ATTACCANTE'),
  ('Andrea Carnevale', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Napoli')
                    and ts.season_id = (select season_id from seasons where anno = '1986-1987');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Claudio Garella', 'POR', 80),
  ('Raffaele Di Fusco', 'POR', 70),
  ('Ciro Ferrara', 'DC', 80),
  ('Alessandro Renica', 'TS', 79),
  ('Moreno Ferrario', 'DC', 76),
  ('Giovanni Francini', 'TD', 76),
  ('Tebaldo Bigliardi', 'DC', 73),
  ('Fernando De Napoli', 'CC', 81),
  ('Salvatore Bagni', 'CDC', 80),
  ('Francesco Romano', 'CC', 76),
  ('Eraldo Pecci', 'CC', 76),
  ('Diego Maradona', 'TRQ', 97),
  ('Bruno Giordano', 'ATT', 82),
  ('Andrea Carnevale', 'ATT', 80)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Napoli')
     and season_id = (select season_id from seasons where anno = '1986-1987')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Ottavio', 'Bianchi', 'Ottavio Bianchi', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 80
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Napoli')
                    and ts.season_id = (select season_id from seasons where anno = '1986-1987')
where c.nome_completo = 'Ottavio Bianchi'
on conflict do nothing;
