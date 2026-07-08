-- ============================================================================
--  SEED — Napoli 1989-90 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Napoli' and s.anno = '1989-1990'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Giuliano', 'Giuliani', 'Giuliano Giuliani', 'Italia'),
  ('Pino', 'Taglialatela', 'Pino Taglialatela', 'Italia'),
  ('Ciro', 'Ferrara', 'Ciro Ferrara', 'Italia'),
  ('Alessandro', 'Renica', 'Alessandro Renica', 'Italia'),
  ('Giovanni', 'Francini', 'Giovanni Francini', 'Italia'),
  ('Giancarlo', 'Corradini', 'Giancarlo Corradini', 'Italia'),
  ('Tebaldo', 'Bigliardi', 'Tebaldo Bigliardi', 'Italia'),
  ('Alemão', '', 'Alemão', 'Brasile'),
  ('Fernando', 'De Napoli', 'Fernando De Napoli', 'Italia'),
  ('Massimo', 'Crippa', 'Massimo Crippa', 'Italia'),
  ('Luca', 'Fusi', 'Luca Fusi', 'Italia'),
  ('Diego', 'Maradona', 'Diego Maradona', 'Argentina'),
  ('Careca', '', 'Careca', 'Brasile'),
  ('Andrea', 'Carnevale', 'Andrea Carnevale', 'Italia'),
  ('Gianfranco', 'Zola', 'Gianfranco Zola', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Giuliano Giuliani', 'PORTIERE'),
  ('Pino Taglialatela', 'PORTIERE'),
  ('Ciro Ferrara', 'DIFENSORE'),
  ('Alessandro Renica', 'DIFENSORE'),
  ('Giovanni Francini', 'DIFENSORE'),
  ('Giancarlo Corradini', 'DIFENSORE'),
  ('Tebaldo Bigliardi', 'DIFENSORE'),
  ('Alemão', 'CENTROCAMPISTA'),
  ('Fernando De Napoli', 'CENTROCAMPISTA'),
  ('Massimo Crippa', 'CENTROCAMPISTA'),
  ('Luca Fusi', 'CENTROCAMPISTA'),
  ('Diego Maradona', 'ATTACCANTE'),
  ('Careca', 'ATTACCANTE'),
  ('Andrea Carnevale', 'ATTACCANTE'),
  ('Gianfranco Zola', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Napoli')
                    and ts.season_id = (select season_id from seasons where anno = '1989-1990');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Giuliano Giuliani', 'POR', 79),
  ('Pino Taglialatela', 'POR', 71),
  ('Ciro Ferrara', 'DC', 83),
  ('Alessandro Renica', 'TS', 79),
  ('Giovanni Francini', 'TD', 77),
  ('Giancarlo Corradini', 'DC', 75),
  ('Tebaldo Bigliardi', 'DC', 73),
  ('Alemão', 'CDC', 84),
  ('Fernando De Napoli', 'CC', 82),
  ('Massimo Crippa', 'CC', 79),
  ('Luca Fusi', 'CDC', 76),
  ('Diego Maradona', 'TRQ', 96),
  ('Careca', 'ATT', 89),
  ('Andrea Carnevale', 'ATT', 80),
  ('Gianfranco Zola', 'TRQ', 76)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Napoli')
     and season_id = (select season_id from seasons where anno = '1989-1990')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Alberto', 'Bigon', 'Alberto Bigon', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 80
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Napoli')
                    and ts.season_id = (select season_id from seasons where anno = '1989-1990')
where c.nome_completo = 'Alberto Bigon'
on conflict do nothing;
