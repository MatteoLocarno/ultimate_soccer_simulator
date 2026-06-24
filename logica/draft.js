// ============================================================================
//  LOGICA DEL DRAFT
// ----------------------------------------------------------------------------
//  Per ogni ruolo (in ordine, dal portiere alla punta della formazione scelta)
//  vengono proposti 10 candidati a OVERALL NASCOSTO, con bande percentili:
//    3 dalla fascia bassa (peggior 20%), 5 dalla media (20-85%), 2 dalla top
//    (15%). I candidati arrivano da club/stagioni diversi (ognuno mostra il suo
//    club e anno) e sono mostrati in ordine alfabetico (l'ordine non rivela la
//    forza). Niente doppioni, nemmeno tra stagioni diverse.
//
//  3 SKIP (uno a testa, per tutto il draft) ripescano i 10 con scope diverso:
//    - "tutto"    : dall'intero database
//    - "stagione" : solo da una stagione (stessa annata)
//    - "club"     : solo da un club (stesso club)
// ============================================================================

import { SQUADRE } from "@/dati/squadre";
import { ALLENATORI } from "@/dati/allenatori";
import { macroRuolo } from "@/logica/formazione";

function casuale(a) { return a[Math.floor(Math.random() * a.length)]; }
function chiave(g) { return (g.cognome || g.nome || "").toLowerCase(); }
function ordinaAlfabetico(a, b) { return chiave(a).localeCompare(chiave(b), "it"); }

export function idGiocatore(squadra, g) { return `${squadra.id}__${g.nome}_${g.cognome}`; }
export function chiavePersona(g) { return `${g.nome}|${g.cognome}`; }

// Overall del giocatore per lo slot richiesto (ruolo esatto, o miglior reparto).
function overallPerSlot(g, slotRuolo) {
  const r = String(slotRuolo).toUpperCase();
  const esatto = g.ruoli.find((x) => x.ruolo.toUpperCase() === r);
  if (esatto) return Math.round(esatto.overall);
  const macro = macroRuolo(slotRuolo);
  const reparto = g.ruoli.filter((x) => macroRuolo(x.ruolo) === macro);
  const base = reparto.length ? reparto : g.ruoli;
  return Math.round(Math.max(...base.map((x) => x.overall)));
}

// Pool di tutti i candidati per un ruolo (esclusi quelli già scelti).
function poolPerRuolo(slotRuolo, idsUsati, personeUsate, squadre) {
  const r = String(slotRuolo).toUpperCase();
  const macro = macroRuolo(slotRuolo);
  const pool = [];
  for (const s of squadre) {
    for (const g of s.giocatori) {
      if (idsUsati.has(idGiocatore(s, g)) || personeUsate.has(chiavePersona(g))) continue;
      const esatto = g.ruoli.some((x) => x.ruolo.toUpperCase() === r);
      const macroOk = esatto || g.ruoli.some((x) => macroRuolo(x.ruolo) === macro);
      if (!macroOk) continue;
      pool.push({
        nome: g.nome, cognome: g.cognome, ruolo: slotRuolo,
        overall: overallPerSlot(g, slotRuolo), _id: idGiocatore(s, g), esatto,
        provenienza: { squadra: s.squadra, anno: s.anno, colore: s.colore },
      });
    }
  }
  // se ci sono abbastanza giocatori col ruolo ESATTO, usa solo quelli
  const esatti = pool.filter((p) => p.esatto);
  return esatti.length >= 10 ? esatti : pool;
}

function applicaScope(pool, scope) {
  if (!scope || scope.tipo === "tutto") return pool;
  const campo = scope.tipo === "stagione" ? "anno" : "squadra";
  const valori = [...new Set(pool.map((p) => p.provenienza[campo]))];
  if (!valori.length) return pool;
  const scelto = casuale(valori);
  const filtrato = pool.filter((p) => p.provenienza[campo] === scelto);
  return filtrato.length ? filtrato : pool;
}

// Seleziona 10 candidati con bande percentili (3 bassi / 5 medi / 2 top).
function selezionaBande(pool) {
  if (pool.length <= 10) return [...pool].sort(ordinaAlfabetico);
  const ord = [...pool].sort((a, b) => a.overall - b.overall);
  const n = ord.length;
  const bassi = ord.slice(0, Math.floor(n * 0.2));
  const medi = ord.slice(Math.floor(n * 0.2), Math.floor(n * 0.85));
  const alti = ord.slice(Math.floor(n * 0.85));
  const pesca = (arr, k) => {
    const c = [...arr], out = [];
    for (let i = 0; i < k && c.length; i++) out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]);
    return out;
  };
  let scelti = [...pesca(bassi, 3), ...pesca(medi, 5), ...pesca(alti, 2)];
  if (scelti.length < 10) {
    const set = new Set(scelti.map((p) => p._id));
    scelti = [...scelti, ...pesca(ord.filter((p) => !set.has(p._id)), 10 - scelti.length)];
  }
  return scelti.sort(ordinaAlfabetico);
}

// Estrae i candidati per lo slot. scope: {tipo: "tutto"|"stagione"|"club"}.
export function estraiCandidati(slotRuolo, idsUsati, personeUsate = new Set(), squadre = SQUADRE, scope = { tipo: "tutto" }) {
  const pool = applicaScope(poolPerRuolo(slotRuolo, idsUsati, personeUsate, squadre), scope);
  return { candidati: selezionaBande(pool) };
}

export function estraiAllenatori(n = 4, allenatori = ALLENATORI) {
  return [...allenatori]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((a) => ({ ...a, _id: `all-${a.nome}-${a.cognome}` }))
    .sort(ordinaAlfabetico);
}
