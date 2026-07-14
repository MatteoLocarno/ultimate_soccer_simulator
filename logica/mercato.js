// ============================================================================
//  MERCATO DI FINE STAGIONE
// ----------------------------------------------------------------------------
//  A fine stagione il giocatore può fare alcuni cambi "a sorte": sceglie chi
//  cambiare, tira il dado e vengono pescati 10 giocatori casuali dello STESSO
//  RUOLO (es. un terzino destro, non "un difensore qualsiasi") dal database
//  (le squadre già caricate), con la GARANZIA che almeno uno sia nell'intorno
//  (±1 overall) di chi si sta sostituendo. Stessa cosa per l'allenatore.
//
//  I candidati sono UNICI per persona: la stessa persona compare in più
//  squadre-stagione (es. Bakayoko all'Inter e al Milan), ma nel dado deve
//  uscire una sola volta (niente doppioni). Si dedup per nome+cognome tenendo
//  la variante col miglior overall in quel ruolo.
// ============================================================================

import { macroRuolo } from "@/logica/formazione";

function mescola(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

const idGiocatore = (squadra, g) => `${squadra.id}__${g.nome}_${g.cognome}`;
// Identità "persona" (indipendente dalla squadra-stagione): serve per non far
// uscire due volte lo stesso giocatore e per escludere chi è già in rosa.
export const chiavePersona = (g) => `${(g.nome || "").toLowerCase()}|${(g.cognome || "").toLowerCase()}`;

// Candidati del database i cui ruoli soddisfano `filtroRuolo`, UNICI per
// persona (miglior overall tra le sue varianti valide) ed escludendo le
// persone già in rosa. Overall/ruolo = il miglior ruolo che passa il filtro.
function raccogliCandidati(squadre, filtroRuolo, escludiPersone) {
  const perPersona = new Map();
  for (const s of squadre) {
    for (const g of s.giocatori || []) {
      const ruoliOk = (g.ruoli || []).filter(
        (r) => filtroRuolo(r.ruolo) && Number.isFinite(Number(r.overall))
      );
      if (!ruoliOk.length) continue;
      const k = chiavePersona(g);
      if (escludiPersone.has(k)) continue;
      const migliore = ruoliOk.reduce((a, b) => (b.overall > a.overall ? b : a));
      const cand = {
        nome: g.nome,
        cognome: g.cognome,
        ruolo: migliore.ruolo,
        overall: Math.round(Number(migliore.overall)),
        _id: idGiocatore(s, g),
        provenienza: { squadra: s.squadra, anno: s.anno, colore: s.colore },
      };
      const esistente = perPersona.get(k);
      // Tiene la variante col miglior overall (il giocatore al suo picco).
      if (!esistente || cand.overall > esistente.overall) perPersona.set(k, cand);
    }
  }
  return [...perPersona.values()];
}

// Garantisce che nell'elenco ci sia almeno un elemento nell'intorno ±1 di
// `overallRif`; se non c'è, ne inserisce uno pescandolo dal resto della pool
// (allargando la tolleranza solo se necessario).
function garantisciVicino(scelti, pool, overallRif) {
  const rif = Math.round(Number(overallRif));
  if (!Number.isFinite(rif)) return scelti;
  if (scelti.some((c) => Math.abs(c.overall - rif) <= 1)) return scelti;
  const inScelti = new Set(scelti.map((c) => c._id));
  for (const delta of [1, 2, 3, 4, 5, 6]) {
    const vicino = pool.find((c) => Math.abs(c.overall - rif) <= delta && !inScelti.has(c._id));
    if (vicino) {
      const copia = [...scelti];
      copia[copia.length - 1] = vicino;
      return copia;
    }
  }
  return scelti;
}

// 10 giocatori casuali dello STESSO RUOLO dello slot (es. terzino destro), con
// almeno uno vicino (±1) a `giocatoreAttuale`. escludiPersone: chiavi persona
// (nome|cognome) già in rosa, per non ripescarle e non fare doppioni.
// Rete di sicurezza: se quel ruolo esatto non ha (abbastanza) candidati nel
// database, si allarga al reparto (macro-ruolo) — così il dado non resta mai
// vuoto per un ruolo raro.
export function pescaGiocatori(squadre, slot, giocatoreAttuale, n = 10, escludiPersone = new Set()) {
  const ruolo = String(slot?.ruolo || "").toUpperCase();
  const macro = macroRuolo(slot?.ruolo) || "C";

  let pool = ruolo
    ? raccogliCandidati(squadre, (r) => String(r).toUpperCase() === ruolo, escludiPersone)
    : [];
  // Rete di sicurezza: solo se NESSUN giocatore ha quel ruolo esatto (evenienza
  // rarissima) si ripiega sul reparto, così il dado non resta mai vuoto. Se
  // invece i candidati di ruolo ci sono ma sono pochi (es. 5 terzini destri),
  // si mostrano quelli — meglio pochi ma del ruolo giusto che tutto il reparto.
  if (pool.length === 0) {
    pool = raccogliCandidati(squadre, (r) => macroRuolo(r) === macro, escludiPersone);
  }

  if (pool.length <= n) return mescola(pool);
  const scelti = mescola(pool).slice(0, n);
  return mescola(garantisciVicino(scelti, pool, giocatoreAttuale?.overall));
}

// 10 allenatori casuali, con almeno uno vicino (±1) a quello attuale.
export function pescaAllenatori(allenatori, coachAttuale, n = 10, escludiIds = new Set()) {
  const pool = (allenatori || [])
    .filter((a) => Number.isFinite(Number(a.overall)))
    .map((a) => ({
      nome: a.nome,
      cognome: a.cognome,
      overall: Math.round(Number(a.overall)),
      _id: `all-${a.nome}-${a.cognome}`,
    }))
    .filter((a) => !escludiIds.has(a._id));
  if (pool.length <= n) return mescola(pool);
  const scelti = mescola(pool).slice(0, n);
  return mescola(garantisciVicino(scelti, pool, coachAttuale?.overall));
}
