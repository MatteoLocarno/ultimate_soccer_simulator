// ============================================================================
//  CARICAMENTO DATI (Supabase con fallback ai dati locali)
// ----------------------------------------------------------------------------
//  Mappa lo schema normalizzato di Supabase nella forma usata dal gioco:
//    squadra-stagione = { id, squadra, anno, colore, giocatori: [...] }
//    giocatore        = { nome, cognome, ruoli: [{ruolo, overall}], overall }
//    allenatore       = { nome, cognome, overall }
//    formazione       = { id, nome, descrizione, posizioni: [{ruolo, x, y}] }
//
//  Lo schema DB: player_season ha solo `posizione`; ruoli+overall stanno in
//  `player_role_map`. Le formazioni in formations/formation_slots (coordinate
//  pos_y: 5 = porta → 78 = attacco, qui convertite in y schermo = 100 - pos_y).
//
//  Se Supabase manca o ha pochi dati, si usano i dati locali.
// ============================================================================

import { supabase, supabaseAttivo } from "@/lib/supabaseClient";
import { SQUADRE } from "@/dati/squadre";
import { ALLENATORI } from "@/dati/allenatori";
import { MODULI, macroRuolo, descriviModulo } from "@/logica/formazione";

// --- colori squadra (il DB non li contiene): match per nome, sui colori
// sociali reali di ogni club (non un colore a caso). Copre tutti i club
// storicamente presenti nel database; PALETTE_FALLBACK resta solo per
// l'evenienza rarissima di un nome squadra non riconosciuto.
const COLORI_SQUADRE = [
  ["milan", "#fb0a18"], ["juventus", "#111111"], ["inter", "#0b1f8f"],
  ["napoli", "#12a0d7"], ["roma", "#8e1b2e"], ["lazio", "#88c7eb"],
  ["sampdoria", "#0a3d8f"], ["parma", "#f6c800"], ["fiorentina", "#7b2bbd"],
  ["hellas verona", "#f4c81a"], ["verona", "#f4c81a"], ["torino", "#7a1420"],
  ["atalanta", "#1b6ec2"], ["bologna", "#9c1f2e"], ["genoa", "#a01c2b"],
  ["cagliari", "#9c1f3a"], ["udinese", "#1c1c1c"],
  ["chievo", "#f4c81a"], ["sassuolo", "#0a8a4b"], ["empoli", "#0f5faa"],
  ["palermo", "#d6006c"], ["catania", "#c8102e"], ["lecce", "#f4c81a"],
  ["siena", "#1a1a1a"], ["livorno", "#7d2248"], ["cesena", "#2b2b2b"],
  ["crotone", "#c8102e"], ["frosinone", "#1c4e9c"], ["monza", "#e2001a"],
  ["reggina", "#7a1f3d"], ["salernitana", "#7a1420"], ["spal", "#1f7fc1"],
  ["spezia", "#1c2b4a"], ["bari", "#c8102e"], ["benevento", "#c8a415"],
  ["brescia", "#0f5fa8"], ["como", "#0b3d91"], ["cremonese", "#9c2430"],
  ["pescara", "#1f9fe0"], ["venezia", "#f57c20"], ["ascoli", "#1a1a1a"],
  ["carpi", "#c8102e"], ["messina", "#d4a017"], ["novara", "#1f5faa"],
  ["pisa", "#0d3b66"],
];
const PALETTE_FALLBACK = ["#9c2a24", "#3f6b3a", "#0b1f8f", "#a8761a", "#7b2bbd", "#12a0d7", "#8e1b2e"];

function coloreSquadra(nome) {
  const n = (nome || "").toLowerCase();
  for (const [chiave, colore] of COLORI_SQUADRE) if (n.includes(chiave)) return colore;
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return PALETTE_FALLBACK[h % PALETTE_FALLBACK.length];
}

function nomeCognome(players, nomeCompleto) {
  // Mononimi (Kaká, Ronaldinho, Maicon, Dida…): il "nome completo" è
  // l'identità del giocatore in tutto il gioco (player_season, ruoli...).
  // Se è una sola parola si mostra solo quella, anche se in DB sono salvati
  // nome/cognome anagrafici più ricchi (es. Maicon → "Maicon Sisenando").
  const completo = (nomeCompleto || "").trim();
  if (completo && !/\s/.test(completo)) return { nome: completo, cognome: "" };

  let nome, cognome;
  if (players && (players.nome || players.cognome)) {
    nome = players.nome || "";
    cognome = players.cognome || "";
  } else {
    const parti = completo.split(/\s+/);
    nome = parti[0] || "";
    cognome = parti.length > 1 ? parti.slice(1).join(" ") : "";
  }
  // mononimi senza nome_completo affidabile: evita "Doni Doni"
  if (cognome && cognome.toLowerCase() === nome.toLowerCase()) cognome = "";
  return { nome, cognome };
}

// Converte i dati locali (ruolo macro singolo) nella forma "ruoli[]".
function squadreLocali() {
  return SQUADRE.map((s) => ({
    ...s,
    giocatori: s.giocatori.map((g) => ({
      nome: g.nome,
      cognome: g.cognome,
      ruoli: [{ ruolo: g.ruolo, overall: g.overall }],
      overall: g.overall,
    })),
  }));
}

export const DATI_LOCALI = {
  squadre: squadreLocali(),
  allenatori: ALLENATORI,
  formazioni: MODULI,
};

// Il DB ora copre centinaia di squadre-stagione: una select unica con join
// annidati (giocatori + ruoli) va in timeout lato Postgres, e anche
// paginare con range()/OFFSET rallenta troppo (Postgres deve scandire e
// scartare le righe precedenti nei join a ogni pagina). Si scaricano prima
// solo gli ID (veloce), poi si interroga a blocchi filtrando per ID
// (ricerca indicizzata, costante) IN SEQUENZA — anche solo 2-3 richieste in
// parallelo bastano a far ripartire i timeout sul DB.
const PAGINA_TEAM_SEASON = 40;

// onProgresso(fatti, totali): chiamato dopo ogni blocco, per mostrare una
// barra di caricamento reale (non finta) in UI.
async function caricaTuttiTeamSeason(onProgresso) {
  const { data: idsData, error: erroreIds } = await supabase
    .from("team_season")
    .select("team_season_id")
    .order("team_season_id");
  if (erroreIds) throw erroreIds;

  const ids = (idsData || []).map((r) => r.team_season_id);
  const risultato = [];
  for (let i = 0; i < ids.length; i += PAGINA_TEAM_SEASON) {
    const blocco = ids.slice(i, i + PAGINA_TEAM_SEASON);
    const { data, error } = await supabase
      .from("team_season")
      .select(
        `team_season_id, team_nome,
         teams ( nome_squadra ),
         seasons ( anno ),
         player_season ( player_nome_completo, posizione,
           players ( nome, cognome ),
           player_role_map ( ruolo, overall_ruolo ) )`
      )
      .in("team_season_id", blocco);
    if (error) throw error;
    risultato.push(...(data || []));
    onProgresso?.(risultato.length, ids.length);
  }
  return risultato;
}

// Allenatori + formazioni: dati piccoli, veloci da scaricare. Separati dalle
// squadre (lente, centinaia di righe) così la schermata di setup — che
// serve solo modulo e colore — non deve aspettare il caricamento di tutte
// le squadre-stagione per mostrare le formazioni vere del DB.
export async function caricaAllenatoriEFormazioni() {
  if (!supabaseAttivo) return { allenatori: DATI_LOCALI.allenatori, formazioni: DATI_LOCALI.formazioni, fonte: "locale" };

  try {
    const [risCoach, risForm] = await Promise.all([
      supabase.from("coach_season").select(`overall, coach_nome_completo, coaches ( nome, cognome )`),
      supabase.from("formations").select(
        `formation_id, nome, formation_slots ( slot_numero, ruolo, pos_x, pos_y )`
      ),
    ]);
    if (risCoach.error) throw risCoach.error;

    const mappaAll = new Map();
    for (const cs of risCoach.data || []) {
      const { nome, cognome } = nomeCognome(cs.coaches, cs.coach_nome_completo);
      const overall = Math.round(Number(cs.overall));
      if (!Number.isFinite(overall) || (!nome && !cognome)) continue;
      const k = `${nome}|${cognome}`;
      const e = mappaAll.get(k);
      if (!e || overall > e.overall) mappaAll.set(k, { nome, cognome, overall });
    }
    const allenatoriDB = [...mappaAll.values()];

    let formazioni = (risForm?.data || [])
      .map((f) => {
        const slots = [...(f.formation_slots || [])].sort((a, b) => a.slot_numero - b.slot_numero);
        // pos_x 0-100 → 10-90 (margini laterali); pos_y 5(porta)-78(attacco) →
        // 86(basso)-22(alto), con margini sopra/sotto per non toccare i bordi.
        const posizioni = slots.map((s) => ({
          ruolo: String(s.ruolo).toUpperCase(),
          x: 10 + (Number(s.pos_x) / 100) * 80,
          y: 90 - Number(s.pos_y) * 0.84,
        }));
        return { id: String(f.formation_id), nome: f.nome, posizioni, descrizione: descriviModulo(posizioni) };
      })
      .filter((f) => f.posizioni.length === 11);
    if (formazioni.length === 0) formazioni = MODULI;

    const allenatori = allenatoriDB.length >= 4 ? allenatoriDB : DATI_LOCALI.allenatori;
    return { allenatori, formazioni, fonte: allenatoriDB.length >= 4 ? "supabase" : "locale" };
  } catch (e) {
    console.warn("Allenatori/formazioni: Supabase non disponibile, uso i dati locali:", e?.message || e);
    return { allenatori: DATI_LOCALI.allenatori, formazioni: DATI_LOCALI.formazioni, fonte: "locale" };
  }
}

// Squadre-stagione: centinaia di righe, il caricamento più lento. Separato
// da allenatori/formazioni (vedi sopra). onProgresso(fatti, totali): per la
// barra di caricamento in UI.
export async function caricaSquadre(onProgresso) {
  if (!supabaseAttivo) return { squadre: DATI_LOCALI.squadre, fonte: "locale" };

  try {
    const datiTeamSeason = await caricaTuttiTeamSeason(onProgresso);

    const squadre = (datiTeamSeason || [])
      .map((ts) => {
        // nome "puro" del club (lo schema mette la stagione dentro team_nome)
        const club = ts.teams?.nome_squadra || (ts.team_nome || "").replace(/\s*\d{4}-\d{4}\s*$/, "") || "Squadra";
        const giocatori = (ts.player_season || [])
          .map((p) => {
            const { nome, cognome } = nomeCognome(p.players, p.player_nome_completo);
            let ruoli = (p.player_role_map || [])
              .map((r) => ({ ruolo: String(r.ruolo).toUpperCase(), overall: Math.round(Number(r.overall_ruolo)) }))
              .filter((r) => r.ruolo && Number.isFinite(r.overall));
            // se mancano i ruoli ma c'è la posizione macro, crea un ruolo base
            if (ruoli.length === 0 && p.posizione) {
              const m = macroRuolo(p.posizione);
              if (m) ruoli = [{ ruolo: m, overall: NaN }];
            }
            ruoli = ruoli.filter((r) => Number.isFinite(r.overall));
            const overall = ruoli.length ? Math.max(...ruoli.map((r) => r.overall)) : NaN;
            return { nome, cognome, ruoli, overall };
          })
          .filter((g) => g.ruoli.length > 0 && Number.isFinite(g.overall));
        return {
          id: String(ts.team_season_id),
          squadra: club,
          anno: ts.seasons?.anno || "",
          colore: coloreSquadra(club),
          giocatori,
        };
      })
      .filter((s) => s.giocatori.length >= 11);

    if (squadre.length < 20) {
      console.warn(`Supabase: dati insufficienti (${squadre.length} squadre) — uso i dati locali.`);
      return { squadre: DATI_LOCALI.squadre, fonte: "locale" };
    }

    console.info(`Squadre da Supabase: ${squadre.length}.`);
    return { squadre, fonte: "supabase" };
  } catch (e) {
    console.warn("Squadre: Supabase non disponibile, uso i dati locali:", e?.message || e);
    return { squadre: DATI_LOCALI.squadre, fonte: "locale" };
  }
}

// Compatibilità: carica tutto insieme (usato solo se serve un unico blocco).
export async function caricaDati() {
  const [{ allenatori, formazioni }, { squadre }] = await Promise.all([
    caricaAllenatoriEFormazioni(),
    caricaSquadre(),
  ]);
  const fonte = squadre === DATI_LOCALI.squadre ? "locale" : "supabase";
  return { squadre, allenatori, formazioni, fonte };
}
