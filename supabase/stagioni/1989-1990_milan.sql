-- ============================================================================
--  SEED — Milan 1989-90 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Milan' and s.anno = '1989-1990'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Giovanni', 'Galli', 'Giovanni Galli', 'Italia'),
  ('Andrea', 'Pazzagli', 'Andrea Pazzagli', 'Italia'),
  ('Franco', 'Baresi', 'Franco Baresi', 'Italia'),
  ('Paolo', 'Maldini', 'Paolo Maldini', 'Italia'),
  ('Mauro', 'Tassotti', 'Mauro Tassotti', 'Italia'),
  ('Alessandro', 'Costacurta', 'Alessandro Costacurta', 'Italia'),
  ('Filippo', 'Galli', 'Filippo Galli', 'Italia'),
  ('Frank', 'Rijkaard', 'Frank Rijkaard', 'Paesi Bassi'),
  ('Carlo', 'Ancelotti', 'Carlo Ancelotti', 'Italia'),
  ('Roberto', 'Donadoni', 'Roberto Donadoni', 'Italia'),
  ('Alberigo', 'Evani', 'Alberigo Evani', 'Italia'),
  ('Angelo', 'Colombo', 'Angelo Colombo', 'Italia'),
  ('Marco', 'van Basten', 'Marco van Basten', 'Paesi Bassi'),
  ('Ruud', 'Gullit', 'Ruud Gullit', 'Paesi Bassi'),
  ('Daniele', 'Massaro', 'Daniele Massaro', 'Italia'),
  ('Pietro Paolo', 'Virdis', 'Pietro Paolo Virdis', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Giovanni Galli', 'PORTIERE'),
  ('Andrea Pazzagli', 'PORTIERE'),
  ('Franco Baresi', 'DIFENSORE'),
  ('Paolo Maldini', 'DIFENSORE'),
  ('Mauro Tassotti', 'DIFENSORE'),
  ('Alessandro Costacurta', 'DIFENSORE'),
  ('Filippo Galli', 'DIFENSORE'),
  ('Frank Rijkaard', 'CENTROCAMPISTA'),
  ('Carlo Ancelotti', 'CENTROCAMPISTA'),
  ('Roberto Donadoni', 'CENTROCAMPISTA'),
  ('Alberigo Evani', 'CENTROCAMPISTA'),
  ('Angelo Colombo', 'CENTROCAMPISTA'),
  ('Marco van Basten', 'ATTACCANTE'),
  ('Ruud Gullit', 'ATTACCANTE'),
  ('Daniele Massaro', 'ATTACCANTE'),
  ('Pietro Paolo Virdis', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Milan')
                    and ts.season_id = (select season_id from seasons where anno = '1989-1990');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Giovanni Galli', 'POR', 85),
  ('Andrea Pazzagli', 'POR', 74),
  ('Franco Baresi', 'DC', 92),
  ('Paolo Maldini', 'TS', 88),
  ('Mauro Tassotti', 'TD', 82),
  ('Alessandro Costacurta', 'DC', 83),
  ('Filippo Galli', 'DC', 79),
  ('Frank Rijkaard', 'CDC', 90),
  ('Carlo Ancelotti', 'CC', 84),
  ('Roberto Donadoni', 'ED', 85),
  ('Alberigo Evani', 'ES', 79),
  ('Angelo Colombo', 'CC', 76),
  ('Marco van Basten', 'ATT', 94),
  ('Ruud Gullit', 'TRQ', 92),
  ('Daniele Massaro', 'ATT', 80),
  ('Pietro Paolo Virdis', 'ATT', 78)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Milan')
     and season_id = (select season_id from seasons where anno = '1989-1990')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Arrigo', 'Sacchi', 'Arrigo Sacchi', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 92
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Milan')
                    and ts.season_id = (select season_id from seasons where anno = '1989-1990')
where c.nome_completo = 'Arrigo Sacchi'
on conflict do nothing;
