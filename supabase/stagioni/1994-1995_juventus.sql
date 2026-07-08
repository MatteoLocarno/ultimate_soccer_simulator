-- ============================================================================
--  SEED — Juventus 1994-95 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Juventus' and s.anno = '1994-1995'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Angelo', 'Peruzzi', 'Angelo Peruzzi', 'Italia'),
  ('Michelangelo', 'Rampulla', 'Michelangelo Rampulla', 'Italia'),
  ('Ciro', 'Ferrara', 'Ciro Ferrara', 'Italia'),
  ('Pietro', 'Vierchowod', 'Pietro Vierchowod', 'Italia'),
  ('Moreno', 'Torricelli', 'Moreno Torricelli', 'Italia'),
  ('Sergio', 'Porrini', 'Sergio Porrini', 'Italia'),
  ('Luca', 'Fusi', 'Luca Fusi', 'Italia'),
  ('Antonio', 'Conte', 'Antonio Conte', 'Italia'),
  ('Didier', 'Deschamps', 'Didier Deschamps', 'Francia'),
  ('Paulo', 'Sousa', 'Paulo Sousa', 'Portogallo'),
  ('Angelo', 'Di Livio', 'Angelo Di Livio', 'Italia'),
  ('Andrea', 'Fortunato', 'Andrea Fortunato', 'Italia'),
  ('Alessio', 'Tacchinardi', 'Alessio Tacchinardi', 'Italia'),
  ('Roberto', 'Baggio', 'Roberto Baggio', 'Italia'),
  ('Gianluca', 'Vialli', 'Gianluca Vialli', 'Italia'),
  ('Fabrizio', 'Ravanelli', 'Fabrizio Ravanelli', 'Italia'),
  ('Alessandro', 'Del Piero', 'Alessandro Del Piero', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Angelo Peruzzi', 'PORTIERE'),
  ('Michelangelo Rampulla', 'PORTIERE'),
  ('Ciro Ferrara', 'DIFENSORE'),
  ('Pietro Vierchowod', 'DIFENSORE'),
  ('Moreno Torricelli', 'DIFENSORE'),
  ('Sergio Porrini', 'DIFENSORE'),
  ('Luca Fusi', 'DIFENSORE'),
  ('Antonio Conte', 'CENTROCAMPISTA'),
  ('Didier Deschamps', 'CENTROCAMPISTA'),
  ('Paulo Sousa', 'CENTROCAMPISTA'),
  ('Angelo Di Livio', 'CENTROCAMPISTA'),
  ('Andrea Fortunato', 'CENTROCAMPISTA'),
  ('Alessio Tacchinardi', 'CENTROCAMPISTA'),
  ('Roberto Baggio', 'ATTACCANTE'),
  ('Gianluca Vialli', 'ATTACCANTE'),
  ('Fabrizio Ravanelli', 'ATTACCANTE'),
  ('Alessandro Del Piero', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Juventus')
                    and ts.season_id = (select season_id from seasons where anno = '1994-1995');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Angelo Peruzzi', 'POR', 86),
  ('Michelangelo Rampulla', 'POR', 72),
  ('Ciro Ferrara', 'DC', 84),
  ('Pietro Vierchowod', 'DC', 82),
  ('Moreno Torricelli', 'TD', 78),
  ('Sergio Porrini', 'TS', 77),
  ('Luca Fusi', 'TS', 75),
  ('Antonio Conte', 'CC', 82),
  ('Didier Deschamps', 'CDC', 84),
  ('Paulo Sousa', 'CDC', 84),
  ('Angelo Di Livio', 'ES', 78),
  ('Andrea Fortunato', 'ES', 76),
  ('Alessio Tacchinardi', 'CC', 73),
  ('Roberto Baggio', 'TRQ', 91),
  ('Gianluca Vialli', 'ATT', 88),
  ('Fabrizio Ravanelli', 'ATT', 84),
  ('Alessandro Del Piero', 'TRQ', 80)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Juventus')
     and season_id = (select season_id from seasons where anno = '1994-1995')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Marcello', 'Lippi', 'Marcello Lippi', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 91
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Juventus')
                    and ts.season_id = (select season_id from seasons where anno = '1994-1995')
where c.nome_completo = 'Marcello Lippi'
on conflict do nothing;
