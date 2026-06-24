"use client";

import { useEffect, useState } from "react";
import { NOMI_RUOLO } from "@/logica/formazione";
import { estraiCandidati, estraiAllenatori, chiavePersona } from "@/logica/draft";
import FormazioneDraft from "@/componenti/FormazioneDraft";

const SKIP = [
  { tipo: "tutto", etichetta: "Cambia tutto", icona: "🔄" },
  { tipo: "stagione", etichetta: "Stessa stagione", icona: "📅" },
  { tipo: "club", etichetta: "Stesso club", icona: "🛡️" },
];

export default function SchermataDraft({ slot, squadre, allenatori: listaAllenatori, onCompletato }) {
  const totaleSlot = slot.length;
  const totaleScelte = totaleSlot + 2; // + allenatore + capitano

  const [picks, setPicks] = useState([]);
  const [candidati, setCandidati] = useState([]);
  const [allenatori, setAllenatori] = useState(null);
  const [allenatoreScelto, setAllenatoreScelto] = useState(null);
  const [skipUsati, setSkipUsati] = useState([]); // tipi di skip già usati (tutto il draft)

  const faseGiocatori = picks.length < totaleSlot;
  const faseAllenatore = !faseGiocatori && !allenatoreScelto;
  const faseCapitano = !faseGiocatori && !!allenatoreScelto;
  const slotCorrente = faseGiocatori ? slot[picks.length] : null;

  const idsUsati = () => new Set(picks.map((p) => p.giocatore._id));
  const personeUsate = () => new Set(picks.map((p) => chiavePersona(p.giocatore)));

  // Nuovi candidati ad ogni slot (scope "tutto"); allenatori in fase coach.
  useEffect(() => {
    if (faseGiocatori) {
      const { candidati } = estraiCandidati(slot[picks.length].ruolo, idsUsati(), personeUsate(), squadre, { tipo: "tutto" });
      setCandidati(candidati);
    } else if (faseAllenatore) {
      setAllenatori(estraiAllenatori(4, listaAllenatori));
    }
  }, [picks, allenatoreScelto]); // eslint-disable-line react-hooks/exhaustive-deps

  function usaSkip(tipo) {
    if (skipUsati.includes(tipo) || !faseGiocatori) return;
    setSkipUsati((s) => [...s, tipo]);
    const { candidati } = estraiCandidati(slotCorrente.ruolo, idsUsati(), personeUsate(), squadre, { tipo });
    setCandidati(candidati);
  }

  function scegliGiocatore(c) {
    setPicks((prev) => [
      ...prev,
      { slot: slot[prev.length], giocatore: { nome: c.nome, cognome: c.cognome, ruolo: c.ruolo, overall: c.overall, _id: c._id }, provenienza: c.provenienza },
    ]);
  }
  function scegliAllenatore(a) { setAllenatoreScelto(a); }
  function scegliCapitano(p) { onCompletato({ rosa: picks, allenatore: allenatoreScelto, capitano: p.giocatore._id }); }

  if (faseAllenatore && !allenatori) return null;

  const scelteFatte = picks.length + (allenatoreScelto ? 1 : 0);
  const percentuale = Math.round((scelteFatte / totaleScelte) * 100);
  const titolari = picks.filter((p) => p.slot.tipo === "titolare");

  let titolo, etichetta, etichettaPanchina;
  if (faseGiocatori) {
    titolo = `Scegli il tuo ${NOMI_RUOLO[slotCorrente.ruolo] || slotCorrente.ruolo}`;
    etichetta = `${slotCorrente.tipo === "titolare" ? "Titolare" : "Panchina"} · ${NOMI_RUOLO[slotCorrente.ruolo] || slotCorrente.ruolo}`;
    etichettaPanchina = slotCorrente.tipo === "panchina";
  } else if (faseAllenatore) {
    titolo = "Scegli l'allenatore"; etichetta = "Allenatore"; etichettaPanchina = true;
  } else {
    titolo = "Scegli il capitano"; etichetta = "Capitano"; etichettaPanchina = true;
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
          <span className={`badge-ruolo ${etichettaPanchina ? "tipo-panchina" : ""}`}>{etichetta}</span>
        </div>
      </div>

      <div className="draft-spread">
        <div className="draft-scelta">
          {faseGiocatori && (
            <>
              <p className="istruzione">
                10 candidati per il ruolo, da club e stagioni diversi.{" "}
                <b>L&apos;overall resta nascosto.</b>
              </p>
              <div className="skip-bar">
                {SKIP.map((s) => (
                  <button
                    key={s.tipo}
                    className="skip-btn"
                    disabled={skipUsati.includes(s.tipo)}
                    onClick={() => usaSkip(s.tipo)}
                    title={`Ripesca i candidati: ${s.etichetta}`}
                  >
                    <span className="skip-ic">{s.icona}</span> {s.etichetta}
                  </button>
                ))}
              </div>
              <div className="lista-candidati">
                {candidati.map((c) => (
                  <button key={c._id} className="candidato" onClick={() => scegliGiocatore(c)}>
                    <span className="cand-info">
                      <span className="nome-g">{c.nome} {c.cognome}</span>
                      <span className="ruolo-g">
                        {NOMI_RUOLO[c.ruolo] || c.ruolo} · {c.provenienza.squadra} {c.provenienza.anno}
                      </span>
                    </span>
                    <span className="freccia">＋</span>
                  </button>
                ))}
              </div>
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
            picks={picks}
            slotCorrente={faseGiocatori ? picks.length : -1}
            allenatore={allenatoreScelto}
            faseAllenatore={faseAllenatore}
          />
        </aside>
      </div>
    </div>
  );
}
