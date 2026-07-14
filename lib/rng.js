// ============================================================================
//  RNG DETERMINISTICO (seedabile)
// ----------------------------------------------------------------------------
//  Il singolo giocatore usa Math.random (ogni partita è diversa). Il PvP, al
//  contrario, deve produrre lo STESSO campionato per tutti gli iscritti che lo
//  aprono la domenica: la classifica ufficiale non può cambiare a seconda di
//  chi la guarda. Per questo la simulazione PvP gira con un RNG seedato dal
//  torneo (stessa settimana → stesso seme → stessa stagione simulata).
//
//  Algoritmi: hash stringa → intero (djb2/xfnv) + mulberry32 (PRNG a 32 bit,
//  veloce e con buona distribuzione, più che sufficiente per gol/assist).
// ============================================================================

// Hash di una stringa in un intero a 32 bit (per derivare un seme dal nome
// del torneo, es. "2026-W28").
export function hashStringa(str) {
  let h = 2166136261 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// PRNG mulberry32: dato un seme intero, torna una funzione () => [0,1) come
// Math.random, ma deterministica.
export function creaRng(seme) {
  let a = (typeof seme === "string" ? hashStringa(seme) : seme >>> 0) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
