-- ============================================================================
--  SEED — Lazio 1999-00 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Lazio' and s.anno = '1999-2000'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Angelo', 'Peruzzi', 'Angelo Peruzzi', 'Italia'),
  ('Luca', 'Marchegiani', 'Luca Marchegiani', 'Italia'),
  ('Alessandro', 'Nesta', 'Alessandro Nesta', 'Italia'),
  ('Siniša', 'Mihajlović', 'Siniša Mihajlović', 'Serbia'),
  ('Fernando', 'Couto', 'Fernando Couto', 'Portogallo'),
  ('Giuseppe', 'Pancaro', 'Giuseppe Pancaro', 'Italia'),
  ('Giuseppe', 'Favalli', 'Giuseppe Favalli', 'Italia'),
  ('Paolo', 'Negro', 'Paolo Negro', 'Italia'),
  ('Juan Sebastián', 'Verón', 'Juan Sebastián Verón', 'Argentina'),
  ('Pavel', 'Nedvěd', 'Pavel Nedvěd', 'Rep. Ceca'),
  ('Diego', 'Simeone', 'Diego Simeone', 'Argentina'),
  ('Sérgio', 'Conceição', 'Sérgio Conceição', 'Portogallo'),
  ('Dejan', 'Stanković', 'Dejan Stanković', 'Serbia'),
  ('Marcelo', 'Salas', 'Marcelo Salas', 'Cile'),
  ('Alen', 'Bokšić', 'Alen Bokšić', 'Croazia'),
  ('Roberto', 'Mancini', 'Roberto Mancini', 'Italia'),
  ('Simone', 'Inzaghi', 'Simone Inzaghi', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Angelo Peruzzi', 'PORTIERE'),
  ('Luca Marchegiani', 'PORTIERE'),
  ('Alessandro Nesta', 'DIFENSORE'),
  ('Siniša Mihajlović', 'DIFENSORE'),
  ('Fernando Couto', 'DIFENSORE'),
  ('Giuseppe Pancaro', 'DIFENSORE'),
  ('Giuseppe Favalli', 'DIFENSORE'),
  ('Paolo Negro', 'DIFENSORE'),
  ('Juan Sebastián Verón', 'CENTROCAMPISTA'),
  ('Pavel Nedvěd', 'CENTROCAMPISTA'),
  ('Diego Simeone', 'CENTROCAMPISTA'),
  ('Sérgio Conceição', 'CENTROCAMPISTA'),
  ('Dejan Stanković', 'CENTROCAMPISTA'),
  ('Marcelo Salas', 'ATTACCANTE'),
  ('Alen Bokšić', 'ATTACCANTE'),
  ('Roberto Mancini', 'ATTACCANTE'),
  ('Simone Inzaghi', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Lazio')
                    and ts.season_id = (select season_id from seasons where anno = '1999-2000');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Angelo Peruzzi', 'POR', 86),
  ('Luca Marchegiani', 'POR', 79),
  ('Alessandro Nesta', 'DC', 87),
  ('Siniša Mihajlović', 'DC', 84),
  ('Fernando Couto', 'DC', 82),
  ('Giuseppe Pancaro', 'TS', 80),
  ('Giuseppe Favalli', 'TS', 80),
  ('Paolo Negro', 'TD', 79),
  ('Juan Sebastián Verón', 'CC', 88),
  ('Pavel Nedvěd', 'ES', 87),
  ('Diego Simeone', 'CDC', 83),
  ('Sérgio Conceição', 'ED', 82),
  ('Dejan Stanković', 'CC', 81),
  ('Marcelo Salas', 'ATT', 84),
  ('Alen Bokšić', 'ATT', 82),
  ('Roberto Mancini', 'TRQ', 80),
  ('Simone Inzaghi', 'ATT', 79)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Lazio')
     and season_id = (select season_id from seasons where anno = '1999-2000')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Sven-Göran', 'Eriksson', 'Sven-Göran Eriksson', 'Svezia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 84
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Lazio')
                    and ts.season_id = (select season_id from seasons where anno = '1999-2000')
where c.nome_completo = 'Sven-Göran Eriksson'
on conflict do nothing;
