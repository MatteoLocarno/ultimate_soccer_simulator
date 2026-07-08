-- ============================================================================
--  SEED — Inter 2020-21 (squadra-stagione iconica)
--  Generato da dati/squadre.js + ruoli dettagliati/nazionalita/allenatore
--  aggiunti manualmente. Eseguito via Supabase MCP (apply_migration).
-- ============================================================================

-- 1) team_season
insert into team_season (team_id, season_id)
select t.team_id, s.season_id
from teams t, seasons s
where t.nome_squadra = 'Inter' and s.anno = '2020-2021'
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Samir', 'Handanović', 'Samir Handanović', 'Slovenia'),
  ('Ionuț', 'Radu', 'Ionuț Radu', 'Romania'),
  ('Stefan', 'de Vrij', 'Stefan de Vrij', 'Paesi Bassi'),
  ('Milan', 'Škriniar', 'Milan Škriniar', 'Slovacchia'),
  ('Alessandro', 'Bastoni', 'Alessandro Bastoni', 'Italia'),
  ('Achraf', 'Hakimi', 'Achraf Hakimi', 'Marocco'),
  ('Aleksandar', 'Kolarov', 'Aleksandar Kolarov', 'Serbia'),
  ('Danilo', 'D''Ambrosio', 'Danilo D''Ambrosio', 'Italia'),
  ('Nicolò', 'Barella', 'Nicolò Barella', 'Italia'),
  ('Marcelo', 'Brozović', 'Marcelo Brozović', 'Croazia'),
  ('Ivan', 'Perišić', 'Ivan Perišić', 'Croazia'),
  ('Christian', 'Eriksen', 'Christian Eriksen', 'Danimarca'),
  ('Arturo', 'Vidal', 'Arturo Vidal', 'Cile'),
  ('Romelu', 'Lukaku', 'Romelu Lukaku', 'Belgio'),
  ('Lautaro', 'Martínez', 'Lautaro Martínez', 'Argentina'),
  ('Alexis', 'Sánchez', 'Alexis Sánchez', 'Cile')
on conflict (nome_completo) do nothing;

-- 3) player_season
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Samir Handanović', 'PORTIERE'),
  ('Ionuț Radu', 'PORTIERE'),
  ('Stefan de Vrij', 'DIFENSORE'),
  ('Milan Škriniar', 'DIFENSORE'),
  ('Alessandro Bastoni', 'DIFENSORE'),
  ('Achraf Hakimi', 'DIFENSORE'),
  ('Aleksandar Kolarov', 'DIFENSORE'),
  ('Danilo D''Ambrosio', 'DIFENSORE'),
  ('Nicolò Barella', 'CENTROCAMPISTA'),
  ('Marcelo Brozović', 'CENTROCAMPISTA'),
  ('Ivan Perišić', 'CENTROCAMPISTA'),
  ('Christian Eriksen', 'CENTROCAMPISTA'),
  ('Arturo Vidal', 'CENTROCAMPISTA'),
  ('Romelu Lukaku', 'ATTACCANTE'),
  ('Lautaro Martínez', 'ATTACCANTE'),
  ('Alexis Sánchez', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Inter')
                    and ts.season_id = (select season_id from seasons where anno = '2020-2021');

-- 4) player_role_map
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Samir Handanović', 'POR', 83),
  ('Ionuț Radu', 'POR', 71),
  ('Stefan de Vrij', 'DC', 85),
  ('Milan Škriniar', 'DC', 84),
  ('Alessandro Bastoni', 'DC', 83),
  ('Achraf Hakimi', 'TD', 84),
  ('Aleksandar Kolarov', 'TS', 78),
  ('Danilo D''Ambrosio', 'TD', 78),
  ('Nicolò Barella', 'CC', 85),
  ('Marcelo Brozović', 'CDC', 84),
  ('Ivan Perišić', 'ES', 82),
  ('Christian Eriksen', 'CC', 83),
  ('Arturo Vidal', 'CDC', 80),
  ('Romelu Lukaku', 'ATT', 88),
  ('Lautaro Martínez', 'ATT', 85),
  ('Alexis Sánchez', 'ATT', 81)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (
   select team_season_id from team_season
   where team_id = (select team_id from teams where nome_squadra = 'Inter')
     and season_id = (select season_id from seasons where anno = '2020-2021')
 );

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Antonio', 'Conte', 'Antonio Conte', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 88
from coaches c
join team_season ts on ts.team_id = (select team_id from teams where nome_squadra = 'Inter')
                    and ts.season_id = (select season_id from seasons where anno = '2020-2021')
where c.nome_completo = 'Antonio Conte'
on conflict do nothing;
