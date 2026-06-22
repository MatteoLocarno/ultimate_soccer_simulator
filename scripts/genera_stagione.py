#!/usr/bin/env python3
# ============================================================================
#  GENERA STAGIONE — da una cartella di HTML SoFIFA a un unico file .sql
# ----------------------------------------------------------------------------
#  Evoluzione dello script "una squadra alla volta": processa TUTTI gli .html
#  in una cartella (un file = una squadra) e produce un solo .sql per l'intera
#  stagione, pronto per lo schema Supabase del progetto.
#
#  Uso:
#     python scripts/genera_stagione.py <cartella_html> <anno> [out.sql]
#  Esempio:
#     python scripts/genera_stagione.py ./html_2007-2008 "2007-2008"
#
#  IMPORTANTE: il NOME DEL FILE (senza .html) deve coincidere ESATTAMENTE con
#  teams.nome_squadra (es. "Inter.html", "Hellas Verona.html", "Roma.html").
#  Il team_season viene creato/risolto per nome squadra + anno: non servono id.
#
#  Richiede solo Python 3 (librerie standard: re, sys, os, glob, html).
# ============================================================================

import re
import sys
import os
import glob
import html

# ---- Parsing HTML SoFIFA (logica originale) --------------------------------
def parse_team_html(html_path):
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    rows = re.findall(r'<tr class="(?:starting|sub|res)">(.*?)</tr>', html_content, re.DOTALL)

    players = []
    for row in rows:
        # /\d+/ al posto del codice edizione fisso: funziona per ogni stagione SoFIFA
        name_match = re.search(r'/player/(\d+)/([\w-]+)/\d+/"[^>]*data-tippy-content="([^"]*)"', row)
        pos_match = re.search(r'<span class="pos pos\d+">(\w+)</span>', row)
        ovr_match = re.search(r'data-col="oa"><em title="(\d+)">(\d+)</em>', row)
        nat_match = re.findall(r'title="([\w\s]+)" alt="" src="[^"]*pixel\.gif"', row)

        if name_match and pos_match and ovr_match:
            nome_completo = html.unescape(name_match.group(3).strip())
            players.append({
                "nome_completo": nome_completo,
                "ruolo_sofifa": pos_match.group(1),
                "overall": int(ovr_match.group(2)),
                "nazionalita": nat_match[0] if nat_match else None,
            })
    return players

# ---- Mapping ruoli SoFIFA -> enum custom (con doppi ruoli) -----------------
MAPPING = {
    "GK": ["POR"], "RB": ["TD"], "LB": ["TS"], "CB": ["DC"],
    "RWB": ["TD", "ED"], "LWB": ["TS", "ES"],
    "RM": ["ED"], "LM": ["ES"],
    "CDM": ["CDC"], "RDM": ["CDC"], "LDM": ["CDC"],
    "CM": ["CC"], "RCM": ["CC"], "LCM": ["CC"],
    "CAM": ["TRQ"], "RW": ["AD"], "LW": ["AS"],
    "ST": ["ATT"], "LS": ["ATT"], "RS": ["ATT"],
    "LF": ["ATT", "TRQ"], "RF": ["ATT", "TRQ"], "CF": ["ATT", "TRQ"],
}

POSIZIONE_MAP = {
    "POR": "PORTIERE",
    "TD": "DIFENSORE", "TS": "DIFENSORE", "DC": "DIFENSORE",
    "ED": "CENTROCAMPISTA", "ES": "CENTROCAMPISTA", "CDC": "CENTROCAMPISTA",
    "CC": "CENTROCAMPISTA", "TRQ": "CENTROCAMPISTA",
    "AD": "ATTACCANTE", "AS": "ATTACCANTE", "ATT": "ATTACCANTE",
}

def esc(s):
    return s.replace("'", "''") if s else s

def split_name(full_name):
    parts = full_name.strip().split(" ", 1)
    if len(parts) == 1:
        return parts[0], parts[0]
    return parts[0], parts[1]

# Sottoquery riutilizzabile per il team_season (per nome squadra + anno).
def ts_subquery(team, anno):
    return (
        "(SELECT ts.team_season_id FROM team_season ts "
        "JOIN teams t ON t.team_id = ts.team_id "
        "JOIN seasons s ON s.season_id = ts.season_id "
        f"WHERE t.nome_squadra = '{esc(team)}' AND s.anno = '{esc(anno)}')"
    )

def blocco_squadra(team, anno, players):
    out = []
    out.append(f"-- ===== {team} {anno} ({len(players)} giocatori) =====")

    # 1) team_season (creato per nome + anno; trigger riempiono key e nome)
    out.append(
        "INSERT INTO team_season (team_id, season_id)\n"
        f"SELECT t.team_id, s.season_id FROM teams t, seasons s "
        f"WHERE t.nome_squadra = '{esc(team)}' AND s.anno = '{esc(anno)}'\n"
        "ON CONFLICT (team_id, season_id) DO NOTHING;"
    )

    # 2) players
    righe = []
    for p in players:
        nome, cognome = split_name(p["nome_completo"])
        nat = f"'{esc(p['nazionalita'])}'" if p["nazionalita"] else "NULL"
        righe.append(f"  ('{esc(nome)}', '{esc(cognome)}', '{esc(p['nome_completo'])}', {nat})")
    out.append(
        "INSERT INTO players (nome, cognome, nome_completo, nazionalita) VALUES\n"
        + ",\n".join(righe)
        + "\nON CONFLICT (nome_completo) DO NOTHING;"
    )

    # 3) player_season (posizione macro)
    righe = []
    for p in players:
        ruolo_principale = MAPPING.get(p["ruolo_sofifa"], [None])[0]
        pos = POSIZIONE_MAP.get(ruolo_principale)
        if not pos:
            print(f"  ! ruolo SoFIFA non mappato: {p['ruolo_sofifa']} ({p['nome_completo']}) — saltato")
            continue
        righe.append(f"  ('{esc(p['nome_completo'])}', '{pos}')")
    out.append(
        "INSERT INTO player_season (player_id, team_season_id, player_nome_completo, posizione)\n"
        "SELECT pl.player_id, ts.team_season_id, v.nc, v.pos::posizione_enum\n"
        "FROM (VALUES\n" + ",\n".join(righe) + "\n) AS v(nc, pos)\n"
        "JOIN players pl ON pl.nome_completo = v.nc\n"
        f"JOIN team_season ts ON ts.team_id = (SELECT team_id FROM teams WHERE nome_squadra = '{esc(team)}')\n"
        f"                   AND ts.season_id = (SELECT season_id FROM seasons WHERE anno = '{esc(anno)}');"
    )

    # 4) player_role_map (uno o piu' ruoli per giocatore)
    righe = []
    for p in players:
        ruoli = MAPPING.get(p["ruolo_sofifa"])
        if not ruoli:
            continue
        for r in ruoli:
            righe.append(f"  ('{esc(p['nome_completo'])}', '{r}', {p['overall']})")
    out.append(
        "INSERT INTO player_role_map (player_season_id, player_nome_completo, ruolo, overall_ruolo)\n"
        "SELECT ps.player_season_id, v.nc, v.ruolo::ruolo_enum, v.ovr\n"
        "FROM (VALUES\n" + ",\n".join(righe) + "\n) AS v(nc, ruolo, ovr)\n"
        f"JOIN player_season ps ON ps.player_nome_completo = v.nc AND ps.team_season_id = {ts_subquery(team, anno)};"
    )

    return "\n\n".join(out)

def main():
    if len(sys.argv) < 3:
        print("Uso: python scripts/genera_stagione.py <cartella_html> <anno> [out.sql]")
        sys.exit(1)

    cartella = sys.argv[1]
    anno = sys.argv[2]
    out_path = sys.argv[3] if len(sys.argv) > 3 else f"{anno}_seed.sql"

    files = sorted(glob.glob(os.path.join(cartella, "*.html")))
    if not files:
        print(f"Nessun .html in {cartella}")
        sys.exit(1)

    blocchi = [
        f"-- ============================================================",
        f"-- SEED STAGIONE {anno} — generato da genera_stagione.py",
        f"-- Eseguire UNA volta nel SQL Editor di Supabase.",
        f"-- ============================================================",
    ]
    totale = 0
    for fpath in files:
        team = os.path.splitext(os.path.basename(fpath))[0]
        players = parse_team_html(fpath)
        if not players:
            print(f"  ! nessun giocatore trovato in {fpath} — controlla l'HTML")
            continue
        print(f"  {team}: {len(players)} giocatori")
        totale += len(players)
        blocchi.append(blocco_squadra(team, anno, players))

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(blocchi) + "\n")

    print(f"\nGenerato {out_path}: {len(files)} squadre, {totale} giocatori.")

if __name__ == "__main__":
    main()
