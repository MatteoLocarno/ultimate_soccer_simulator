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

// --- colori squadra (il DB non li contiene): match per nome -----------------
const COLORI_SQUADRE = [
  ["milan", "#fb0a18"], ["juventus", "#111111"], ["inter", "#0b1f8f"],
  ["napoli", "#12a0d7"], ["roma", "#8e1b2e"], ["lazio", "#88c7eb"],
  ["sampdoria", "#0a3d8f"], ["parma", "#f6c800"], ["fiorentina", "#7b2bbd"],
  ["verona", "#1b5e9b"], ["torino", "#7a1420"], ["atalanta", "#1b6ec2"],
  ["bologna", "#9c1f2e"], ["genoa", "#a01c2b"], ["cagliari", "#9c1f3a"],
  ["udinese", "#1c1c1c"],
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
  if (players && (players.nome || players.cognome)) {
    return { nome: players.nome || "", cognome: players.cognome || "" };
  }
  const parti = (nomeCompleto || "").trim().split(/\s+/);
  if (parti.length <= 1) return { nome: parti[0] || "", cognome: "" };
  return { nome: parti[0], cognome: parti.slice(1).join(" ") };
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

export async function caricaDati() {
  if (!supabaseAttivo) return { ...DATI_LOCALI, fonte: "locale" };

  try {
    const [risTS, risCoach, risForm] = await Promise.all([
      supabase.from("team_season").select(
        `team_season_id, team_nome,
         teams ( nome_squadra ),
         seasons ( anno ),
         player_season ( player_nome_completo, posizione,
           players ( nome, cognome ),
           player_role_map ( ruolo, overall_ruolo ) )`
      ),
      supabase.from("coach_season").select(`overall, coach_nome_completo, coaches ( nome, cognome )`),
      supabase.from("formations").select(
        `formation_id, nome, formation_slots ( slot_numero, ruolo, pos_x, pos_y )`
      ),
    ]);

    if (risTS.error) throw risTS.error;
    if (risCoach.error) throw risCoach.error;

    // --- squadre-stagione ---
    const squadre = (risTS.data || [])
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

    // --- allenatori (deduplicati per persona, overall migliore) ---
    const mappaAll = new Map();
    for (const cs of risCoach.data || []) {
      const { nome, cognome } = nomeCognome(cs.coaches, cs.coach_nome_completo);
      const overall = Math.round(Number(cs.overall));
      if (!Number.isFinite(overall) || (!nome && !cognome)) continue;
      const k = `${nome}|${cognome}`;
      const e = mappaAll.get(k);
      if (!e || overall > e.overall) mappaAll.set(k, { nome, cognome, overall });
    }
    const allenatori = [...mappaAll.values()];

    // --- formazioni dal DB (con coordinate) ---
    let formazioni = (risForm?.data || [])
      .map((f) => {
        const slots = [...(f.formation_slots || [])].sort((a, b) => a.slot_numero - b.slot_numero);
        const posizioni = slots.map((s) => ({
          ruolo: String(s.ruolo).toUpperCase(),
          x: Number(s.pos_x),
          y: 100 - Number(s.pos_y), // pos_y: 5 porta → 78 attacco ⇒ y schermo
        }));
        return { id: String(f.formation_id), nome: f.nome, posizioni, descrizione: descriviModulo(posizioni) };
      })
      .filter((f) => f.posizioni.length === 11);
    if (formazioni.length === 0) formazioni = MODULI;

    if (squadre.length < 20 || allenatori.length < 4) {
      console.warn(`Supabase: dati insufficienti (${squadre.length} squadre, ${allenatori.length} allenatori) — uso i dati locali.`);
      return { ...DATI_LOCALI, formazioni, fonte: "locale" };
    }

    console.info(`Dati da Supabase: ${squadre.length} squadre, ${allenatori.length} allenatori, ${formazioni.length} formazioni.`);
    return { squadre, allenatori, formazioni, fonte: "supabase" };
  } catch (e) {
    console.warn("Supabase non disponibile, uso i dati locali:", e?.message || e);
    return { ...DATI_LOCALI, fonte: "locale" };
  }
}
