-- ============================================================================
--  SEED — Inter 1997-98 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Inter' and s.anno = '1997-1998'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Gianluca', 'Pagliuca', 'Gianluca Pagliuca', 'Italia'),
  ('Fabrizio', 'Fontana', 'Fabrizio Fontana', 'Italia'),
  ('Giuseppe', 'Bergomi', 'Giuseppe Bergomi', 'Italia'),
  ('Taribo', 'West', 'Taribo West', 'Nigeria'),
  ('Aron', 'Winter', 'Aron Winter', 'Paesi Bassi'),
  ('Francesco', 'Colonnese', 'Francesco Colonnese', 'Italia'),
  ('Salvatore', 'Fresi', 'Salvatore Fresi', 'Italia'),
  ('Fabio', 'Galante', 'Fabio Galante', 'Italia'),
  ('Javier', 'Zanetti', 'Javier Zanetti', 'Argentina'),
  ('Youri', 'Djorkaeff', 'Youri Djorkaeff', 'Francia'),
  ('Diego', 'Simeone', 'Diego Simeone', 'Argentina'),
  ('Benoît', 'Cauet', 'Benoît Cauet', 'Francia'),
  ('Ronaldo', '', 'Ronaldo', 'Brasile'),
  ('Iván', 'Zamorano', 'Iván Zamorano', 'Cile'),
  ('Maurizio', 'Ganz', 'Maurizio Ganz', 'Italia'),
  ('Nicola', 'Ventola', 'Nicola Ventola', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Gianluca Pagliuca', 'PORTIERE'),
  ('Fabrizio Fontana', 'PORTIERE'),
  ('Giuseppe Bergomi', 'DIFENSORE'),
  ('Taribo West', 'DIFENSORE'),
  ('Aron Winter', 'DIFENSORE'),
  ('Francesco Colonnese', 'DIFENSORE'),
  ('Salvatore Fresi', 'DIFENSORE'),
  ('Fabio Galante', 'DIFENSORE'),
  ('Javier Zanetti', 'CENTROCAMPISTA'),
  ('Youri Djorkaeff', 'CENTROCAMPISTA'),
  ('Diego Simeone', 'CENTROCAMPISTA'),
  ('Benoît Cauet', 'CENTROCAMPISTA'),
  ('Ronaldo', 'ATTACCANTE'),
  ('Iván Zamorano', 'ATTACCANTE'),
  ('Maurizio Ganz', 'ATTACCANTE'),
  ('Nicola Ventola', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Inter')
                    and ts.season_id = (select season_id from seasons where anno = '1997-1998');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Gianluca Pagliuca', 'POR', 84),
  ('Fabrizio Fontana', 'POR', 70),
  ('Giuseppe Bergomi', 'DC', 82),
  ('Taribo West', 'DC', 79),
  ('Aron Winter', 'DC', 80),
  ('Francesco Colonnese', 'TD', 77),
  ('Salvatore Fresi', 'DC', 76),
  ('Fabio Galante', 'DC', 76),
  ('Javier Zanetti', 'ED', 86),
  ('Youri Djorkaeff', 'CC', 86),
  ('Diego Simeone', 'CDC', 84),
  ('Benoît Cauet', 'CC', 78),
  ('Ronaldo', 'ATT', 95),
  ('Iván Zamorano', 'ATT', 84),
  ('Maurizio Ganz', 'ATT', 76),
  ('Nicola Ventola', 'ATT', 74)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Inter')
     and season_id = (select season_id from seasons where anno = '1997-1998')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Luigi', 'Simoni', 'Luigi Simoni', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 81
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Inter')
                    and ts.season_id = (select season_id from seasons where anno = '1997-1998')
where c.nome_completo = 'Luigi Simoni'
on conflict do nothing;
