-- ============================================================================
--  SEED — Juventus 2002-03 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Juventus' and s.anno = '2002-2003'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Gianluigi', 'Buffon', 'Gianluigi Buffon', 'Italia'),
  ('Antonio', 'Chimenti', 'Antonio Chimenti', 'Italia'),
  ('Lilian', 'Thuram', 'Lilian Thuram', 'Francia'),
  ('Paolo', 'Montero', 'Paolo Montero', 'Uruguay'),
  ('Gianluca', 'Zambrotta', 'Gianluca Zambrotta', 'Italia'),
  ('Ciro', 'Ferrara', 'Ciro Ferrara', 'Italia'),
  ('Igor', 'Tudor', 'Igor Tudor', 'Croazia'),
  ('Mark', 'Iuliano', 'Mark Iuliano', 'Italia'),
  ('Pavel', 'Nedvěd', 'Pavel Nedvěd', 'Rep. Ceca'),
  ('Edgar', 'Davids', 'Edgar Davids', 'Paesi Bassi'),
  ('Mauro', 'Camoranesi', 'Mauro Camoranesi', 'Italia'),
  ('Alessio', 'Tacchinardi', 'Alessio Tacchinardi', 'Italia'),
  ('Antonio', 'Conte', 'Antonio Conte', 'Italia'),
  ('Alessandro', 'Del Piero', 'Alessandro Del Piero', 'Italia'),
  ('David', 'Trezeguet', 'David Trezeguet', 'Francia'),
  ('Marcelo', 'Salas', 'Marcelo Salas', 'Cile'),
  ('Marco', 'Di Vaio', 'Marco Di Vaio', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Gianluigi Buffon', 'PORTIERE'),
  ('Antonio Chimenti', 'PORTIERE'),
  ('Lilian Thuram', 'DIFENSORE'),
  ('Paolo Montero', 'DIFENSORE'),
  ('Gianluca Zambrotta', 'DIFENSORE'),
  ('Ciro Ferrara', 'DIFENSORE'),
  ('Igor Tudor', 'DIFENSORE'),
  ('Mark Iuliano', 'DIFENSORE'),
  ('Pavel Nedvěd', 'CENTROCAMPISTA'),
  ('Edgar Davids', 'CENTROCAMPISTA'),
  ('Mauro Camoranesi', 'CENTROCAMPISTA'),
  ('Alessio Tacchinardi', 'CENTROCAMPISTA'),
  ('Antonio Conte', 'CENTROCAMPISTA'),
  ('Alessandro Del Piero', 'ATTACCANTE'),
  ('David Trezeguet', 'ATTACCANTE'),
  ('Marcelo Salas', 'ATTACCANTE'),
  ('Marco Di Vaio', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Juventus')
                    and ts.season_id = (select season_id from seasons where anno = '2002-2003');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Gianluigi Buffon', 'POR', 89),
  ('Antonio Chimenti', 'POR', 70),
  ('Lilian Thuram', 'TD', 87),
  ('Paolo Montero', 'DC', 83),
  ('Gianluca Zambrotta', 'TS', 84),
  ('Ciro Ferrara', 'DC', 82),
  ('Igor Tudor', 'DC', 80),
  ('Mark Iuliano', 'DC', 78),
  ('Pavel Nedvěd', 'ES', 89),
  ('Edgar Davids', 'CDC', 85),
  ('Mauro Camoranesi', 'ED', 82),
  ('Alessio Tacchinardi', 'CC', 80),
  ('Antonio Conte', 'CDC', 79),
  ('Alessandro Del Piero', 'TRQ', 88),
  ('David Trezeguet', 'ATT', 86),
  ('Marcelo Salas', 'ATT', 80),
  ('Marco Di Vaio', 'ATT', 80)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Juventus')
     and season_id = (select season_id from seasons where anno = '2002-2003')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Marcello', 'Lippi', 'Marcello Lippi', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 91
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Juventus')
                    and ts.season_id = (select season_id from seasons where anno = '2002-2003')
where c.nome_completo = 'Marcello Lippi'
on conflict do nothing;
