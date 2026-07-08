-- ============================================================================
--  SEED — Inter 2009-10 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Inter' and s.anno = '2009-2010'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Júlio', 'César', 'Júlio César', 'Brasile'),
  ('Francesco', 'Toldo', 'Francesco Toldo', 'Italia'),
  ('Maicon', '', 'Maicon', 'Brasile'),
  ('Lúcio', '', 'Lúcio', 'Brasile'),
  ('Walter', 'Samuel', 'Walter Samuel', 'Argentina'),
  ('Javier', 'Zanetti', 'Javier Zanetti', 'Argentina'),
  ('Cristian', 'Chivu', 'Cristian Chivu', 'Romania'),
  ('Marco', 'Materazzi', 'Marco Materazzi', 'Italia'),
  ('Wesley', 'Sneijder', 'Wesley Sneijder', 'Paesi Bassi'),
  ('Esteban', 'Cambiasso', 'Esteban Cambiasso', 'Argentina'),
  ('Thiago', 'Motta', 'Thiago Motta', 'Italia'),
  ('Dejan', 'Stanković', 'Dejan Stanković', 'Serbia'),
  ('McDonald', 'Mariga', 'McDonald Mariga', 'Kenya'),
  ('Samuel', 'Eto''o', 'Samuel Eto''o', 'Camerun'),
  ('Diego', 'Milito', 'Diego Milito', 'Argentina'),
  ('Goran', 'Pandev', 'Goran Pandev', 'Macedonia del Nord'),
  ('Mario', 'Balotelli', 'Mario Balotelli', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Júlio César', 'PORTIERE'),
  ('Francesco Toldo', 'PORTIERE'),
  ('Maicon', 'DIFENSORE'),
  ('Lúcio', 'DIFENSORE'),
  ('Walter Samuel', 'DIFENSORE'),
  ('Javier Zanetti', 'DIFENSORE'),
  ('Cristian Chivu', 'DIFENSORE'),
  ('Marco Materazzi', 'DIFENSORE'),
  ('Wesley Sneijder', 'CENTROCAMPISTA'),
  ('Esteban Cambiasso', 'CENTROCAMPISTA'),
  ('Thiago Motta', 'CENTROCAMPISTA'),
  ('Dejan Stanković', 'CENTROCAMPISTA'),
  ('McDonald Mariga', 'CENTROCAMPISTA'),
  ('Samuel Eto''o', 'ATTACCANTE'),
  ('Diego Milito', 'ATTACCANTE'),
  ('Goran Pandev', 'ATTACCANTE'),
  ('Mario Balotelli', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Inter')
                    and ts.season_id = (select season_id from seasons where anno = '2009-2010');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Júlio César', 'POR', 88),
  ('Francesco Toldo', 'POR', 78),
  ('Maicon', 'TD', 87),
  ('Lúcio', 'DC', 85),
  ('Walter Samuel', 'DC', 84),
  ('Javier Zanetti', 'TS', 86),
  ('Cristian Chivu', 'TS', 80),
  ('Marco Materazzi', 'DC', 79),
  ('Wesley Sneijder', 'CC', 88),
  ('Esteban Cambiasso', 'CDC', 85),
  ('Thiago Motta', 'CDC', 82),
  ('Dejan Stanković', 'CC', 82),
  ('McDonald Mariga', 'CDC', 74),
  ('Samuel Eto''o', 'ATT', 90),
  ('Diego Milito', 'ATT', 87),
  ('Goran Pandev', 'AS', 80),
  ('Mario Balotelli', 'ATT', 79)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Inter')
     and season_id = (select season_id from seasons where anno = '2009-2010')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('José', 'Mourinho', 'José Mourinho', 'Portogallo')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 92
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Inter')
                    and ts.season_id = (select season_id from seasons where anno = '2009-2010')
where c.nome_completo = 'José Mourinho'
on conflict do nothing;
