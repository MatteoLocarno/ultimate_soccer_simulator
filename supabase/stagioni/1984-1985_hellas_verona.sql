-- ============================================================================
--  SEED — Hellas Verona 1984-85 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Hellas Verona' and s.anno = '1984-1985'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Claudio', 'Garella', 'Claudio Garella', 'Italia'),
  ('Giuliano', 'Giuliani', 'Giuliano Giuliani', 'Italia'),
  ('Hans-Peter', 'Briegel', 'Hans-Peter Briegel', 'Germania'),
  ('Roberto', 'Tricella', 'Roberto Tricella', 'Italia'),
  ('Luciano', 'Marangon', 'Luciano Marangon', 'Italia'),
  ('Mauro', 'Ferroni', 'Mauro Ferroni', 'Italia'),
  ('Silvano', 'Fontolan', 'Silvano Fontolan', 'Italia'),
  ('Antonio', 'Di Gennaro', 'Antonio Di Gennaro', 'Italia'),
  ('Pietro', 'Fanna', 'Pietro Fanna', 'Italia'),
  ('Domenico', 'Volpati', 'Domenico Volpati', 'Italia'),
  ('Luciano', 'Bruni', 'Luciano Bruni', 'Italia'),
  ('Sergio', 'Sacchetti', 'Sergio Sacchetti', 'Italia'),
  ('Preben', 'Elkjær', 'Preben Elkjær', 'Danimarca'),
  ('Giuseppe', 'Galderisi', 'Giuseppe Galderisi', 'Italia'),
  ('Domenico', 'Turchetta', 'Domenico Turchetta', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Claudio Garella', 'PORTIERE'),
  ('Giuliano Giuliani', 'PORTIERE'),
  ('Hans-Peter Briegel', 'DIFENSORE'),
  ('Roberto Tricella', 'DIFENSORE'),
  ('Luciano Marangon', 'DIFENSORE'),
  ('Mauro Ferroni', 'DIFENSORE'),
  ('Silvano Fontolan', 'DIFENSORE'),
  ('Antonio Di Gennaro', 'CENTROCAMPISTA'),
  ('Pietro Fanna', 'CENTROCAMPISTA'),
  ('Domenico Volpati', 'CENTROCAMPISTA'),
  ('Luciano Bruni', 'CENTROCAMPISTA'),
  ('Sergio Sacchetti', 'CENTROCAMPISTA'),
  ('Preben Elkjær', 'ATTACCANTE'),
  ('Giuseppe Galderisi', 'ATTACCANTE'),
  ('Domenico Turchetta', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Hellas Verona')
                    and ts.season_id = (select season_id from seasons where anno = '1984-1985');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Claudio Garella', 'POR', 79),
  ('Giuliano Giuliani', 'POR', 71),
  ('Hans-Peter Briegel', 'DC', 82),
  ('Roberto Tricella', 'DC', 79),
  ('Luciano Marangon', 'TS', 75),
  ('Mauro Ferroni', 'TD', 74),
  ('Silvano Fontolan', 'DC', 73),
  ('Antonio Di Gennaro', 'CC', 80),
  ('Pietro Fanna', 'ED', 77),
  ('Domenico Volpati', 'CDC', 75),
  ('Luciano Bruni', 'CC', 73),
  ('Sergio Sacchetti', 'CC', 72),
  ('Preben Elkjær', 'ATT', 86),
  ('Giuseppe Galderisi', 'ATT', 80),
  ('Domenico Turchetta', 'ATT', 72)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Hellas Verona')
     and season_id = (select season_id from seasons where anno = '1984-1985')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Osvaldo', 'Bagnoli', 'Osvaldo Bagnoli', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 82
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Hellas Verona')
                    and ts.season_id = (select season_id from seasons where anno = '1984-1985')
where c.nome_completo = 'Osvaldo Bagnoli'
on conflict do nothing;
