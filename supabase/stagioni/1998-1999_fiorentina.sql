-- ============================================================================
--  SEED — Fiorentina 1998-99 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Fiorentina' and s.anno = '1998-1999'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Francesco', 'Toldo', 'Francesco Toldo', 'Italia'),
  ('Gianmatteo', 'Mareggini', 'Gianmatteo Mareggini', 'Italia'),
  ('Tomáš', 'Řepka', 'Tomáš Řepka', 'Rep. Ceca'),
  ('Moreno', 'Torricelli', 'Moreno Torricelli', 'Italia'),
  ('Daniele', 'Adani', 'Daniele Adani', 'Italia'),
  ('Pasquale', 'Padalino', 'Pasquale Padalino', 'Italia'),
  ('Aldo', 'Firicano', 'Aldo Firicano', 'Italia'),
  ('Rui', 'Costa', 'Rui Costa', 'Portogallo'),
  ('Guillermo', 'Amor', 'Guillermo Amor', 'Spagna'),
  ('Angelo', 'Di Livio', 'Angelo Di Livio', 'Italia'),
  ('Christian', 'Amoroso', 'Christian Amoroso', 'Italia'),
  ('Emiliano', 'Bigica', 'Emiliano Bigica', 'Italia'),
  ('Gabriel', 'Batistuta', 'Gabriel Batistuta', 'Argentina'),
  ('Edmundo', '', 'Edmundo', 'Brasile'),
  ('Luís', 'Oliveira', 'Luís Oliveira', 'Brasile')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Francesco Toldo', 'PORTIERE'),
  ('Gianmatteo Mareggini', 'PORTIERE'),
  ('Tomáš Řepka', 'DIFENSORE'),
  ('Moreno Torricelli', 'DIFENSORE'),
  ('Daniele Adani', 'DIFENSORE'),
  ('Pasquale Padalino', 'DIFENSORE'),
  ('Aldo Firicano', 'DIFENSORE'),
  ('Rui Costa', 'CENTROCAMPISTA'),
  ('Guillermo Amor', 'CENTROCAMPISTA'),
  ('Angelo Di Livio', 'CENTROCAMPISTA'),
  ('Christian Amoroso', 'CENTROCAMPISTA'),
  ('Emiliano Bigica', 'CENTROCAMPISTA'),
  ('Gabriel Batistuta', 'ATTACCANTE'),
  ('Edmundo', 'ATTACCANTE'),
  ('Luís Oliveira', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Fiorentina')
                    and ts.season_id = (select season_id from seasons where anno = '1998-1999');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Francesco Toldo', 'POR', 84),
  ('Gianmatteo Mareggini', 'POR', 70),
  ('Tomáš Řepka', 'DC', 79),
  ('Moreno Torricelli', 'TD', 78),
  ('Daniele Adani', 'DC', 76),
  ('Pasquale Padalino', 'TS', 75),
  ('Aldo Firicano', 'DC', 74),
  ('Rui Costa', 'CC', 88),
  ('Guillermo Amor', 'CC', 79),
  ('Angelo Di Livio', 'ED', 78),
  ('Christian Amoroso', 'CC', 75),
  ('Emiliano Bigica', 'CDC', 72),
  ('Gabriel Batistuta', 'ATT', 90),
  ('Edmundo', 'ATT', 84),
  ('Luís Oliveira', 'ATT', 78)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Fiorentina')
     and season_id = (select season_id from seasons where anno = '1998-1999')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Giovanni', 'Trapattoni', 'Giovanni Trapattoni', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 90
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Fiorentina')
                    and ts.season_id = (select season_id from seasons where anno = '1998-1999')
where c.nome_completo = 'Giovanni Trapattoni'
on conflict do nothing;
