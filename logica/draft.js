// ============================================================================
//  LOGICA DEL DRAFT
// ----------------------------------------------------------------------------
//  Ad ogni giro viene estratta una squadra storica a caso e si mostra TUTTA
//  la sua rosa DISPONIBILE con overall >= 70 (ruoli misti, ognuno col proprio
//  ruolo vero) a OVERALL NASCOSTO. Si sceglie liberamente chi si vuole: va ad
//  occupare automaticamente il primo slot libero del suo ruolo (solo
//  titolari, per ora: panchina rimossa). Quando gli slot di un ruolo sono
//  tutti pieni, quel ruolo non viene più proposto tra i candidati (si apre
//  il reparto successivo). "Ruolo vero" non è sempre il migliore in
//  assoluto: se quel ruolo esatto non ha più slot ma il giocatore ha anche
//  un altro ruolo buono con posto libero, si propone in quello — mai un
//  ruolo ormai esaurito. Mostrati in ordine alfabetico (l'ordine non rivela
//  la forza). Niente doppioni, nemmeno tra stagioni diverse.
//
//  3 SKIP (uno a testa, per tutto il draft) ripescano con scope diverso:
//    - "tutto"    : mix di giocatori dall'intero database (10 candidati a
//                   bande percentili, il pool è troppo grande per mostrarlo
//                   tutto)
//    - "stagione" : solo da una stagione, più club (idem, 10 a bande)
//    - "club"     : un'altra squadra a caso, rosa completa come il default
// ============================================================================

import { SQUADRE } from "@/dati/squadre";
import { ALLENATORI } from "@/dati/allenatori";
import { macroRuolo } from "@/logica/formazione";

const MINIMO_CANDIDATI_SQUADRA = 4; // sotto questa soglia si scarta la squadra
const TENTATIVI_SQUADRA = 25;
const OVERALL_MINIMO = 70; // sotto questa soglia il giocatore non viene proposto

function casuale(a) { return a[Math.floor(Math.random() * a.length)]; }
function chiave(g) { return (g.cognome || g.nome || "").toLowerCase(); }
function ordinaAlfabetico(a, b) { return chiave(a).localeCompare(chiave(b), "it"); }

export function idGiocatore(squadra, g) { return `${squadra.id}__${g.nome}_${g.cognome}`; }
export function chiavePersona(g) { return `${g.nome}|${g.cognome}`; }

// Ruolo "vero" del giocatore: il migliore per overall tra i suoi ruoli reali
// PER CUI C'È ANCORA UNO SLOT ESATTO LIBERO in questa formazione (es. se
// l'ED è già esaurito ma il giocatore ha anche un buon CC, si propone come
// CC, non come ED — mai un ruolo che non ha più posto). Se nessuno dei suoi
// ruoli ha più uno slot esatto, si ripiega sul migliore in assoluto: verrà
// comunque proposto solo se il suo reparto (macro-ruolo) ha ancora posto, e
// finirà in uno slot compatibile ma non identico.
function ruoloReale(g, ruoliDettagliatiAperti) {
  const ordinati = [...g.ruoli].sort((a, b) => b.overall - a.overall);
  if (ruoliDettagliatiAperti) {
    const conSlotEsatto = ordinati.find((r) => ruoliDettagliatiAperti.has(String(r.ruolo).toUpperCase()));
    if (conSlotEsatto) return conSlotEsatto;
  }
  return ordinati[0];
}

function candidatoDa(squadra, g, ruoliDettagliatiAperti) {
  const migliore = ruoloReale(g, ruoliDettagliatiAperti);
  return {
    nome: g.nome, cognome: g.cognome, ruolo: migliore.ruolo,
    overall: Math.round(migliore.overall), _id: idGiocatore(squadra, g),
    provenienza: { squadra: squadra.squadra, anno: squadra.anno, colore: squadra.colore },
  };
}

function giocatoriDisponibili(squadra, idsUsati, personeUsate) {
  return squadra.giocatori.filter(
    (g) => !idsUsati.has(idGiocatore(squadra, g)) && !personeUsate.has(chiavePersona(g))
  );
}

// Un candidato è proponibile solo se il suo ruolo macro ha ancora slot
// liberi (altrimenti non ci sarebbe dove metterlo).
function ruoloProponibile(ruolo, ruoliEsauriti) {
  return !ruoliEsauriti || !ruoliEsauriti.has(macroRuolo(ruolo));
}

// Pool di tutti i candidati disponibili (ruoli misti) mescolando tutte le
// squadre — usato per lo skip "tutto" e come rete di sicurezza.
function poolLibero(idsUsati, personeUsate, squadre, ruoliEsauriti, ruoliDettagliatiAperti) {
  const pool = [];
  for (const s of squadre) {
    for (const g of giocatoriDisponibili(s, idsUsati, personeUsate)) {
      const c = candidatoDa(s, g, ruoliDettagliatiAperti);
      if (c.overall >= OVERALL_MINIMO && ruoloProponibile(c.ruolo, ruoliEsauriti)) pool.push(c);
    }
  }
  return pool;
}

// Pool di UNA squadra, ruoli misti, filtrato sui ruoli ancora disponibili.
function poolSquadraSingola(squadra, idsUsati, personeUsate, ruoliEsauriti, ruoliDettagliatiAperti) {
  const pool = [];
  for (const g of giocatoriDisponibili(squadra, idsUsati, personeUsate)) {
    const c = candidatoDa(squadra, g, ruoliDettagliatiAperti);
    if (c.overall >= OVERALL_MINIMO && ruoloProponibile(c.ruolo, ruoliEsauriti)) pool.push(c);
  }
  return pool;
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

// Seleziona fino a 10 candidati con bande percentili (3 bassi / 5 medi / 2
// top) quando il pool è più grande; altrimenti li mostra tutti.
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
// disponibili (nei ruoli ancora aperti).
function estraiDaSquadraCasuale(idsUsati, personeUsate, squadre, ruoliEsauriti, ruoliDettagliatiAperti) {
  const provate = new Set();
  for (let i = 0; i < TENTATIVI_SQUADRA && provate.size < squadre.length; i++) {
    const restanti = squadre.filter((s) => !provate.has(s.id));
    if (!restanti.length) break;
    const squadra = casuale(restanti);
    provate.add(squadra.id);
    const pool = poolSquadraSingola(squadra, idsUsati, personeUsate, ruoliEsauriti, ruoliDettagliatiAperti);
    if (pool.length >= MINIMO_CANDIDATI_SQUADRA) return { squadra, pool };
  }
  return null;
}

// Estrae i candidati. scope: {tipo: "squadra"|"tutto"|"stagione"|"club"}.
// ruoliEsauriti: Set di macro-ruoli (P/D/C/A) senza più slot liberi.
// ruoliDettagliatiAperti: Set di ruoli dettagliati (es. "ED", "CDC"...) con
// almeno uno slot esatto ancora libero in questa formazione — usato per
// proporre ogni giocatore nel suo ruolo vero SOLO se c'è ancora posto per
// quel ruolo esatto, altrimenti nel migliore dei suoi ruoli che ce l'ha.
// Per "squadra"/"club" torna la rosa COMPLETA disponibile di una squadra
// (ruoli misti, ordine alfabetico); per "tutto"/"stagione" un pool troppo
// grande da mostrare intero, quindi 10 candidati a bande percentili.
export function estraiCandidati(idsUsati, personeUsate = new Set(), squadre = SQUADRE, scope = { tipo: "squadra" }, ruoliEsauriti = null, ruoliDettagliatiAperti = null) {
  if (scope?.tipo === "tutto") {
    return { candidati: selezionaBande(poolLibero(idsUsati, personeUsate, squadre, ruoliEsauriti, ruoliDettagliatiAperti)) };
  }
  if (scope?.tipo === "stagione") {
    const pool = applicaScope(poolLibero(idsUsati, personeUsate, squadre, ruoliEsauriti, ruoliDettagliatiAperti), scope);
    return { candidati: selezionaBande(pool) };
  }

  // default ("squadra") e skip "club": rosa completa di una squadra sola.
  const trovata = estraiDaSquadraCasuale(idsUsati, personeUsate, squadre, ruoliEsauriti, ruoliDettagliatiAperti);
  if (!trovata) {
    // rete di sicurezza: nessuna squadra ha abbastanza giocatori disponibili
    return { candidati: selezionaBande(poolLibero(idsUsati, personeUsate, squadre, ruoliEsauriti, ruoliDettagliatiAperti)) };
  }
  return { candidati: [...trovata.pool].sort(ordinaAlfabetico), squadra: trovata.squadra };
}

export function estraiAllenatori(n = 4, allenatori = ALLENATORI) {
  return [...allenatori]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((a) => ({ ...a, _id: `all-${a.nome}-${a.cognome}` }))
    .sort(ordinaAlfabetico);
}
