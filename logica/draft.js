// ============================================================================
//  LOGICA DEL DRAFT
// ----------------------------------------------------------------------------
//  Per ogni ruolo (in ordine, dal portiere alla punta della formazione scelta)
//  vengono proposti 10 candidati a OVERALL NASCOSTO, TUTTI DALLA STESSA
//  squadra storica (scelta a caso ad ogni round): prima i giocatori
//  compatibili col ruolo, poi — se la squadra non ne ha abbastanza — si
//  completa con altri suoi giocatori, per avere sempre 10 nomi tra cui
//  scegliere. Mostrati in ordine alfabetico (l'ordine non rivela la forza).
//  Niente doppioni, nemmeno tra stagioni diverse.
//
//  3 SKIP (uno a testa, per tutto il draft) ripescano i 10 con scope diverso:
//    - "tutto"    : mix di giocatori dall'intero database (comportamento
//                   pre-esistente, usato come ripesca speciale)
//    - "stagione" : solo da una stagione (stessa annata, più club)
//    - "club"     : un'altra squadra a caso (nuovo tentativo del default)
// ============================================================================

import { SQUADRE } from "@/dati/squadre";
import { ALLENATORI } from "@/dati/allenatori";
import { macroRuolo } from "@/logica/formazione";

const MINIMO_CANDIDATI_SQUADRA = 4; // sotto questa soglia si scarta la squadra
const TENTATIVI_SQUADRA = 25;

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

// Ruolo "vero" del giocatore (quello col miglior overall tra i suoi).
function ruoloReale(g) {
  return g.ruoli.reduce((a, b) => (b.overall > a.overall ? b : a)).ruolo;
}

function candidatoDa(squadra, g, slotRuolo) {
  const r = String(slotRuolo).toUpperCase();
  const macro = macroRuolo(slotRuolo);
  const esatto = g.ruoli.some((x) => x.ruolo.toUpperCase() === r);
  const macroOk = esatto || g.ruoli.some((x) => macroRuolo(x.ruolo) === macro);
  // Compatibile col ruolo richiesto → mostrato/assegnato in quel ruolo
  // (con l'overall "convertito" per lo slot). Non compatibile (giocatore di
  // riempimento da una rosa troppo corta per quel ruolo) → mostrato col suo
  // ruolo vero, non con quello dello slot: un centrocampista resta
  // centrocampista anche se proposto durante il giro del portiere.
  const ruolo = macroOk ? slotRuolo : ruoloReale(g);
  const overall = macroOk ? overallPerSlot(g, slotRuolo) : overallPerSlot(g, ruolo);
  return {
    nome: g.nome, cognome: g.cognome, ruolo,
    overall, _id: idGiocatore(squadra, g), esatto, macroOk,
    provenienza: { squadra: squadra.squadra, anno: squadra.anno, colore: squadra.colore },
  };
}

function giocatoriDisponibili(squadra, idsUsati, personeUsate) {
  return squadra.giocatori.filter(
    (g) => !idsUsati.has(idGiocatore(squadra, g)) && !personeUsate.has(chiavePersona(g))
  );
}

// Pool di tutti i candidati per un ruolo, mescolando tutte le squadre (usato
// per lo skip "tutto" e come rete di sicurezza se nessuna squadra singola
// basta).
function poolPerRuolo(slotRuolo, idsUsati, personeUsate, squadre) {
  const pool = [];
  for (const s of squadre) {
    for (const g of giocatoriDisponibili(s, idsUsati, personeUsate)) {
      const c = candidatoDa(s, g, slotRuolo);
      if (c.macroOk) pool.push(c);
    }
  }
  // se ci sono abbastanza giocatori col ruolo ESATTO, usa solo quelli
  const esatti = pool.filter((p) => p.esatto);
  return esatti.length >= 10 ? esatti : pool;
}

// Pool con TUTTI i giocatori disponibili di UNA squadra, per ruolo di
// compatibilità (compatibili col ruolo prima, il resto della rosa dopo, per
// completare a 10 se la squadra non ne ha abbastanza per quel ruolo).
function poolSquadraSingola(squadra, slotRuolo, idsUsati, personeUsate) {
  const compatibili = [];
  const altri = [];
  for (const g of giocatoriDisponibili(squadra, idsUsati, personeUsate)) {
    const c = candidatoDa(squadra, g, slotRuolo);
    (c.macroOk ? compatibili : altri).push(c);
  }
  return { compatibili, altri, totale: compatibili.length + altri.length };
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

// Prova squadre a caso finché non ne trova una con abbastanza giocatori
// disponibili (priorità a quelle con più compatibili col ruolo).
function estraiDaSquadraCasuale(slotRuolo, idsUsati, personeUsate, squadre) {
  const provate = new Set();
  let migliore = null;
  for (let i = 0; i < TENTATIVI_SQUADRA && provate.size < squadre.length; i++) {
    const restanti = squadre.filter((s) => !provate.has(s.id));
    if (!restanti.length) break;
    const squadra = casuale(restanti);
    provate.add(squadra.id);
    const { compatibili, altri, totale } = poolSquadraSingola(squadra, slotRuolo, idsUsati, personeUsate);
    if (totale < MINIMO_CANDIDATI_SQUADRA) continue;
    if (!migliore || compatibili.length > migliore.compatibili.length) {
      migliore = { squadra, compatibili, altri, totale };
    }
    if (compatibili.length >= 10 || totale >= 10) break; // abbastanza, fermati qui
  }
  return migliore;
}

// Estrae i candidati per lo slot. scope: {tipo: "squadra"|"tutto"|"stagione"|"club"}.
export function estraiCandidati(slotRuolo, idsUsati, personeUsate = new Set(), squadre = SQUADRE, scope = { tipo: "squadra" }) {
  if (scope?.tipo === "tutto") {
    return { candidati: selezionaBande(poolPerRuolo(slotRuolo, idsUsati, personeUsate, squadre)) };
  }
  if (scope?.tipo === "stagione") {
    const pool = applicaScope(poolPerRuolo(slotRuolo, idsUsati, personeUsate, squadre), scope);
    return { candidati: selezionaBande(pool) };
  }

  // default ("squadra") e skip "club": una squadra sola, priorità ai
  // compatibili col ruolo, completata con altri suoi giocatori se serve.
  const trovata = estraiDaSquadraCasuale(slotRuolo, idsUsati, personeUsate, squadre);
  if (!trovata) {
    // rete di sicurezza: nessuna squadra ha abbastanza giocatori rimasti
    return { candidati: selezionaBande(poolPerRuolo(slotRuolo, idsUsati, personeUsate, squadre)) };
  }
  const base = trovata.compatibili.length >= 10 ? trovata.compatibili : [...trovata.compatibili, ...trovata.altri];
  return { candidati: selezionaBande(base), squadra: trovata.squadra };
}

export function estraiAllenatori(n = 4, allenatori = ALLENATORI) {
  return [...allenatori]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((a) => ({ ...a, _id: `all-${a.nome}-${a.cognome}` }))
    .sort(ordinaAlfabetico);
}
