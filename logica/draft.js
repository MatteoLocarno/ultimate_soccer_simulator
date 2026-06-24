// ============================================================================
//  LOGICA DEL DRAFT
// ----------------------------------------------------------------------------
//  Per ogni slot viene estratta una squadra storica a caso e si sceglie un
//  giocatore (a overall nascosto). Regole:
//   - candidati in ordine alfabetico (l'ordine non rivela la forza);
//   - niente doppioni, nemmeno tra stagioni diverse;
//   - lo slot ha un RUOLO (dettagliato per i titolari, macro per la panchina):
//     si preferiscono i giocatori con quel ruolo esatto, altrimenti quelli
//     dello stesso reparto. L'overall usato è quello del ruolo dello slot
//     (o il migliore del reparto se non ha quel ruolo esatto).
// ============================================================================

import { SQUADRE } from "@/dati/squadre";
import { ALLENATORI } from "@/dati/allenatori";
import { macroRuolo } from "@/logica/formazione";

function casuale(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function chiave(g) {
  return (g.cognome || g.nome || "").toLowerCase();
}
function ordinaAlfabetico(a, b) {
  return chiave(a).localeCompare(chiave(b), "it");
}

// Identità della persona (a prescindere da stagione/ruolo): evita i doppioni.
export function idGiocatore(squadra, giocatore) {
  return `${squadra.id}__${giocatore.nome}_${giocatore.cognome}`;
}
export function chiavePersona(giocatore) {
  return `${giocatore.nome}|${giocatore.cognome}`;
}

// Overall del giocatore per lo slot richiesto.
function overallPerSlot(g, slotRuolo) {
  const r = String(slotRuolo).toUpperCase();
  const esatto = g.ruoli.find((x) => x.ruolo.toUpperCase() === r);
  if (esatto) return Math.round(esatto.overall);
  const macro = macroRuolo(slotRuolo);
  const reparto = g.ruoli.filter((x) => macroRuolo(x.ruolo) === macro);
  const base = reparto.length ? reparto : g.ruoli;
  return Math.round(Math.max(...base.map((x) => x.overall)));
}

// Giocatori di una squadra idonei a uno slot (ruolo esatto, o stesso reparto).
function idonei(squadra, slotRuolo, idsUsati, personeUsate) {
  const liberi = squadra.giocatori.filter(
    (g) => !idsUsati.has(idGiocatore(squadra, g)) && !personeUsate.has(chiavePersona(g))
  );
  const r = String(slotRuolo).toUpperCase();
  const esatti = liberi.filter((g) => g.ruoli.some((x) => x.ruolo.toUpperCase() === r));
  if (esatti.length) return esatti;
  const macro = macroRuolo(slotRuolo);
  return liberi.filter((g) => g.ruoli.some((x) => macroRuolo(x.ruolo) === macro));
}

// Estrae una squadra con candidati per lo slot. Ritorna { squadra, candidati }.
export function estraiPerRuolo(slotRuolo, idsUsati, personeUsate = new Set(), squadre = SQUADRE) {
  const disponibili = squadre.filter(
    (s) => idonei(s, slotRuolo, idsUsati, personeUsate).length > 0
  );
  if (disponibili.length === 0) return null;

  const squadra = casuale(disponibili);
  const candidati = idonei(squadra, slotRuolo, idsUsati, personeUsate)
    .map((g) => ({
      nome: g.nome,
      cognome: g.cognome,
      ruolo: slotRuolo,
      overall: overallPerSlot(g, slotRuolo),
      _id: idGiocatore(squadra, g),
    }))
    .sort(ordinaAlfabetico);

  return { squadra, candidati };
}

// Estrae n allenatori casuali (distinti), in ordine alfabetico.
export function estraiAllenatori(n = 4, allenatori = ALLENATORI) {
  return [...allenatori]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((a) => ({ ...a, _id: `all-${a.nome}-${a.cognome}` }))
    .sort(ordinaAlfabetico);
}
