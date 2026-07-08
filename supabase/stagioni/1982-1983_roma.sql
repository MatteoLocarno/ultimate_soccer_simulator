-- ============================================================================
--  SEED — Roma 1982-83 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Roma' and s.anno = '1982-1983'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Franco', 'Tancredi', 'Franco Tancredi', 'Italia'),
  ('Maurizio', 'Tancredi', 'Maurizio Tancredi', 'Italia'),
  ('Pietro', 'Vierchowod', 'Pietro Vierchowod', 'Italia'),
  ('Sebastiano', 'Nela', 'Sebastiano Nela', 'Italia'),
  ('Dario', 'Bonetti', 'Dario Bonetti', 'Italia'),
  ('Michele', 'Nappi', 'Michele Nappi', 'Italia'),
  ('Ubaldo', 'Righetti', 'Ubaldo Righetti', 'Italia'),
  ('Falcão', '', 'Falcão', 'Brasile'),
  ('Bruno', 'Conti', 'Bruno Conti', 'Italia'),
  ('Agostino', 'Di Bartolomei', 'Agostino Di Bartolomei', 'Italia'),
  ('Carlo', 'Ancelotti', 'Carlo Ancelotti', 'Italia'),
  ('Odoacre', 'Chierico', 'Odoacre Chierico', 'Italia'),
  ('Roberto', 'Pruzzo', 'Roberto Pruzzo', 'Italia'),
  ('Francesco', 'Graziani', 'Francesco Graziani', 'Italia'),
  ('Maurizio', 'Iorio', 'Maurizio Iorio', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Franco Tancredi', 'PORTIERE'),
  ('Maurizio Tancredi', 'PORTIERE'),
  ('Pietro Vierchowod', 'DIFENSORE'),
  ('Sebastiano Nela', 'DIFENSORE'),
  ('Dario Bonetti', 'DIFENSORE'),
  ('Michele Nappi', 'DIFENSORE'),
  ('Ubaldo Righetti', 'DIFENSORE'),
  ('Falcão', 'CENTROCAMPISTA'),
  ('Bruno Conti', 'CENTROCAMPISTA'),
  ('Agostino Di Bartolomei', 'CENTROCAMPISTA'),
  ('Carlo Ancelotti', 'CENTROCAMPISTA'),
  ('Odoacre Chierico', 'CENTROCAMPISTA'),
  ('Roberto Pruzzo', 'ATTACCANTE'),
  ('Francesco Graziani', 'ATTACCANTE'),
  ('Maurizio Iorio', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Roma')
                    and ts.season_id = (select season_id from seasons where anno = '1982-1983');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Franco Tancredi', 'POR', 80),
  ('Maurizio Tancredi', 'POR', 70),
  ('Pietro Vierchowod', 'DC', 81),
  ('Sebastiano Nela', 'TS', 78),
  ('Dario Bonetti', 'DC', 76),
  ('Michele Nappi', 'TD', 74),
  ('Ubaldo Righetti', 'TD', 74),
  ('Falcão', 'CC', 90),
  ('Bruno Conti', 'ED', 86),
  ('Agostino Di Bartolomei', 'CDC', 82),
  ('Carlo Ancelotti', 'CC', 80),
  ('Odoacre Chierico', 'CC', 74),
  ('Roberto Pruzzo', 'ATT', 84),
  ('Francesco Graziani', 'ATT', 79),
  ('Maurizio Iorio', 'ATT', 72)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Roma')
     and season_id = (select season_id from seasons where anno = '1982-1983')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Nils', 'Liedholm', 'Nils Liedholm', 'Svezia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 85
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Roma')
                    and ts.season_id = (select season_id from seasons where anno = '1982-1983')
where c.nome_completo = 'Nils Liedholm'
on conflict do nothing;
