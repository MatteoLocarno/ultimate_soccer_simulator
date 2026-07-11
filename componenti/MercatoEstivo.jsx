"use client";

import { useEffect, useRef, useState } from "react";
import { NOMI_RUOLO } from "@/logica/formazione";
import { pescaGiocatori, pescaAllenatori } from "@/logica/mercato";
import Dado from "@/componenti/Dado";

const CAMBI_GIOCATORI = 3; // cambi giocatore disponibili ogni estate
const DURATA_ROLL = 950; // ms di lancio del dado prima di svelare i pescati

// Mercato estivo tra una stagione e l'altra. Passi:
//  1) "Vuoi fare mercato?" → sì/no
//  2) mercato: per ogni cambio si tira il DADO (click su ROLLA); escono
//     giocatori a OVERALL NASCOSTO; scegliendone uno lo si inserisce in
//     squadra e il suo overall viene rivelato. Fino a 3 giocatori + 1 coach.
//  3) "Vuoi cambiare capitano?"
//  4) Inizia la stagione successiva con la rosa aggiornata.
export default function MercatoEstivo({ rosa, allenatore, capitano, squadre, allenatori, stagione, onInizia }) {
  const [passo, setPasso] = useState("gate"); // gate | mercato | capitano
  const [rosaLavoro, setRosaLavoro] = useState(rosa);
  const [allLavoro, setAllLavoro] = useState(allenatore);
  const [capitanoLavoro, setCapitanoLavoro] = useState(capitano);
  const [cambiRimasti, setCambiRimasti] = useState(CAMBI_GIOCATORI);
  const [coachCambiato, setCoachCambiato] = useState(false);

  // Picker del dado: { tipo:"giocatore", indice } | { tipo:"coach" } | null.
  const [selezione, setSelezione] = useState(null);
  const [faseDado, setFaseDado] = useState("pronto"); // pronto | rolling | scelta
  const [candidati, setCandidati] = useState([]);
  const [dadoVal, setDadoVal] = useState(6);
  // Slot appena rinforzato (per l'animazione di "reveal" dell'overall).
  const [rivelato, setRivelato] = useState(null);
  const timerRoll = useRef(null);
  const intervalloDado = useRef(null);
  const timerRivela = useRef(null);
  useEffect(() => () => {
    clearTimeout(timerRoll.current);
    clearInterval(intervalloDado.current);
    clearTimeout(timerRivela.current);
  }, []);

  const titolari = rosaLavoro.filter((p) => p.slot.tipo === "titolare");
  const idsInRosa = () => new Set(rosaLavoro.filter(Boolean).map((p) => p.giocatore._id));

  function apriPicker(sel) {
    setSelezione(sel);
    setFaseDado("pronto");
    setCandidati([]);
    setDadoVal(6);
  }
  function chiudiPicker() {
    clearTimeout(timerRoll.current);
    clearInterval(intervalloDado.current);
    setSelezione(null);
    setFaseDado("pronto");
    setCandidati([]);
  }

  function rolla() {
    if (faseDado !== "pronto" || !selezione) return;
    setFaseDado("rolling");
    intervalloDado.current = setInterval(() => setDadoVal(1 + Math.floor(Math.random() * 6)), 85);
    timerRoll.current = setTimeout(() => {
      clearInterval(intervalloDado.current);
      setDadoVal(1 + Math.floor(Math.random() * 6));
      let pescati;
      if (selezione.tipo === "giocatore") {
        const pick = rosaLavoro[selezione.indice];
        pescati = pescaGiocatori(squadre, pick.slot, pick.giocatore, 10, idsInRosa());
      } else {
        const escl = new Set(allLavoro ? [`all-${allLavoro.nome}-${allLavoro.cognome}`] : []);
        pescati = pescaAllenatori(allenatori, allLavoro, 10, escl);
      }
      setCandidati(pescati);
      setFaseDado("scelta");
    }, DURATA_ROLL);
  }

  function flashRivela(chiave) {
    setRivelato(chiave);
    clearTimeout(timerRivela.current);
    timerRivela.current = setTimeout(() => setRivelato(null), 1400);
  }

  function scegli(c) {
    if (selezione?.tipo === "giocatore") {
      const { indice } = selezione;
      setRosaLavoro((prev) => {
        const next = [...prev];
        next[indice] = {
          ...next[indice],
          giocatore: { nome: c.nome, cognome: c.cognome, ruolo: c.ruolo, overall: c.overall, _id: c._id },
          provenienza: c.provenienza,
        };
        return next;
      });
      setCambiRimasti((n) => n - 1);
      flashRivela("g" + indice);
    } else if (selezione?.tipo === "coach") {
      setAllLavoro({ nome: c.nome, cognome: c.cognome, overall: c.overall });
      setCoachCambiato(true);
      flashRivela("coach");
    }
    chiudiPicker();
  }

  // ── Passo 1: gate ─────────────────────────────────────────────────────────
  if (passo === "gate") {
    return (
      <div className="mercato-estivo">
        <Intestazione stagione={stagione} />
        <section className="card gate">
          <div className="gate-emoji">☀️🔄</div>
          <h2>Mercato estivo</h2>
          <p>
            Prima di iniziare la Stagione {stagione} puoi rinforzare la rosa
            con qualche colpo a sorte. Vuoi fare mercato?
          </p>
          <div className="gate-azioni">
            <button className="btn" onClick={() => setPasso("mercato")}>Sì, tira il dado</button>
            <button className="btn secondario" onClick={() => setPasso("capitano")}>No, salta</button>
          </div>
        </section>
      </div>
    );
  }

  // ── Passo 3: capitano ─────────────────────────────────────────────────────
  if (passo === "capitano") {
    return (
      <div className="mercato-estivo">
        <Intestazione stagione={stagione} />
        <section className="card">
          <h2 className="sezione-titolo">Vuoi cambiare capitano?</h2>
          <p className="mercato-info">Tocca un giocatore per dargli la fascia, oppure conferma quello attuale.</p>
          <div className="cap-lista">
            {titolari.map((p) => {
              const attivo = p.giocatore._id === capitanoLavoro;
              return (
                <button
                  key={p.slot.indice}
                  className={`cap-riga ${attivo ? "attivo" : ""}`}
                  onClick={() => setCapitanoLavoro(p.giocatore._id)}
                >
                  <span className="mr-ruolo">{p.giocatore.ruolo}</span>
                  <span className="mr-nome">{p.giocatore.nome} {p.giocatore.cognome}</span>
                  <span className="mr-ovr">{p.giocatore.overall}</span>
                  <span className="cap-fascia">{attivo ? "Ⓒ" : ""}</span>
                </button>
              );
            })}
          </div>
          <button
            className="btn btn-prossima"
            onClick={() => onInizia({ rosa: rosaLavoro, allenatore: allLavoro, capitano: capitanoLavoro })}
          >
            Inizia la Stagione {stagione} →
          </button>
        </section>
      </div>
    );
  }

  // ── Passo 2: mercato ──────────────────────────────────────────────────────
  const attuale =
    selezione?.tipo === "giocatore"
      ? rosaLavoro[selezione.indice]?.giocatore
      : selezione?.tipo === "coach"
      ? allLavoro
      : null;

  return (
    <div className="mercato-estivo">
      <Intestazione stagione={stagione} />
      <section className="card mercato">
        <div className="mercato-testa">
          <h2 className="sezione-titolo">Colpi di mercato</h2>
          <div className="mercato-crediti">
            <span className="mc-chip">{cambiRimasti} giocatori</span>
            <span className={`mc-chip ${coachCambiato ? "usato" : ""}`}>{coachCambiato ? "coach ✓" : "1 coach"}</span>
          </div>
        </div>
        <p className="mercato-info">
          Tocca <b>Cambia</b>, tira il dado e scegli tra i profili estratti (a
          overall nascosto): l&apos;overall si svela una volta inserito.
        </p>

        <div className="mercato-lista">
          {titolari.map((p) => {
            const indice = rosaLavoro.indexOf(p);
            return (
              <div className={`mercato-riga ${rivelato === "g" + indice ? "rivela" : ""}`} key={p.slot.indice}>
                <span className="mr-ruolo">{p.giocatore.ruolo}</span>
                <span className="mr-nome">{p.giocatore.nome} {p.giocatore.cognome}</span>
                <span className="mr-ovr">{p.giocatore.overall}</span>
                <button
                  className="mr-cambia"
                  onClick={() => apriPicker({ tipo: "giocatore", indice })}
                  disabled={cambiRimasti <= 0 || !!selezione}
                >
                  Cambia
                </button>
              </div>
            );
          })}

          {allLavoro && (
            <div className={`mercato-riga coach ${rivelato === "coach" ? "rivela" : ""}`}>
              <span className="mr-ruolo">ALL</span>
              <span className="mr-nome">{allLavoro.nome} {allLavoro.cognome}</span>
              <span className="mr-ovr">{allLavoro.overall}</span>
              <button
                className="mr-cambia"
                onClick={() => apriPicker({ tipo: "coach" })}
                disabled={coachCambiato || !!selezione}
              >
                Cambia
              </button>
            </div>
          )}
        </div>

        <button className="btn btn-prossima" onClick={() => setPasso("capitano")}>
          Prosegui →
        </button>
      </section>

      {selezione && (
        <div className="dado-overlay" role="dialog" aria-modal="true">
          <div className="dado-pannello">
            <button className="dado-chiudi" onClick={chiudiPicker} aria-label="Annulla">×</button>

            {faseDado !== "scelta" ? (
              <div className="dado-lancio">
                <p className="dado-titolo">
                  {selezione.tipo === "coach" ? "Nuovo allenatore" : "Nuovo innesto"}
                  {attuale && <> · al posto di <b>{attuale.nome} {attuale.cognome}</b></>}
                </p>
                <button
                  className="dado-bottone"
                  onClick={rolla}
                  disabled={faseDado === "rolling"}
                >
                  <Dado valore={dadoVal} rolling={faseDado === "rolling"} size={96} />
                  <span className="dado-rolla">{faseDado === "rolling" ? "…" : "ROLLA"}</span>
                </button>
              </div>
            ) : (
              <>
                <div className="dado-esito">
                  <Dado valore={dadoVal} size={38} />
                  <span>Overall nascosto: scegli e scoprilo una volta inserito.</span>
                </div>
                <div className="dado-candidati">
                  {candidati.map((c) => (
                    <button key={c._id} className="candidato candidato-compatto" onClick={() => scegli(c)}>
                      <span className="cand-ruolo-tag">{selezione.tipo === "coach" ? "ALL" : c.ruolo}</span>
                      <span className="cand-info">
                        <span className="nome-g">{c.nome} {c.cognome}</span>
                        {c.provenienza ? (
                          <span className="ruolo-g">{c.provenienza.squadra} {c.provenienza.anno}</span>
                        ) : (
                          <span className="ruolo-g">Allenatore</span>
                        )}
                      </span>
                      <span className="cand-ovr-nascosto">?</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Intestazione({ stagione }) {
  return (
    <header className="intestazione">
      <div className="logo">Dinastia</div>
      <h1>Estate · verso la Stagione {stagione}</h1>
    </header>
  );
}
