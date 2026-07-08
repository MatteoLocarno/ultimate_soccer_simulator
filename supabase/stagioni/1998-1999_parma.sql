-- ============================================================================
--  SEED — Parma 1998-99 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Parma' and s.anno = '1998-1999'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Gianluigi', 'Buffon', 'Gianluigi Buffon', 'Italia'),
  ('Marco', 'Ballotta', 'Marco Ballotta', 'Italia'),
  ('Lilian', 'Thuram', 'Lilian Thuram', 'Francia'),
  ('Fabio', 'Cannavaro', 'Fabio Cannavaro', 'Italia'),
  ('Néstor', 'Sensini', 'Néstor Sensini', 'Argentina'),
  ('Antonio', 'Benarrivo', 'Antonio Benarrivo', 'Italia'),
  ('Roberto', 'Mussi', 'Roberto Mussi', 'Italia'),
  ('Juan Sebastián', 'Verón', 'Juan Sebastián Verón', 'Argentina'),
  ('Dino', 'Baggio', 'Dino Baggio', 'Italia'),
  ('Diego', 'Fuser', 'Diego Fuser', 'Italia'),
  ('Stefano', 'Fiore', 'Stefano Fiore', 'Italia'),
  ('Alain', 'Boghossian', 'Alain Boghossian', 'Francia'),
  ('Hernán', 'Crespo', 'Hernán Crespo', 'Argentina'),
  ('Enrico', 'Chiesa', 'Enrico Chiesa', 'Italia'),
  ('Abel', 'Balbo', 'Abel Balbo', 'Argentina'),
  ('Marco', 'Di Vaio', 'Marco Di Vaio', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Gianluigi Buffon', 'PORTIERE'),
  ('Marco Ballotta', 'PORTIERE'),
  ('Lilian Thuram', 'DIFENSORE'),
  ('Fabio Cannavaro', 'DIFENSORE'),
  ('Néstor Sensini', 'DIFENSORE'),
  ('Antonio Benarrivo', 'DIFENSORE'),
  ('Roberto Mussi', 'DIFENSORE'),
  ('Juan Sebastián Verón', 'CENTROCAMPISTA'),
  ('Dino Baggio', 'CENTROCAMPISTA'),
  ('Diego Fuser', 'CENTROCAMPISTA'),
  ('Stefano Fiore', 'CENTROCAMPISTA'),
  ('Alain Boghossian', 'CENTROCAMPISTA'),
  ('Hernán Crespo', 'ATTACCANTE'),
  ('Enrico Chiesa', 'ATTACCANTE'),
  ('Abel Balbo', 'ATTACCANTE'),
  ('Marco Di Vaio', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Parma')
                    and ts.season_id = (select season_id from seasons where anno = '1998-1999');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Gianluigi Buffon', 'POR', 86),
  ('Marco Ballotta', 'POR', 72),
  ('Lilian Thuram', 'DC', 86),
  ('Fabio Cannavaro', 'DC', 85),
  ('Néstor Sensini', 'DC', 81),
  ('Antonio Benarrivo', 'TS', 78),
  ('Roberto Mussi', 'TD', 76),
  ('Juan Sebastián Verón', 'CC', 86),
  ('Dino Baggio', 'CDC', 82),
  ('Diego Fuser', 'ED', 81),
  ('Stefano Fiore', 'CC', 78),
  ('Alain Boghossian', 'CDC', 78),
  ('Hernán Crespo', 'ATT', 86),
  ('Enrico Chiesa', 'ATT', 83),
  ('Abel Balbo', 'ATT', 81),
  ('Marco Di Vaio', 'ATT', 77)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Parma')
     and season_id = (select season_id from seasons where anno = '1998-1999')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Alberto', 'Malesani', 'Alberto Malesani', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 79
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Parma')
                    and ts.season_id = (select season_id from seasons where anno = '1998-1999')
where c.nome_completo = 'Alberto Malesani'
on conflict do nothing;
