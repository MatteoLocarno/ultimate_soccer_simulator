// ============================================================================
//  MERCATO DI FINE STAGIONE
// ----------------------------------------------------------------------------
//  A fine stagione il giocatore può fare alcuni cambi "a sorte": sceglie chi
//  cambiare, tira il dado e vengono pescati 10 giocatori casuali di quel
//  ruolo dal database (le squadre già caricate), con la GARANZIA che almeno
//  uno sia nell'intorno (±1 overall) di chi si sta sostituendo. Stessa cosa
//  per l'allenatore.
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

// Tutti i candidati del database per un macro-ruolo (P/D/C/A), escludendo gli
// id già in rosa. Overall = miglior ruolo del giocatore in quel reparto.
function candidatiPerMacro(squadre, macro, escludiIds) {
  const out = [];
  for (const s of squadre) {
    for (const g of s.giocatori || []) {
      const ruoliMacro = (g.ruoli || []).filter(
        (r) => macroRuolo(r.ruolo) === macro && Number.isFinite(Number(r.overall))
      );
      if (!ruoliMacro.length) continue;
      const migliore = ruoliMacro.reduce((a, b) => (b.overall > a.overall ? b : a));
      const _id = idGiocatore(s, g);
      if (escludiIds.has(_id)) continue;
      out.push({
        nome: g.nome,
        cognome: g.cognome,
        ruolo: migliore.ruolo,
        overall: Math.round(Number(migliore.overall)),
        _id,
        provenienza: { squadra: s.squadra, anno: s.anno, colore: s.colore },
      });
    }
  }
  return out;
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

// 10 giocatori casuali per lo slot indicato, con almeno uno vicino (±1) a
// `giocatoreAttuale`. escludiIds: id già presenti in rosa (per non ripescarli).
export function pescaGiocatori(squadre, slot, giocatoreAttuale, n = 10, escludiIds = new Set()) {
  const macro = macroRuolo(slot?.ruolo) || "C";
  const pool = candidatiPerMacro(squadre, macro, escludiIds);
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
