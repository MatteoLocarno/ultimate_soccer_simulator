// ============================================================================
//  LOGICA DEL DRAFT
// ----------------------------------------------------------------------------
//  Meccanica: per ogni slot viene ESTRATTA una squadra storica a caso e
//  l'utente sceglie un giocatore (del ruolo richiesto) di quella squadra,
//  SENZA vedere l'overall. Conta la conoscenza calcistica.
// ============================================================================

import { SQUADRE } from "@/dati/squadre";

// Restituisce un elemento casuale di un array.
function casuale(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Identificativo univoco di un giocatore all'interno del database
// (serve per non riproporre due volte lo stesso giocatore già scelto).
export function idGiocatore(squadra, giocatore) {
  return `${squadra.id}__${giocatore.nome}_${giocatore.cognome}_${giocatore.ruolo}`;
}

// Estrae una squadra che abbia almeno un giocatore del ruolo richiesto e
// non ancora scelto. Ritorna { squadra, candidati } oppure null se nulla è
// disponibile (caso limite, praticamente impossibile col database attuale).
export function estraiPerRuolo(ruolo, idsUsati) {
  // Squadre che hanno almeno un giocatore valido di quel ruolo.
  const disponibili = SQUADRE.filter((squadra) =>
    squadra.giocatori.some(
      (g) => g.ruolo === ruolo && !idsUsati.has(idGiocatore(squadra, g))
    )
  );

  if (disponibili.length === 0) return null;

  const squadra = casuale(disponibili);
  const candidati = squadra.giocatori
    .filter((g) => g.ruolo === ruolo && !idsUsati.has(idGiocatore(squadra, g)))
    .map((g) => ({ ...g, _id: idGiocatore(squadra, g) }));

  return { squadra, candidati };
}
