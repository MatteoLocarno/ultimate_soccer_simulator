-- ============================================================================
--  SEED — Inter 2007-2008 (Campione d'Italia)  | season_id = 29, team_id = 6
--  Overall stile FIFA 08 (a memoria) — da rifinire con SoFIFA se serve.
--  Eseguire UNA volta nel SQL Editor di Supabase.
--  Ordine: team_season -> players -> player_season -> player_role_map -> coach.
-- ============================================================================

-- 1) team_season (i trigger riempiono team_season_key e team_nome)
insert into team_season (team_id, season_id) values (6, 29)
on conflict (team_id, season_id) do nothing;

-- 2) players
insert into players (nome, cognome, nome_completo, nazionalita) values
  ('Júlio', 'César', 'Júlio César', 'Brasile'),
  ('Francesco', 'Toldo', 'Francesco Toldo', 'Italia'),
  ('Maicon', 'Sisenando', 'Maicon Sisenando', 'Brasile'),
  ('Javier', 'Zanetti', 'Javier Zanetti', 'Argentina'),
  ('Maxwell', 'Andrade', 'Maxwell Andrade', 'Brasile'),
  ('Cristian', 'Chivu', 'Cristian Chivu', 'Romania'),
  ('Walter', 'Samuel', 'Walter Samuel', 'Argentina'),
  ('Marco', 'Materazzi', 'Marco Materazzi', 'Italia'),
  ('Iván', 'Córdoba', 'Iván Córdoba', 'Colombia'),
  ('Nicolás', 'Burdisso', 'Nicolás Burdisso', 'Argentina'),
  ('Nelson', 'Rivas', 'Nelson Rivas', 'Colombia'),
  ('Esteban', 'Cambiasso', 'Esteban Cambiasso', 'Argentina'),
  ('Patrick', 'Vieira', 'Patrick Vieira', 'Francia'),
  ('Dejan', 'Stanković', 'Dejan Stanković', 'Serbia'),
  ('Olivier', 'Dacourt', 'Olivier Dacourt', 'Francia'),
  ('Luís', 'Figo', 'Luís Figo', 'Portogallo'),
  ('Santiago', 'Solari', 'Santiago Solari', 'Argentina'),
  ('Zlatan', 'Ibrahimović', 'Zlatan Ibrahimović', 'Svezia'),
  ('Hernán', 'Crespo', 'Hernán Crespo', 'Argentina'),
  ('Julio', 'Cruz', 'Julio Cruz', 'Argentina'),
  ('David', 'Suazo', 'David Suazo', 'Honduras'),
  ('Mario', 'Balotelli', 'Mario Balotelli', 'Italia')
on conflict (nome_completo) do nothing;

-- 3) player_season (posizione macro; overall/ruoli vivono in player_role_map)
insert into player_season (player_id, team_season_id, player_nome_completo, posizione)
select p.player_id, ts.team_season_id, v.nome_completo, v.posizione::posizione_enum
from (values
  ('Júlio César', 'PORTIERE'),
  ('Francesco Toldo', 'PORTIERE'),
  ('Maicon Sisenando', 'DIFENSORE'),
  ('Javier Zanetti', 'DIFENSORE'),
  ('Maxwell Andrade', 'DIFENSORE'),
  ('Cristian Chivu', 'DIFENSORE'),
  ('Walter Samuel', 'DIFENSORE'),
  ('Marco Materazzi', 'DIFENSORE'),
  ('Iván Córdoba', 'DIFENSORE'),
  ('Nicolás Burdisso', 'DIFENSORE'),
  ('Nelson Rivas', 'DIFENSORE'),
  ('Esteban Cambiasso', 'CENTROCAMPISTA'),
  ('Patrick Vieira', 'CENTROCAMPISTA'),
  ('Dejan Stanković', 'CENTROCAMPISTA'),
  ('Olivier Dacourt', 'CENTROCAMPISTA'),
  ('Luís Figo', 'ATTACCANTE'),
  ('Santiago Solari', 'ATTACCANTE'),
  ('Zlatan Ibrahimović', 'ATTACCANTE'),
  ('Hernán Crespo', 'ATTACCANTE'),
  ('Julio Cruz', 'ATTACCANTE'),
  ('David Suazo', 'ATTACCANTE'),
  ('Mario Balotelli', 'ATTACCANTE')
) as v(nome_completo, posizione)
join players p on p.nome_completo = v.nome_completo
join team_season ts on ts.team_id = 6 and ts.season_id = 29;

-- 4) player_role_map (uno o più ruoli per giocatore, con overall del ruolo)
insert into player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)
select ps.player_season_id, v.nome_completo, v.ruolo::ruolo_enum, v.ovr
from (values
  ('Júlio César', 'POR', 83),
  ('Francesco Toldo', 'POR', 79),
  ('Maicon Sisenando', 'TD', 83),
  ('Maicon Sisenando', 'ED', 81),
  ('Javier Zanetti', 'TD', 86),
  ('Javier Zanetti', 'CC', 84),
  ('Maxwell Andrade', 'TS', 80),
  ('Cristian Chivu', 'DC', 82),
  ('Cristian Chivu', 'TS', 80),
  ('Walter Samuel', 'DC', 84),
  ('Marco Materazzi', 'DC', 82),
  ('Iván Córdoba', 'DC', 82),
  ('Nicolás Burdisso', 'DC', 78),
  ('Nelson Rivas', 'DC', 73),
  ('Esteban Cambiasso', 'CDC', 85),
  ('Patrick Vieira', 'CDC', 84),
  ('Patrick Vieira', 'CC', 83),
  ('Dejan Stanković', 'CC', 83),
  ('Olivier Dacourt', 'CC', 78),
  ('Luís Figo', 'AD', 84),
  ('Luís Figo', 'ED', 82),
  ('Santiago Solari', 'AS', 77),
  ('Santiago Solari', 'ES', 76),
  ('Zlatan Ibrahimović', 'ATT', 88),
  ('Hernán Crespo', 'ATT', 84),
  ('Julio Cruz', 'ATT', 80),
  ('David Suazo', 'ATT', 82),
  ('Mario Balotelli', 'ATT', 68)
) as v(nome_completo, ruolo, ovr)
join player_season ps
  on ps.player_nome_completo = v.nome_completo
 and ps.team_season_id = (select team_season_id from team_season where team_id = 6 and season_id = 29);

-- 5) allenatore
insert into coaches (nome, cognome, nome_completo, nazionalita) values
  ('Roberto', 'Mancini', 'Roberto Mancini', 'Italia')
on conflict (nome_completo) do nothing;

insert into coach_season (coach_id, team_season_id, overall)
select c.coach_id, ts.team_season_id, 84
from coaches c
join team_season ts on ts.team_id = 6 and ts.season_id = 29
where c.nome_completo = 'Roberto Mancini';
