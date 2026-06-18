// ============================================================================
//  LOGICA DEL DRAFT
// ----------------------------------------------------------------------------
//  Meccanica: per ogni slot viene ESTRATTA una squadra storica a caso e
//  l'utente sceglie un giocatore (del ruolo richiesto) di quella squadra,
//  SENZA vedere l'overall. Conta la conoscenza calcistica.
//
//  Regole:
//   - i candidati sono mostrati in ordine alfabetico (l'ordine non rivela la
//     forza);
//   - uno stesso calciatore non può essere riproposto, nemmeno se appartiene
//     a una squadra-stagione diversa (niente doppioni in rosa).
// ============================================================================

import { SQUADRE } from "@/dati/squadre";
import { ALLENATORI } from "@/dati/allenatori";

// Restituisce un elemento casuale di un array.
function casuale(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Chiave alfabetica per l'ordinamento (cognome, o nome se manca il cognome).
function chiave(g) {
  return (g.cognome || g.nome || "").toLowerCase();
}

function ordinaAlfabetico(a, b) {
  return chiave(a).localeCompare(chiave(b), "it");
}

// Identificativo univoco di un giocatore-squadra (gestisce le riserve).
export function idGiocatore(squadra, giocatore) {
  return `${squadra.id}__${giocatore.nome}_${giocatore.cognome}_${giocatore.ruolo}`;
}

// Identità della PERSONA (a prescindere dalla stagione): evita i doppioni.
export function chiavePersona(giocatore) {
  return `${giocatore.nome}|${giocatore.cognome}`;
}

// Estrae una squadra con almeno un giocatore del ruolo richiesto, non ancora
// scelto né come singola voce né come persona. Ritorna { squadra, candidati }
// con i candidati in ordine alfabetico, oppure null se nulla è disponibile.
export function estraiPerRuolo(ruolo, idsUsati, personeUsate = new Set()) {
  const valido = (squadra, g) =>
    g.ruolo === ruolo &&
    !idsUsati.has(idGiocatore(squadra, g)) &&
    !personeUsate.has(chiavePersona(g));

  const disponibili = SQUADRE.filter((squadra) =>
    squadra.giocatori.some((g) => valido(squadra, g))
  );

  if (disponibili.length === 0) return null;

  const squadra = casuale(disponibili);
  const candidati = squadra.giocatori
    .filter((g) => valido(squadra, g))
    .map((g) => ({ ...g, _id: idGiocatore(squadra, g) }))
    .sort(ordinaAlfabetico);

  return { squadra, candidati };
}

// Estrae n allenatori casuali (distinti), mostrati in ordine alfabetico.
export function estraiAllenatori(n = 4) {
  return [...ALLENATORI]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((a) => ({ ...a, _id: `all-${a.nome}-${a.cognome}` }))
    .sort(ordinaAlfabetico);
}
