"use client";

import { useEffect, useRef, useState } from "react";
import { NOMI_RUOLO, macroRuolo } from "@/logica/formazione";
import { estraiCandidati, estraiAllenatori, chiavePersona, squadraHaTop } from "@/logica/draft";
import { STEMMI } from "@/dati/stemmi";
import FormazioneDraft from "@/componenti/FormazioneDraft";
import PalloneStorico from "@/componenti/PalloneStorico";

// Durata della transizione "sto cercando la prossima squadra": rallentata
// apposta (il calcolo vero è istantaneo) per dare il tempo di percepire il
// passaggio a una nuova squadra invece di uno scatto secco.
const DURATA_TRANSIZIONE = 1300;

const SKIP = [
  { tipo: "tutto", etichetta: "Cambia tutto", icona: "🔄" },
  { tipo: "stagione", etichetta: "Stessa stagione", icona: "📅" },
  { tipo: "club", etichetta: "Stesso club", icona: "🛡️" },
];

// Ordine e nomi dei reparti per raggruppare la rosa completa (che può
// avere 30-45 giocatori: senza raggruppare sarebbe un muro illeggibile,
// specie su mobile).
const REPARTI = [
  { macro: "P", nome: "Portieri", icona: "🧤" },
  { macro: "D", nome: "Difensori", icona: "🛡️" },
  { macro: "C", nome: "Centrocampisti", icona: "⚙️" },
  { macro: "A", nome: "Attaccanti", icona: "⚡" },
];

function raggruppaPerReparto(candidati) {
  return REPARTI.map((r) => ({
    ...r,
    giocatori: candidati.filter((c) => macroRuolo(c.ruolo) === r.macro),
  })).filter((r) => r.giocatori.length > 0);
}

// Macro-ruoli (P/D/C/A) che non hanno più nessuno slot libero: non vanno
// più proposti tra i candidati (non ci sarebbe dove metterli).
function calcolaRuoliEsauriti(slot, assegnazioni) {
  const totali = {};
  const occupati = {};
  for (const s of slot) {
    const m = macroRuolo(s.ruolo) || "C";
    totali[m] = (totali[m] || 0) + 1;
    if (assegnazioni[s.indice]) occupati[m] = (occupati[m] || 0) + 1;
  }
  const esauriti = new Set();
  for (const m of Object.keys(totali)) {
    if ((occupati[m] || 0) >= totali[m]) esauriti.add(m);
  }
  return esauriti;
}

// Ruoli dettagliati (es. "ED", "CDC"...) con almeno uno slot ESATTO ancora
// libero in questa formazione: usato per proporre ogni giocatore nel suo
// ruolo vero solo se c'è ancora posto per quel ruolo esatto (altrimenti nel
// migliore dei suoi altri ruoli che ce l'ha — vedi ruoloReale in draft.js).
function calcolaRuoliDettagliatiAperti(slot, assegnazioni) {
  const aperti = new Set();
  for (const s of slot) {
    if (!assegnazioni[s.indice]) aperti.add(String(s.ruolo).toUpperCase());
  }
  return aperti;
}

// Primo slot libero per il ruolo del giocatore scelto. Priorità in ordine:
//  1. titolare con lo stesso ruolo ESATTO (un'ala sinistra nello slot AS,
//     non in un AD solo perché libero prima)
//  2. titolare dello stesso reparto (macro-ruolo) se non c'è un esatto
// Solo titolari per ora (panchina rimossa dal draft).
function trovaSlotLibero(slot, assegnazioni, ruolo) {
  const r = String(ruolo).toUpperCase();
  const macro = macroRuolo(ruolo);
  const aperti = slot.filter((s) => !assegnazioni[s.indice]);
  const esatto = aperti.find((s) => String(s.ruolo).toUpperCase() === r);
  if (esatto) return esatto;
  const compatibile = aperti.find((s) => macroRuolo(s.ruolo) === macro);
  if (compatibile) return compatibile;
  return null;
}

// TUTTI gli slot liberi dove il giocatore può andare, allo stesso livello di
// priorità di trovaSlotLibero: se ci sono slot col ruolo ESATTO libero si
// offrono quelli (es. i due DC), altrimenti tutti i compatibili per reparto.
// Serve per far scegliere all'utente DOVE schierarlo quando c'è più di
// un'opzione.
function slotLiberiCompatibili(slot, assegnazioni, ruolo) {
  const r = String(ruolo).toUpperCase();
  const macro = macroRuolo(ruolo);
  const aperti = slot.filter((s) => !assegnazioni[s.indice]);
  const esatti = aperti.filter((s) => String(s.ruolo).toUpperCase() === r);
  if (esatti.length) return esatti;
  return aperti.filter((s) => macroRuolo(s.ruolo) === macro);
}

// Lato del campo dedotto dalla coordinata x (0 = sinistra, 100 = destra),
// per etichettare le posizioni tra cui scegliere ("Difensore centrale · sx").
function latoSlot(x) {
  if (x < 42) return "sinistra";
  if (x > 58) return "destra";
  return "centrale";
}

export default function SchermataDraft({ slot, squadre, allenatori: listaAllenatori, onCompletato }) {
  const totaleSlot = slot.length;
  const totaleScelte = totaleSlot + 2; // + allenatore + capitano

  // Indicizzata per slot.indice (non per ordine di scelta): un giocatore
  // scelto può finire in un qualsiasi slot libero del suo ruolo, non
  // necessariamente nel prossimo in ordine.
  const [assegnazioni, setAssegnazioni] = useState(() => Array(totaleSlot).fill(null));
  const [candidati, setCandidati] = useState([]);
  const [squadraEstratta, setSquadraEstratta] = useState(null);
  const [allenatori, setAllenatori] = useState(null);
  const [allenatoreScelto, setAllenatoreScelto] = useState(null);
  // Giocatore selezionato ma non ancora piazzato: quando ci sono più slot
  // liberi per il suo ruolo, l'utente sceglie DOVE metterlo (es. i due DC).
  const [giocatoreDaPiazzare, setGiocatoreDaPiazzare] = useState(null);
  const [skipUsati, setSkipUsati] = useState([]); // tipi di skip già usati (tutto il draft)
  // Reparti chiusi "a ventaglio" nella lista candidati (per macro-ruolo):
  // di default tutti chiusi, si aprono/chiudono al tocco del titolo.
  const [repartiChiusi, setRepartiChiusi] = useState(() => new Set(REPARTI.map((r) => r.macro)));
  // Vera durante il breve passaggio tra una scelta e la prossima squadra
  // proposta: la lista candidati lascia il posto a un'animazione, invece di
  // cambiare di scatto.
  const [inTransizione, setInTransizione] = useState(false);
  const timeoutTransizione = useRef(null);
  useEffect(() => () => clearTimeout(timeoutTransizione.current), []);

  // Id delle squadre FORTI (con un top player > 85) già proposte nel draft:
  // serve a garantire che ne escano almeno 2 nel corso delle scelte.
  const squadreForti = useRef(new Set());
  const MIN_SQUADRE_FORTI = 2;
  function registraSquadra(squadra) {
    if (squadra && squadraHaTop(squadra, idsUsati(), personeUsate())) {
      squadreForti.current.add(squadra.id);
    }
  }

  function applicaConTransizione(nuoviCandidati, nuovaSquadra) {
    setInTransizione(true);
    clearTimeout(timeoutTransizione.current);
    timeoutTransizione.current = setTimeout(() => {
      setCandidati(nuoviCandidati);
      setSquadraEstratta(nuovaSquadra || null);
      setInTransizione(false);
    }, DURATA_TRANSIZIONE);
  }

  function toggleReparto(macro) {
    setRepartiChiusi((prev) => {
      const next = new Set(prev);
      if (next.has(macro)) next.delete(macro); else next.add(macro);
      return next;
    });
  }

  const numAssegnati = assegnazioni.filter(Boolean).length;
  const faseGiocatori = numAssegnati < totaleSlot;
  const faseAllenatore = !faseGiocatori && !allenatoreScelto;
  const faseCapitano = !faseGiocatori && !!allenatoreScelto;

  const idsUsati = () => new Set(assegnazioni.filter(Boolean).map((a) => a.giocatore._id));
  const personeUsate = () => new Set(assegnazioni.filter(Boolean).map((a) => chiavePersona(a.giocatore)));

  // Nuovi candidati ad ogni assegnazione: rosa completa (ruoli misti) della
  // stessa squadra storica (scope "squadra", default); allenatori in fase
  // coach.
  useEffect(() => {
    if (faseGiocatori) {
      const ruoliEsauriti = calcolaRuoliEsauriti(slot, assegnazioni);
      const ruoliDettagliatiAperti = calcolaRuoliDettagliatiAperti(slot, assegnazioni);
      // Garanzia "almeno 2 squadre forti": mancano ancora squadre forti da
      // mostrare? Le si preferisce con una certa probabilità e, quando le
      // scelte rimaste bastano appena a raggiungere la quota, le si forza.
      const restanti = totaleSlot - numAssegnati;
      const ancoraNecessarie = MIN_SQUADRE_FORTI - squadreForti.current.size;
      const preferisciForte =
        ancoraNecessarie > 0 && (restanti <= ancoraNecessarie + 1 || Math.random() < 0.5);
      const { candidati: nuovi, squadra } = estraiCandidati(idsUsati(), personeUsate(), squadre, { tipo: "squadra" }, ruoliEsauriti, ruoliDettagliatiAperti, preferisciForte);
      registraSquadra(squadra);
      applicaConTransizione(nuovi, squadra);
    } else if (faseAllenatore) {
      setAllenatori(estraiAllenatori(4, listaAllenatori));
    }
  }, [assegnazioni, allenatoreScelto]); // eslint-disable-line react-hooks/exhaustive-deps

  function usaSkip(tipo) {
    if (skipUsati.includes(tipo) || !faseGiocatori || inTransizione || giocatoreDaPiazzare) return;
    setSkipUsati((s) => [...s, tipo]);
    const ruoliEsauriti = calcolaRuoliEsauriti(slot, assegnazioni);
    const ruoliDettagliatiAperti = calcolaRuoliDettagliatiAperti(slot, assegnazioni);
    const { candidati: nuovi, squadra } = estraiCandidati(idsUsati(), personeUsate(), squadre, { tipo }, ruoliEsauriti, ruoliDettagliatiAperti);
    registraSquadra(squadra);
    applicaConTransizione(nuovi, squadra);
  }

  function piazzaGiocatore(c, indice) {
    setAssegnazioni((prev) => {
      const next = [...prev];
      next[indice] = {
        giocatore: { nome: c.nome, cognome: c.cognome, ruolo: c.ruolo, overall: c.overall, _id: c._id },
        provenienza: c.provenienza,
      };
      return next;
    });
    setGiocatoreDaPiazzare(null);
  }

  function scegliGiocatore(c) {
    if (inTransizione || giocatoreDaPiazzare) return;
    const compatibili = slotLiberiCompatibili(slot, assegnazioni, c.ruolo);
    if (compatibili.length === 0) return; // di sicurezza: non dovrebbe succedere
    // Una sola posizione possibile: si piazza subito (nessuna scelta da fare).
    if (compatibili.length === 1) { piazzaGiocatore(c, compatibili[0].indice); return; }
    // Più posizioni: l'utente sceglie dove schierarlo.
    setGiocatoreDaPiazzare(c);
  }
  function scegliAllenatore(a) { setAllenatoreScelto(a); }
  function scegliCapitano(p) {
    const rosa = assegnazioni.map((a, i) => ({ slot: slot[i], giocatore: a.giocatore, provenienza: a.provenienza }));
    onCompletato({ rosa, allenatore: allenatoreScelto, capitano: p.giocatore._id });
  }

  if (faseAllenatore && !allenatori) return null;

  const scelteFatte = numAssegnati + (allenatoreScelto ? 1 : 0);
  const percentuale = Math.round((scelteFatte / totaleScelte) * 100);
  const titolari = assegnazioni
    .map((a, i) => (a ? { slot: slot[i], giocatore: a.giocatore } : null))
    .filter((p) => p && p.slot.tipo === "titolare");

  // Slot ancora liberi il cui ruolo compare tra i candidati proposti ora:
  // indicano dove potrebbe atterrare la prossima scelta.
  const ruoliInGioco = new Set(candidati.map((c) => macroRuolo(c.ruolo)));
  const slotEvidenziati = new Set(
    slot.filter((s) => !assegnazioni[s.indice] && ruoliInGioco.has(macroRuolo(s.ruolo))).map((s) => s.indice)
  );

  // In fase di piazzamento: gli slot tra cui l'utente può scegliere dove
  // schierare il giocatore selezionato (diventano cliccabili sul campo).
  const opzioniPiazzamento = giocatoreDaPiazzare
    ? slotLiberiCompatibili(slot, assegnazioni, giocatoreDaPiazzare.ruolo)
    : [];
  const slotPiazzabili = new Set(opzioniPiazzamento.map((s) => s.indice));

  let titolo, etichetta;
  if (faseGiocatori) {
    titolo = "Scegli un giocatore";
    etichetta = `Scelta ${numAssegnati + 1} di ${totaleSlot}`;
  } else if (faseAllenatore) {
    titolo = "Scegli l'allenatore"; etichetta = "Allenatore";
  } else {
    titolo = "Scegli il capitano"; etichetta = "Capitano";
  }

  return (
    <div className="draft">
      <header className="intestazione">
        <div className="logo">Draft</div>
        <h1>{titolo}</h1>
      </header>

      <div className="draft-top">
        <div className="progresso"><div style={{ width: `${percentuale}%` }} /></div>
        <div className="draft-meta">
          <span>Scelta {scelteFatte + 1} di {totaleScelte}</span>
          <span className="badge-ruolo">{etichetta}</span>
        </div>
      </div>

      <div className="draft-spread">
        <div className="draft-scelta">
          {faseGiocatori && giocatoreDaPiazzare && (
            <div className="piazzamento">
              <div className="piazzamento-testo">
                Dove vuoi schierare{" "}
                <b>{giocatoreDaPiazzare.nome} {giocatoreDaPiazzare.cognome}</b>?
              </div>
              <div className="piazzamento-hint">Tocca una posizione, sul campo o qui sotto.</div>
              <div className="piazzamento-opzioni">
                {opzioniPiazzamento.map((s) => (
                  <button
                    key={s.indice}
                    className="piazzamento-opz"
                    onClick={() => piazzaGiocatore(giocatoreDaPiazzare, s.indice)}
                  >
                    <span className="piazzamento-opz-tag">{s.ruolo}</span>
                    <span className="piazzamento-opz-nome">
                      {NOMI_RUOLO[s.ruolo] || s.ruolo} · {latoSlot(s.x)}
                    </span>
                    <span className="freccia">＋</span>
                  </button>
                ))}
              </div>
              <button className="piazzamento-annulla" onClick={() => setGiocatoreDaPiazzare(null)}>
                Annulla
              </button>
            </div>
          )}

          {faseGiocatori && !giocatoreDaPiazzare && (
            <>
              {squadraEstratta ? (
                <div className="squadra-corrente" key={`${squadraEstratta.squadra}-${squadraEstratta.anno}`}>
                  <div className="squadra-corrente-stemma">
                    {STEMMI[squadraEstratta.squadra] ? (
                      <img
                        src={STEMMI[squadraEstratta.squadra]}
                        alt={squadraEstratta.squadra}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "block"; }}
                      />
                    ) : null}
                    <span
                      className="squadra-corrente-pallino"
                      style={{ background: squadraEstratta.colore, display: STEMMI[squadraEstratta.squadra] ? "none" : "block" }}
                    />
                  </div>
                  <div className="squadra-corrente-testo">
                    <div className="squadra-corrente-nome">{squadraEstratta.squadra}</div>
                    <div className="squadra-corrente-anno">{squadraEstratta.anno}</div>
                  </div>
                </div>
              ) : (
                <div className="squadra-corrente squadra-corrente-mix">
                  <div className="squadra-corrente-testo">
                    <div className="squadra-corrente-nome">Mix di giocatori</div>
                    <div className="squadra-corrente-anno">da tutto il database</div>
                  </div>
                </div>
              )}

              <div className="skip-bar">
                {SKIP.map((s) => (
                  <button
                    key={s.tipo}
                    className="skip-btn"
                    disabled={skipUsati.includes(s.tipo) || inTransizione}
                    onClick={() => usaSkip(s.tipo)}
                    title={`Ripesca i candidati: ${s.etichetta}`}
                  >
                    <span className="skip-ic">{s.icona}</span> {s.etichetta}
                  </button>
                ))}
              </div>

              {inTransizione ? (
                <div className="draft-transizione">
                  <div className="draft-transizione-pista">
                    <div className="draft-transizione-salto">
                      <PalloneStorico size={40} className="draft-transizione-giro" />
                    </div>
                    <div className="draft-transizione-ombra" />
                  </div>
                  <span className="draft-transizione-testo">Sto cercando la prossima squadra…</span>
                </div>
              ) : (
                <div className="lista-candidati lista-candidati-raggruppata">
                  {raggruppaPerReparto(candidati).map((r) => {
                    const aperto = !repartiChiusi.has(r.macro);
                    return (
                      <div className={`reparto-candidati ${aperto ? "aperto" : "chiuso"}`} key={r.macro}>
                        <button
                          type="button"
                          className="reparto-candidati-tit"
                          onClick={() => toggleReparto(r.macro)}
                          aria-expanded={aperto}
                        >
                          <span className="reparto-tit-icona">{r.icona}</span>
                          <span className="reparto-tit-nome">{r.nome}</span>
                          <span className="reparto-tit-conta">{r.giocatori.length}</span>
                          <span className={`reparto-freccia ${aperto ? "aperto" : ""}`}>›</span>
                        </button>
                        {aperto && (
                          <div className="reparto-candidati-corpo">
                            {r.giocatori.map((c) => (
                              <button key={c._id} className="candidato candidato-compatto" onClick={() => scegliGiocatore(c)}>
                                <span className="cand-ruolo-tag">{c.ruolo}</span>
                                <span className="cand-info">
                                  <span className="nome-g">{c.nome} {c.cognome}</span>
                                  <span className="ruolo-g">
                                    {c.provenienza.squadra} {c.provenienza.anno}
                                  </span>
                                </span>
                                <span className="freccia">＋</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {faseAllenatore && (
            <>
              <div className="squadra-estratta">
                <div className="occhiello">In panchina</div>
                <div className="nome">L&apos;allenatore</div>
                <div className="anno">Chi guiderà la dinastia?</div>
              </div>
              <p className="istruzione">Scegli <b>un allenatore</b>. L&apos;overall resta nascosto.</p>
              <div className="lista-candidati">
                {allenatori.map((a) => (
                  <button key={a._id} className="candidato" onClick={() => scegliAllenatore(a)}>
                    <span className="cand-info">
                      <span className="nome-g">{a.nome} {a.cognome}</span>
                      <span className="ruolo-g">Allenatore</span>
                    </span>
                    <span className="freccia">＋</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {faseCapitano && (
            <>
              <div className="squadra-estratta">
                <div className="occhiello">Ultimo atto</div>
                <div className="nome">La fascia</div>
                <div className="anno">Chi è il leader della squadra?</div>
              </div>
              <p className="istruzione">Scegli <b>il capitano</b> tra i tuoi titolari.</p>
              <div className="lista-candidati">
                {titolari.map((pick) => (
                  <button key={pick.giocatore._id} className="candidato" onClick={() => scegliCapitano(pick)}>
                    <span className="cand-info">
                      <span className="nome-g">{pick.giocatore.nome} {pick.giocatore.cognome}</span>
                      <span className="ruolo-g">{NOMI_RUOLO[pick.giocatore.ruolo] || pick.giocatore.ruolo}</span>
                    </span>
                    <span className="freccia">Ⓒ</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="draft-formazione">
          <h3 className="sezione-titolo">La tua squadra</h3>
          <FormazioneDraft
            slot={slot}
            picks={assegnazioni}
            slotEvidenziati={faseGiocatori && !giocatoreDaPiazzare ? slotEvidenziati : null}
            slotPiazzabili={giocatoreDaPiazzare ? slotPiazzabili : null}
            onPiazza={(indice) => piazzaGiocatore(giocatoreDaPiazzare, indice)}
            allenatore={allenatoreScelto}
            faseAllenatore={faseAllenatore}
          />
        </aside>
      </div>
    </div>
  );
}
