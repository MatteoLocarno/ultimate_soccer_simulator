-- ============================================================================
--  SEED — Sampdoria 1990-91 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Sampdoria' and s.anno = '1990-1991'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Gianluca', 'Pagliuca', 'Gianluca Pagliuca', 'Italia'),
  ('Giulio', 'Nuciari', 'Giulio Nuciari', 'Italia'),
  ('Pietro', 'Vierchowod', 'Pietro Vierchowod', 'Italia'),
  ('Luca', 'Pellegrini', 'Luca Pellegrini', 'Italia'),
  ('Moreno', 'Mannini', 'Moreno Mannini', 'Italia'),
  ('Marco', 'Lanna', 'Marco Lanna', 'Italia'),
  ('Amedeo', 'Carboni', 'Amedeo Carboni', 'Italia'),
  ('Toninho', 'Cerezo', 'Toninho Cerezo', 'Brasile'),
  ('Attilio', 'Lombardo', 'Attilio Lombardo', 'Italia'),
  ('Srečko', 'Katanec', 'Srečko Katanec', 'Slovenia'),
  ('Fausto', 'Pari', 'Fausto Pari', 'Italia'),
  ('Giovanni', 'Invernizzi', 'Giovanni Invernizzi', 'Italia'),
  ('Gianluca', 'Vialli', 'Gianluca Vialli', 'Italia'),
  ('Roberto', 'Mancini', 'Roberto Mancini', 'Italia'),
  ('Marco', 'Branca', 'Marco Branca', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Gianluca Pagliuca', 'PORTIERE'),
  ('Giulio Nuciari', 'PORTIERE'),
  ('Pietro Vierchowod', 'DIFENSORE'),
  ('Luca Pellegrini', 'DIFENSORE'),
  ('Moreno Mannini', 'DIFENSORE'),
  ('Marco Lanna', 'DIFENSORE'),
  ('Amedeo Carboni', 'DIFENSORE'),
  ('Toninho Cerezo', 'CENTROCAMPISTA'),
  ('Attilio Lombardo', 'CENTROCAMPISTA'),
  ('Srečko Katanec', 'CENTROCAMPISTA'),
  ('Fausto Pari', 'CENTROCAMPISTA'),
  ('Giovanni Invernizzi', 'CENTROCAMPISTA'),
  ('Gianluca Vialli', 'ATTACCANTE'),
  ('Roberto Mancini', 'ATTACCANTE'),
  ('Marco Branca', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Sampdoria')
                    and ts.season_id = (select season_id from seasons where anno = '1990-1991');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Gianluca Pagliuca', 'POR', 84),
  ('Giulio Nuciari', 'POR', 70),
  ('Pietro Vierchowod', 'DC', 84),
  ('Luca Pellegrini', 'TS', 78),
  ('Moreno Mannini', 'TD', 77),
  ('Marco Lanna', 'DC', 75),
  ('Amedeo Carboni', 'TS', 76),
  ('Toninho Cerezo', 'CDC', 83),
  ('Attilio Lombardo', 'ED', 82),
  ('Srečko Katanec', 'CC', 79),
  ('Fausto Pari', 'CC', 76),
  ('Giovanni Invernizzi', 'CC', 74),
  ('Gianluca Vialli', 'ATT', 88),
  ('Roberto Mancini', 'TRQ', 87),
  ('Marco Branca', 'ATT', 76)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Sampdoria')
     and season_id = (select season_id from seasons where anno = '1990-1991')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Vujadin', 'Boškov', 'Vujadin Boškov', 'Serbia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 84
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Sampdoria')
                    and ts.season_id = (select season_id from seasons where anno = '1990-1991')
where c.nome_completo = 'Vujadin Boškov'
on conflict do nothing;
