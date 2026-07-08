-- ============================================================================
--  SEED — Juventus 2017-18 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Juventus' and s.anno = '2017-2018'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Gianluigi', 'Buffon', 'Gianluigi Buffon', 'Italia'),
  ('Wojciech', 'Szczęsny', 'Wojciech Szczęsny', 'Polonia'),
  ('Giorgio', 'Chiellini', 'Giorgio Chiellini', 'Italia'),
  ('Andrea', 'Barzagli', 'Andrea Barzagli', 'Italia'),
  ('Medhi', 'Benatia', 'Medhi Benatia', 'Marocco'),
  ('Alex', 'Sandro', 'Alex Sandro', 'Brasile'),
  ('Mattia', 'De Sciglio', 'Mattia De Sciglio', 'Italia'),
  ('Stephan', 'Lichtsteiner', 'Stephan Lichtsteiner', 'Svizzera'),
  ('Miralem', 'Pjanić', 'Miralem Pjanić', 'Bosnia ed Erzegovina'),
  ('Sami', 'Khedira', 'Sami Khedira', 'Germania'),
  ('Blaise', 'Matuidi', 'Blaise Matuidi', 'Francia'),
  ('Claudio', 'Marchisio', 'Claudio Marchisio', 'Italia'),
  ('Rodrigo', 'Bentancur', 'Rodrigo Bentancur', 'Uruguay'),
  ('Paulo', 'Dybala', 'Paulo Dybala', 'Argentina'),
  ('Gonzalo', 'Higuaín', 'Gonzalo Higuaín', 'Argentina'),
  ('Mario', 'Mandžukić', 'Mario Mandžukić', 'Croazia'),
  ('Douglas', 'Costa', 'Douglas Costa', 'Brasile')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Gianluigi Buffon', 'PORTIERE'),
  ('Wojciech Szczęsny', 'PORTIERE'),
  ('Giorgio Chiellini', 'DIFENSORE'),
  ('Andrea Barzagli', 'DIFENSORE'),
  ('Medhi Benatia', 'DIFENSORE'),
  ('Alex Sandro', 'DIFENSORE'),
  ('Mattia De Sciglio', 'DIFENSORE'),
  ('Stephan Lichtsteiner', 'DIFENSORE'),
  ('Miralem Pjanić', 'CENTROCAMPISTA'),
  ('Sami Khedira', 'CENTROCAMPISTA'),
  ('Blaise Matuidi', 'CENTROCAMPISTA'),
  ('Claudio Marchisio', 'CENTROCAMPISTA'),
  ('Rodrigo Bentancur', 'CENTROCAMPISTA'),
  ('Paulo Dybala', 'ATTACCANTE'),
  ('Gonzalo Higuaín', 'ATTACCANTE'),
  ('Mario Mandžukić', 'ATTACCANTE'),
  ('Douglas Costa', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Juventus')
                    and ts.season_id = (select season_id from seasons where anno = '2017-2018');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Gianluigi Buffon', 'POR', 89),
  ('Wojciech Szczęsny', 'POR', 84),
  ('Giorgio Chiellini', 'DC', 89),
  ('Andrea Barzagli', 'DC', 84),
  ('Medhi Benatia', 'DC', 84),
  ('Alex Sandro', 'TS', 84),
  ('Mattia De Sciglio', 'TD', 80),
  ('Stephan Lichtsteiner', 'TD', 80),
  ('Miralem Pjanić', 'CC', 85),
  ('Sami Khedira', 'CDC', 84),
  ('Blaise Matuidi', 'ES', 83),
  ('Claudio Marchisio', 'CC', 81),
  ('Rodrigo Bentancur', 'CDC', 76),
  ('Paulo Dybala', 'TRQ', 88),
  ('Gonzalo Higuaín', 'ATT', 88),
  ('Mario Mandžukić', 'ATT', 84),
  ('Douglas Costa', 'AD', 84)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Juventus')
     and season_id = (select season_id from seasons where anno = '2017-2018')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Massimiliano', 'Allegri', 'Massimiliano Allegri', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 87
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Juventus')
                    and ts.season_id = (select season_id from seasons where anno = '2017-2018')
where c.nome_completo = 'Massimiliano Allegri'
on conflict do nothing;
