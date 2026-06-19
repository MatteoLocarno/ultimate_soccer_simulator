"use client";

import { useEffect, useState } from "react";
import { NOMI_RUOLO } from "@/logica/formazione";
import { estraiPerRuolo, estraiAllenatori, chiavePersona } from "@/logica/draft";
import FormazioneDraft from "@/componenti/FormazioneDraft";

// Schermata del draft. Sequenza: giocatori (per i 18 slot del modulo) →
// allenatore → capitano. Tutto a overall nascosto, mentre la formazione si
// compone di fianco.
export default function SchermataDraft({ slot, squadre, allenatori: listaAllenatori, onCompletato }) {
  const totaleSlot = slot.length;
  const totaleScelte = totaleSlot + 2; // + allenatore + capitano

  const [picks, setPicks] = useState([]);
  const [estrazione, setEstrazione] = useState(null);
  const [allenatori, setAllenatori] = useState(null);
  const [allenatoreScelto, setAllenatoreScelto] = useState(null);

  const faseGiocatori = picks.length < totaleSlot;
  const faseAllenatore = !faseGiocatori && !allenatoreScelto;
  const faseCapitano = !faseGiocatori && !!allenatoreScelto;
  const slotCorrente = faseGiocatori ? slot[picks.length] : null;

  // Prepara i candidati in base alla fase.
  useEffect(() => {
    if (faseGiocatori) {
      const idsUsati = new Set(picks.map((p) => p.giocatore._id));
      const personeUsate = new Set(picks.map((p) => chiavePersona(p.giocatore)));
      setEstrazione(
        estraiPerRuolo(slot[picks.length].ruolo, idsUsati, personeUsate, squadre)
      );
    } else if (faseAllenatore) {
      setAllenatori(estraiAllenatori(4, listaAllenatori));
    }
  }, [picks, allenatoreScelto]); // eslint-disable-line react-hooks/exhaustive-deps

  function scegliGiocatore(giocatore) {
    setPicks((prev) => [
      ...prev,
      {
        slot: slot[prev.length],
        giocatore,
        provenienza: {
          squadra: estrazione.squadra.squadra,
          anno: estrazione.squadra.anno,
          colore: estrazione.squadra.colore,
        },
      },
    ]);
  }

  function scegliAllenatore(allenatore) {
    setAllenatoreScelto(allenatore);
  }

  function scegliCapitano(pick) {
    onCompletato({
      rosa: picks,
      allenatore: allenatoreScelto,
      capitano: pick.giocatore._id,
    });
  }

  if (faseGiocatori && !estrazione) return null;
  if (faseAllenatore && !allenatori) return null;

  const scelteFatte = picks.length + (allenatoreScelto ? 1 : 0);
  const percentuale = Math.round((scelteFatte / totaleScelte) * 100);
  const titolari = picks.filter((p) => p.slot.tipo === "titolare");

  // Titolo ed etichetta in base alla fase.
  let titolo, etichetta, etichettaPanchina;
  if (faseGiocatori) {
    titolo = `Scegli il tuo ${NOMI_RUOLO[slotCorrente.ruolo]}`;
    etichetta = `${slotCorrente.tipo === "titolare" ? "Titolare" : "Panchina"} · ${NOMI_RUOLO[slotCorrente.ruolo]}`;
    etichettaPanchina = slotCorrente.tipo === "panchina";
  } else if (faseAllenatore) {
    titolo = "Scegli l'allenatore";
    etichetta = "Allenatore";
    etichettaPanchina = true;
  } else {
    titolo = "Scegli il capitano";
    etichetta = "Capitano";
    etichettaPanchina = true;
  }

  return (
    <div className="draft">
      <header className="intestazione">
        <div className="logo">Draft</div>
        <h1>{titolo}</h1>
      </header>

      <div className="draft-top">
        <div className="progresso">
          <div style={{ width: `${percentuale}%` }} />
        </div>
        <div className="draft-meta">
          <span>
            Scelta {scelteFatte + 1} di {totaleScelte}
          </span>
          <span className={`badge-ruolo ${etichettaPanchina ? "tipo-panchina" : ""}`}>
            {etichetta}
          </span>
        </div>
      </div>

      <div className="draft-spread">
        <div className="draft-scelta">
          {faseGiocatori && (
            <>
              <div className="squadra-estratta">
                <div className="occhiello">Squadra estratta</div>
                <div className="nome">
                  <span className="pallino" style={{ background: estrazione.squadra.colore }} />
                  {estrazione.squadra.squadra}
                </div>
                <div className="anno">Stagione {estrazione.squadra.anno}</div>
              </div>
              <p className="istruzione">
                Scegli <b>un {NOMI_RUOLO[slotCorrente.ruolo].toLowerCase()}</b>{" "}
                di questa rosa. L&apos;overall resta nascosto fino alla fine.
              </p>
              <div className="lista-candidati">
                {estrazione.candidati.map((g) => (
                  <button key={g._id} className="candidato" onClick={() => scegliGiocatore(g)}>
                    <span>
                      <span className="nome-g">{g.nome} {g.cognome}</span>
                      <br />
                      <span className="ruolo-g">{NOMI_RUOLO[g.ruolo]}</span>
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
              <p className="istruzione">
                Scegli <b>un allenatore</b>. L&apos;overall resta nascosto fino
                alla fine.
              </p>
              <div className="lista-candidati">
                {allenatori.map((a) => (
                  <button key={a._id} className="candidato" onClick={() => scegliAllenatore(a)}>
                    <span>
                      <span className="nome-g">{a.nome} {a.cognome}</span>
                      <br />
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
              <p className="istruzione">
                Scegli <b>il capitano</b> tra i tuoi titolari.
              </p>
              <div className="lista-candidati">
                {titolari.map((pick) => (
                  <button
                    key={pick.giocatore._id}
                    className="candidato"
                    onClick={() => scegliCapitano(pick)}
                  >
                    <span>
                      <span className="nome-g">
                        {pick.giocatore.nome} {pick.giocatore.cognome}
                      </span>
                      <br />
                      <span className="ruolo-g">{NOMI_RUOLO[pick.giocatore.ruolo]}</span>
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
