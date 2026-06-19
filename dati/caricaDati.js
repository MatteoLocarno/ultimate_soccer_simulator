// ============================================================================
//  CARICAMENTO DATI (Supabase con fallback ai dati locali)
// ----------------------------------------------------------------------------
//  Mappa lo schema normalizzato di Supabase (team_season, player_season,
//  players/teams/seasons, coach_season/coaches) nella forma usata dal gioco:
//    squadra-stagione = { id, squadra, anno, colore, giocatori: [...] }
//    allenatore        = { nome, cognome, overall }
//
//  Se Supabase non è configurato, dà errore o ha pochi dati, si usano i dati
//  locali in /dati così il gioco funziona comunque.
// ============================================================================

import { supabase, supabaseAttivo } from "@/lib/supabaseClient";
import { SQUADRE } from "@/dati/squadre";
import { ALLENATORI } from "@/dati/allenatori";

// Dati locali di riserva, sempre disponibili.
export const DATI_LOCALI = { squadre: SQUADRE, allenatori: ALLENATORI };

// Colori per le squadre note (lo schema DB non li contiene): match per nome.
const COLORI_SQUADRE = [
  ["milan", "#fb0a18"],
  ["juventus", "#111111"],
  ["inter", "#0b1f8f"],
  ["napoli", "#12a0d7"],
  ["roma", "#8e1b2e"],
  ["lazio", "#88c7eb"],
  ["sampdoria", "#0a3d8f"],
  ["parma", "#f6c800"],
  ["fiorentina", "#7b2bbd"],
  ["verona", "#1b5e9b"],
  ["torino", "#7a1420"],
  ["atalanta", "#1b6ec2"],
  ["bologna", "#9c1f2e"],
  ["genoa", "#a01c2b"],
  ["cagliari", "#9c1f3a"],
  ["udinese", "#1c1c1c"],
];
const PALETTE_FALLBACK = [
  "#9c2a24", "#3f6b3a", "#0b1f8f", "#a8761a", "#7b2bbd", "#12a0d7", "#8e1b2e",
];

function coloreSquadra(nome) {
  const n = (nome || "").toLowerCase();
  for (const [chiave, colore] of COLORI_SQUADRE) {
    if (n.includes(chiave)) return colore;
  }
  // colore stabile dal nome (hash semplice) per le squadre non in elenco
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return PALETTE_FALLBACK[h % PALETTE_FALLBACK.length];
}

// Riduce i ruoli dettagliati del DB ai 4 macro-ruoli usati dal gioco (P/D/C/A).
const MAPPA_RUOLO = {
  // portiere
  POR: "P", GK: "P", P: "P",
  // difensori (terzini + centrali)
  TD: "D", TS: "D", DC: "D", DCD: "D", DCS: "D", DD: "D", DS: "D", D: "D",
  // centrocampisti (mediani, mezzali, registi, esterni di centrocampo)
  CC: "C", CDC: "C", MED: "C", REG: "C", MEZ: "C", ED: "C", ES: "C", C: "C",
  // attaccanti (ali, trequartisti, punte)
  AD: "A", AS: "A", TRQ: "A", ATT: "A", SP: "A", PC: "A", SS: "A", A: "A",
};

function normalizzaRuolo(r) {
  if (!r) return null;
  const s = String(r).trim().toUpperCase();
  if (MAPPA_RUOLO[s]) return MAPPA_RUOLO[s];
  // fallback per eventuali parole estese non previste
  if (s.startsWith("PORT")) return "P";
  if (s.startsWith("DIF") || s.startsWith("TER")) return "D";
  if (s.startsWith("CEN") || s.startsWith("MED") || s.startsWith("EST")) return "C";
  if (s.startsWith("ATT") || s.startsWith("ALA") || s.startsWith("PUN") || s.startsWith("TREQ")) return "A";
  return null;
}

function nomeCognome(players, nomeCompleto) {
  if (players && (players.nome || players.cognome)) {
    return { nome: players.nome || "", cognome: players.cognome || "" };
  }
  const parti = (nomeCompleto || "").trim().split(/\s+/);
  if (parti.length <= 1) return { nome: parti[0] || "", cognome: "" };
  return { nome: parti[0], cognome: parti.slice(1).join(" ") };
}

export async function caricaDati() {
  if (!supabaseAttivo) return { ...DATI_LOCALI, fonte: "locale" };

  try {
    const [risTS, risCoach] = await Promise.all([
      supabase
        .from("team_season")
        .select(
          `team_season_id, team_nome,
           teams ( nome_squadra ),
           seasons ( anno ),
           player_season ( overall, ruolo_principale, player_nome_completo, players ( nome, cognome ) )`
        ),
      supabase
        .from("coach_season")
        .select(`overall, coach_nome_completo, coaches ( nome, cognome )`),
    ]);

    if (risTS.error) throw risTS.error;
    if (risCoach.error) throw risCoach.error;

    // squadre-stagione
    const squadre = (risTS.data || [])
      .map((ts) => {
        const nomeSq = ts.team_nome || ts.teams?.nome_squadra || "Squadra";
        const giocatori = (ts.player_season || [])
          .map((ps) => {
            const { nome, cognome } = nomeCognome(ps.players, ps.player_nome_completo);
            return {
              nome,
              cognome,
              ruolo: normalizzaRuolo(ps.ruolo_principale),
              overall: Math.round(Number(ps.overall)),
            };
          })
          .filter((g) => g.ruolo && Number.isFinite(g.overall));
        return {
          id: String(ts.team_season_id),
          squadra: nomeSq,
          anno: ts.seasons?.anno || "",
          colore: coloreSquadra(nomeSq),
          giocatori,
        };
      })
      .filter((s) => s.giocatori.length >= 11);

    // allenatori (deduplicati per persona, tenendo l'overall migliore)
    const mappaAll = new Map();
    for (const cs of risCoach.data || []) {
      const { nome, cognome } = nomeCognome(cs.coaches, cs.coach_nome_completo);
      const overall = Math.round(Number(cs.overall));
      if (!Number.isFinite(overall) || (!nome && !cognome)) continue;
      const chiave = `${nome}|${cognome}`;
      const esistente = mappaAll.get(chiave);
      if (!esistente || overall > esistente.overall) {
        mappaAll.set(chiave, { nome, cognome, overall });
      }
    }
    const allenatori = [...mappaAll.values()];

    // Se i dati sono insufficienti, meglio i locali.
    if (squadre.length < 20 || allenatori.length < 4) {
      console.warn(
        `Supabase: dati insufficienti (${squadre.length} squadre valide, ${allenatori.length} allenatori) — uso i dati locali. ` +
          "Controlla che le tabelle siano popolate e leggibili (RLS/grant)."
      );
      return { ...DATI_LOCALI, fonte: "locale" };
    }

    console.info(
      `Dati da Supabase: ${squadre.length} squadre, ${allenatori.length} allenatori.`
    );
    return { squadre, allenatori, fonte: "supabase" };
  } catch (e) {
    console.warn("Supabase non disponibile, uso i dati locali:", e?.message || e);
    return { ...DATI_LOCALI, fonte: "locale" };
  }
}
