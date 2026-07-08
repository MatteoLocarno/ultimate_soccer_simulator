-- ============================================================================
--  SEED — Juventus 1985-86 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Juventus' and s.anno = '1985-1986'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Stefano', 'Tacconi', 'Stefano Tacconi', 'Italia'),
  ('Luciano', 'Bodini', 'Luciano Bodini', 'Italia'),
  ('Gaetano', 'Scirea', 'Gaetano Scirea', 'Italia'),
  ('Antonio', 'Cabrini', 'Antonio Cabrini', 'Italia'),
  ('Sergio', 'Brio', 'Sergio Brio', 'Italia'),
  ('Luciano', 'Favero', 'Luciano Favero', 'Italia'),
  ('Nicola', 'Caricola', 'Nicola Caricola', 'Italia'),
  ('Michel', 'Platini', 'Michel Platini', 'Francia'),
  ('Marco', 'Tardelli', 'Marco Tardelli', 'Italia'),
  ('Massimo', 'Bonini', 'Massimo Bonini', 'San Marino'),
  ('Lionello', 'Manfredonia', 'Lionello Manfredonia', 'Italia'),
  ('Beniamino', 'Vignola', 'Beniamino Vignola', 'Italia'),
  ('Zbigniew', 'Boniek', 'Zbigniew Boniek', 'Polonia'),
  ('Michael', 'Laudrup', 'Michael Laudrup', 'Danimarca'),
  ('Aldo', 'Serena', 'Aldo Serena', 'Italia'),
  ('Massimo', 'Briaschi', 'Massimo Briaschi', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Stefano Tacconi', 'PORTIERE'),
  ('Luciano Bodini', 'PORTIERE'),
  ('Gaetano Scirea', 'DIFENSORE'),
  ('Antonio Cabrini', 'DIFENSORE'),
  ('Sergio Brio', 'DIFENSORE'),
  ('Luciano Favero', 'DIFENSORE'),
  ('Nicola Caricola', 'DIFENSORE'),
  ('Michel Platini', 'CENTROCAMPISTA'),
  ('Marco Tardelli', 'CENTROCAMPISTA'),
  ('Massimo Bonini', 'CENTROCAMPISTA'),
  ('Lionello Manfredonia', 'CENTROCAMPISTA'),
  ('Beniamino Vignola', 'CENTROCAMPISTA'),
  ('Zbigniew Boniek', 'ATTACCANTE'),
  ('Michael Laudrup', 'ATTACCANTE'),
  ('Aldo Serena', 'ATTACCANTE'),
  ('Massimo Briaschi', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Juventus')
                    and ts.season_id = (select season_id from seasons where anno = '1985-1986');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Stefano Tacconi', 'POR', 82),
  ('Luciano Bodini', 'POR', 70),
  ('Gaetano Scirea', 'DC', 86),
  ('Antonio Cabrini', 'TS', 83),
  ('Sergio Brio', 'DC', 79),
  ('Luciano Favero', 'DC', 76),
  ('Nicola Caricola', 'TD', 73),
  ('Michel Platini', 'CC', 94),
  ('Marco Tardelli', 'CC', 84),
  ('Massimo Bonini', 'CDC', 80),
  ('Lionello Manfredonia', 'CC', 78),
  ('Beniamino Vignola', 'ED', 76),
  ('Zbigniew Boniek', 'ATT', 86),
  ('Michael Laudrup', 'TRQ', 82),
  ('Aldo Serena', 'ATT', 80),
  ('Massimo Briaschi', 'ATT', 77)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Juventus')
     and season_id = (select season_id from seasons where anno = '1985-1986')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Giovanni', 'Trapattoni', 'Giovanni Trapattoni', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 90
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Juventus')
                    and ts.season_id = (select season_id from seasons where anno = '1985-1986')
where c.nome_completo = 'Giovanni Trapattoni'
on conflict do nothing;
