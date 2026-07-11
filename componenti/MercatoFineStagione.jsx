"use client";

import { useEffect, useRef, useState } from "react";
import { NOMI_RUOLO } from "@/logica/formazione";
import { pescaGiocatori, pescaAllenatori } from "@/logica/mercato";
import Dado from "@/componenti/Dado";

const CAMBI_GIOCATORI = 3; // cambi giocatore disponibili a fine stagione
const DURATA_DADO = 900; // ms di lancio del dado prima di mostrare i pescati

// Mercato di fine stagione: si scelgono fino a 3 giocatori (e l'allenatore) da
// cambiare "a sorte". Per ognuno si tira il dado e vengono pescati 10
// candidati casuali di quel ruolo dal database, con almeno uno nell'intorno
// (±1 overall) di chi si sta sostituendo. La rosa aggiornata viene poi usata
// per la stagione successiva (la dinastia continua).
export default function MercatoFineStagione({
  rosa,
  allenatore,
  squadre,
  allenatori,
  onProssima,
}) {
  const [rosaLavoro, setRosaLavoro] = useState(rosa);
  const [allLavoro, setAllLavoro] = useState(allenatore);
  const [cambiRimasti, setCambiRimasti] = useState(CAMBI_GIOCATORI);
  const [coachCambiato, setCoachCambiato] = useState(false);

  // Picker aperto: { tipo:"giocatore", indice } | { tipo:"coach" } | null.
  const [selezione, setSelezione] = useState(null);
  const [fase, setFase] = useState("idle"); // idle | dado | scelta
  const [candidati, setCandidati] = useState([]);
  const [dadoVal, setDadoVal] = useState(6);
  const timerDado = useRef(null);
  const intervalloDado = useRef(null);

  useEffect(() => () => { clearTimeout(timerDado.current); clearInterval(intervalloDado.current); }, []);

  const titolari = rosaLavoro.filter((p) => p.slot.tipo === "titolare");
  const idsInRosa = () => new Set(rosaLavoro.filter(Boolean).map((p) => p.giocatore._id));

  function chiudi() {
    clearTimeout(timerDado.current);
    clearInterval(intervalloDado.current);
    setSelezione(null);
    setFase("idle");
    setCandidati([]);
  }

  function avviaDado(sel, calcolaCandidati) {
    setSelezione(sel);
    setFase("dado");
    setCandidati([]);
    intervalloDado.current = setInterval(() => setDadoVal(1 + Math.floor(Math.random() * 6)), 90);
    timerDado.current = setTimeout(() => {
      clearInterval(intervalloDado.current);
      setDadoVal(1 + Math.floor(Math.random() * 6));
      setCandidati(calcolaCandidati());
      setFase("scelta");
    }, DURATA_DADO);
  }

  function cambiaGiocatore(indice) {
    if (cambiRimasti <= 0 || fase !== "idle") return;
    const pick = rosaLavoro[indice];
    avviaDado({ tipo: "giocatore", indice }, () =>
      pescaGiocatori(squadre, pick.slot, pick.giocatore, 10, idsInRosa())
    );
  }

  function cambiaCoach() {
    if (coachCambiato || fase !== "idle") return;
    const escl = new Set(allLavoro ? [`all-${allLavoro.nome}-${allLavoro.cognome}`] : []);
    avviaDado({ tipo: "coach" }, () => pescaAllenatori(allenatori, allLavoro, 10, escl));
  }

  function scegliCandidato(c) {
    if (selezione?.tipo === "giocatore") {
      const { indice } = selezione;
      setRosaLavoro((prev) => {
        const next = [...prev];
        const vecchio = next[indice];
        next[indice] = {
          ...vecchio,
          giocatore: { nome: c.nome, cognome: c.cognome, ruolo: c.ruolo, overall: c.overall, _id: c._id },
          provenienza: c.provenienza,
        };
        return next;
      });
      setCambiRimasti((n) => n - 1);
    } else if (selezione?.tipo === "coach") {
      setAllLavoro({ nome: c.nome, cognome: c.cognome, overall: c.overall });
      setCoachCambiato(true);
    }
    chiudi();
  }

  const attuale =
    selezione?.tipo === "giocatore"
      ? rosaLavoro[selezione.indice]?.giocatore
      : selezione?.tipo === "coach"
      ? allLavoro
      : null;

  return (
    <section className="card mercato">
      <div className="mercato-testa">
        <h2 className="sezione-titolo">Mercato di fine stagione</h2>
        <div className="mercato-crediti">
          <span className="mc-chip">{cambiRimasti} cambi</span>
          <span className={`mc-chip ${coachCambiato ? "usato" : ""}`}>
            {coachCambiato ? "coach ✓" : "1 coach"}
          </span>
        </div>
      </div>
      <p className="mercato-info">
        Rilancia la dinastia: cambia fino a {CAMBI_GIOCATORI} giocatori e
        l&apos;allenatore. Tiri il dado e peschi tra 10 profili a sorte del
        ruolo, uno dei quali vicino a chi sostituisci.
      </p>

      <div className="mercato-lista">
        {titolari.map((p) => {
          const indice = rosaLavoro.indexOf(p);
          return (
            <div className="mercato-riga" key={p.slot.indice}>
              <span className="mr-ruolo">{p.giocatore.ruolo}</span>
              <span className="mr-nome">{p.giocatore.nome} {p.giocatore.cognome}</span>
              <span className="mr-ovr">{p.giocatore.overall}</span>
              <button
                className="mr-cambia"
                onClick={() => cambiaGiocatore(indice)}
                disabled={cambiRimasti <= 0 || fase !== "idle"}
              >
                Cambia
              </button>
            </div>
          );
        })}

        {allLavoro && (
          <div className="mercato-riga coach">
            <span className="mr-ruolo">ALL</span>
            <span className="mr-nome">{allLavoro.nome} {allLavoro.cognome}</span>
            <span className="mr-ovr">{allLavoro.overall}</span>
            <button
              className="mr-cambia"
              onClick={cambiaCoach}
              disabled={coachCambiato || fase !== "idle"}
            >
              Cambia
            </button>
          </div>
        )}
      </div>

      {selezione && (
        <div className="dado-overlay" role="dialog" aria-modal="true">
          <div className="dado-pannello">
            <button className="dado-chiudi" onClick={chiudi} aria-label="Annulla">×</button>
            {fase === "dado" ? (
              <div className="dado-lancio">
                <Dado valore={dadoVal} rolling size={80} />
                <p>Sto pescando i profili…</p>
              </div>
            ) : (
              <>
                <div className="dado-esito">
                  <Dado valore={dadoVal} size={40} />
                  <span>
                    Al posto di <b>{attuale?.nome} {attuale?.cognome}</b>
                    {Number.isFinite(Number(attuale?.overall)) && <> ({attuale.overall})</>} —
                    scegline uno:
                  </span>
                </div>
                <div className="dado-candidati">
                  {candidati.map((c) => (
                    <button key={c._id} className="candidato candidato-compatto" onClick={() => scegliCandidato(c)}>
                      <span className="cand-ruolo-tag">{selezione.tipo === "coach" ? "ALL" : c.ruolo}</span>
                      <span className="cand-info">
                        <span className="nome-g">{c.nome} {c.cognome}</span>
                        {c.provenienza && (
                          <span className="ruolo-g">{c.provenienza.squadra} {c.provenienza.anno}</span>
                        )}
                      </span>
                      <span className="cand-ovr-mercato">{c.overall}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button className="btn btn-prossima" onClick={() => onProssima(rosaLavoro, allLavoro)}>
        Gioca la prossima stagione →
      </button>
    </section>
  );
}
