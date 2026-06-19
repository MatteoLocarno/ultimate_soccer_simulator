// ============================================================================
//  CARICAMENTO DATI (Supabase con fallback ai dati locali)
// ----------------------------------------------------------------------------
//  Prova a leggere squadre/giocatori/allenatori da Supabase. Se Supabase non è
//  configurato, dà errore o restituisce tabelle vuote, usa i dati locali in
//  /dati così il gioco funziona comunque.
// ============================================================================

import { supabase, supabaseAttivo } from "@/lib/supabaseClient";
import { SQUADRE } from "@/dati/squadre";
import { ALLENATORI } from "@/dati/allenatori";

// Dati locali di riserva, sempre disponibili.
export const DATI_LOCALI = { squadre: SQUADRE, allenatori: ALLENATORI };

export async function caricaDati() {
  if (!supabaseAttivo) return { ...DATI_LOCALI, fonte: "locale" };

  try {
    const [risSquadre, risAllenatori] = await Promise.all([
      supabase
        .from("squadre")
        .select("id, squadra, anno, colore, giocatori(nome, cognome, ruolo, overall)"),
      supabase.from("allenatori").select("nome, cognome, overall"),
    ]);

    if (risSquadre.error) throw risSquadre.error;
    if (risAllenatori.error) throw risAllenatori.error;

    const squadre = risSquadre.data || [];
    const allenatori = risAllenatori.data || [];

    // Se le tabelle sono vuote o incomplete, meglio i dati locali.
    const squadreOk = squadre.length >= 20 &&
      squadre.every((s) => Array.isArray(s.giocatori) && s.giocatori.length >= 11);
    if (!squadreOk || allenatori.length < 4) {
      return { ...DATI_LOCALI, fonte: "locale" };
    }

    return { squadre, allenatori, fonte: "supabase" };
  } catch (e) {
    console.warn("Supabase non disponibile, uso i dati locali:", e?.message || e);
    return { ...DATI_LOCALI, fonte: "locale" };
  }
}
