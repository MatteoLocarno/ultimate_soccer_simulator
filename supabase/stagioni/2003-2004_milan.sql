-- ============================================================================
--  SEED — Milan 2003-04 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Milan' and s.anno = '2003-2004'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Dida', '', 'Dida', 'Brasile'),
  ('Christian', 'Abbiati', 'Christian Abbiati', 'Italia'),
  ('Paolo', 'Maldini', 'Paolo Maldini', 'Italia'),
  ('Alessandro', 'Nesta', 'Alessandro Nesta', 'Italia'),
  ('Cafu', '', 'Cafu', 'Brasile'),
  ('Jaap', 'Stam', 'Jaap Stam', 'Paesi Bassi'),
  ('Kakha', 'Kaladze', 'Kakha Kaladze', 'Georgia'),
  ('Alessandro', 'Costacurta', 'Alessandro Costacurta', 'Italia'),
  ('Andrea', 'Pirlo', 'Andrea Pirlo', 'Italia'),
  ('Clarence', 'Seedorf', 'Clarence Seedorf', 'Paesi Bassi'),
  ('Gennaro', 'Gattuso', 'Gennaro Gattuso', 'Italia'),
  ('Manuel', 'Rui Costa', 'Manuel Rui Costa', 'Portogallo'),
  ('Massimo', 'Ambrosini', 'Massimo Ambrosini', 'Italia'),
  ('Andriy', 'Shevchenko', 'Andriy Shevchenko', 'Ucraina'),
  ('Kaká', '', 'Kaká', 'Brasile'),
  ('Filippo', 'Inzaghi', 'Filippo Inzaghi', 'Italia'),
  ('Jon Dahl', 'Tomasson', 'Jon Dahl Tomasson', 'Danimarca')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Dida', 'PORTIERE'),
  ('Christian Abbiati', 'PORTIERE'),
  ('Paolo Maldini', 'DIFENSORE'),
  ('Alessandro Nesta', 'DIFENSORE'),
  ('Cafu', 'DIFENSORE'),
  ('Jaap Stam', 'DIFENSORE'),
  ('Kakha Kaladze', 'DIFENSORE'),
  ('Alessandro Costacurta', 'DIFENSORE'),
  ('Andrea Pirlo', 'CENTROCAMPISTA'),
  ('Clarence Seedorf', 'CENTROCAMPISTA'),
  ('Gennaro Gattuso', 'CENTROCAMPISTA'),
  ('Manuel Rui Costa', 'CENTROCAMPISTA'),
  ('Massimo Ambrosini', 'CENTROCAMPISTA'),
  ('Andriy Shevchenko', 'ATTACCANTE'),
  ('Kaká', 'ATTACCANTE'),
  ('Filippo Inzaghi', 'ATTACCANTE'),
  ('Jon Dahl Tomasson', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Milan')
                    and ts.season_id = (select season_id from seasons where anno = '2003-2004');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Dida', 'POR', 85),
  ('Christian Abbiati', 'POR', 79),
  ('Paolo Maldini', 'TS', 87),
  ('Alessandro Nesta', 'DC', 88),
  ('Cafu', 'TD', 84),
  ('Jaap Stam', 'DC', 84),
  ('Kakha Kaladze', 'DC', 79),
  ('Alessandro Costacurta', 'DC', 78),
  ('Andrea Pirlo', 'CDC', 87),
  ('Clarence Seedorf', 'CC', 86),
  ('Gennaro Gattuso', 'CDC', 83),
  ('Manuel Rui Costa', 'CC', 84),
  ('Massimo Ambrosini', 'CC', 80),
  ('Andriy Shevchenko', 'ATT', 92),
  ('Kaká', 'TRQ', 88),
  ('Filippo Inzaghi', 'ATT', 84),
  ('Jon Dahl Tomasson', 'ATT', 80)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Milan')
     and season_id = (select season_id from seasons where anno = '2003-2004')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Carlo', 'Ancelotti', 'Carlo Ancelotti', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 90
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Milan')
                    and ts.season_id = (select season_id from seasons where anno = '2003-2004')
where c.nome_completo = 'Carlo Ancelotti'
on conflict do nothing;
