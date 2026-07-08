-- ============================================================================
--  SEED — Roma 2000-01 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Roma' and s.anno = '2000-2001'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Francesco', 'Antonioli', 'Francesco Antonioli', 'Italia'),
  ('Cristiano', 'Lupatelli', 'Cristiano Lupatelli', 'Italia'),
  ('Cafu', '', 'Cafu', 'Brasile'),
  ('Walter', 'Samuel', 'Walter Samuel', 'Argentina'),
  ('Aldair', '', 'Aldair', 'Brasile'),
  ('Vincent', 'Candela', 'Vincent Candela', 'Francia'),
  ('Jonathan', 'Zebina', 'Jonathan Zebina', 'Francia'),
  ('Emerson', '', 'Emerson', 'Brasile'),
  ('Damiano', 'Tommasi', 'Damiano Tommasi', 'Italia'),
  ('Hidetoshi', 'Nakata', 'Hidetoshi Nakata', 'Giappone'),
  ('Cristiano', 'Zanetti', 'Cristiano Zanetti', 'Italia'),
  ('Marcos', 'Assunção', 'Marcos Assunção', 'Brasile'),
  ('Francesco', 'Totti', 'Francesco Totti', 'Italia'),
  ('Gabriel', 'Batistuta', 'Gabriel Batistuta', 'Argentina'),
  ('Vincenzo', 'Montella', 'Vincenzo Montella', 'Italia'),
  ('Marco', 'Delvecchio', 'Marco Delvecchio', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Francesco Antonioli', 'PORTIERE'),
  ('Cristiano Lupatelli', 'PORTIERE'),
  ('Cafu', 'DIFENSORE'),
  ('Walter Samuel', 'DIFENSORE'),
  ('Aldair', 'DIFENSORE'),
  ('Vincent Candela', 'DIFENSORE'),
  ('Jonathan Zebina', 'DIFENSORE'),
  ('Emerson', 'CENTROCAMPISTA'),
  ('Damiano Tommasi', 'CENTROCAMPISTA'),
  ('Hidetoshi Nakata', 'CENTROCAMPISTA'),
  ('Cristiano Zanetti', 'CENTROCAMPISTA'),
  ('Marcos Assunção', 'CENTROCAMPISTA'),
  ('Francesco Totti', 'ATTACCANTE'),
  ('Gabriel Batistuta', 'ATTACCANTE'),
  ('Vincenzo Montella', 'ATTACCANTE'),
  ('Marco Delvecchio', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Roma')
                    and ts.season_id = (select season_id from seasons where anno = '2000-2001');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Francesco Antonioli', 'POR', 81),
  ('Cristiano Lupatelli', 'POR', 72),
  ('Cafu', 'TD', 85),
  ('Walter Samuel', 'DC', 84),
  ('Aldair', 'DC', 83),
  ('Vincent Candela', 'TS', 82),
  ('Jonathan Zebina', 'DC', 78),
  ('Emerson', 'CDC', 84),
  ('Damiano Tommasi', 'CC', 81),
  ('Hidetoshi Nakata', 'CC', 80),
  ('Cristiano Zanetti', 'CDC', 79),
  ('Marcos Assunção', 'CC', 79),
  ('Francesco Totti', 'TRQ', 90),
  ('Gabriel Batistuta', 'ATT', 89),
  ('Vincenzo Montella', 'ATT', 84),
  ('Marco Delvecchio', 'ATT', 80)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Roma')
     and season_id = (select season_id from seasons where anno = '2000-2001')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Fabio', 'Capello', 'Fabio Capello', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 91
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Roma')
                    and ts.season_id = (select season_id from seasons where anno = '2000-2001')
where c.nome_completo = 'Fabio Capello'
on conflict do nothing;
