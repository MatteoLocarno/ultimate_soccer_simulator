-- ============================================================================
--  SEED — Napoli 2022-23 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Napoli' and s.anno = '2022-2023'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Alex', 'Meret', 'Alex Meret', 'Italia'),
  ('Pierluigi', 'Gollini', 'Pierluigi Gollini', 'Italia'),
  ('Kim', 'Min-jae', 'Kim Min-jae', 'Corea del Sud'),
  ('Giovanni', 'Di Lorenzo', 'Giovanni Di Lorenzo', 'Italia'),
  ('Amir', 'Rrahmani', 'Amir Rrahmani', 'Kosovo'),
  ('Mário', 'Rui', 'Mário Rui', 'Portogallo'),
  ('Mathías', 'Olivera', 'Mathías Olivera', 'Uruguay'),
  ('Juan', 'Jesus', 'Juan Jesus', 'Brasile'),
  ('Stanislav', 'Lobotka', 'Stanislav Lobotka', 'Slovacchia'),
  ('Frank', 'Anguissa', 'Frank Anguissa', 'Camerun'),
  ('Piotr', 'Zieliński', 'Piotr Zieliński', 'Polonia'),
  ('Eljif', 'Elmas', 'Eljif Elmas', 'Macedonia del Nord'),
  ('Victor', 'Osimhen', 'Victor Osimhen', 'Nigeria'),
  ('Khvicha', 'Kvaratskhelia', 'Khvicha Kvaratskhelia', 'Georgia'),
  ('Hirving', 'Lozano', 'Hirving Lozano', 'Messico'),
  ('Matteo', 'Politano', 'Matteo Politano', 'Italia'),
  ('Giacomo', 'Raspadori', 'Giacomo Raspadori', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Alex Meret', 'PORTIERE'),
  ('Pierluigi Gollini', 'PORTIERE'),
  ('Kim Min-jae', 'DIFENSORE'),
  ('Giovanni Di Lorenzo', 'DIFENSORE'),
  ('Amir Rrahmani', 'DIFENSORE'),
  ('Mário Rui', 'DIFENSORE'),
  ('Mathías Olivera', 'DIFENSORE'),
  ('Juan Jesus', 'DIFENSORE'),
  ('Stanislav Lobotka', 'CENTROCAMPISTA'),
  ('Frank Anguissa', 'CENTROCAMPISTA'),
  ('Piotr Zieliński', 'CENTROCAMPISTA'),
  ('Eljif Elmas', 'CENTROCAMPISTA'),
  ('Victor Osimhen', 'ATTACCANTE'),
  ('Khvicha Kvaratskhelia', 'ATTACCANTE'),
  ('Hirving Lozano', 'ATTACCANTE'),
  ('Matteo Politano', 'ATTACCANTE'),
  ('Giacomo Raspadori', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Napoli')
                    and ts.season_id = (select season_id from seasons where anno = '2022-2023');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Alex Meret', 'POR', 82),
  ('Pierluigi Gollini', 'POR', 73),
  ('Kim Min-jae', 'DC', 85),
  ('Giovanni Di Lorenzo', 'TD', 83),
  ('Amir Rrahmani', 'DC', 81),
  ('Mário Rui', 'TS', 79),
  ('Mathías Olivera', 'TS', 79),
  ('Juan Jesus', 'DC', 76),
  ('Stanislav Lobotka', 'CDC', 84),
  ('Frank Anguissa', 'CDC', 84),
  ('Piotr Zieliński', 'CC', 83),
  ('Eljif Elmas', 'CC', 78),
  ('Victor Osimhen', 'ATT', 88),
  ('Khvicha Kvaratskhelia', 'AS', 87),
  ('Hirving Lozano', 'AD', 81),
  ('Matteo Politano', 'AD', 80),
  ('Giacomo Raspadori', 'ATT', 79)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Napoli')
     and season_id = (select season_id from seasons where anno = '2022-2023')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Luciano', 'Spalletti', 'Luciano Spalletti', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 86
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Napoli')
                    and ts.season_id = (select season_id from seasons where anno = '2022-2023')
where c.nome_completo = 'Luciano Spalletti'
on conflict do nothing;
