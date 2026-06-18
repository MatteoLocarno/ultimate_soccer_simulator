"use client";

import { useEffect, useState } from "react";
import { SLOT, TOTALE_SLOT, NOMI_RUOLO } from "@/logica/formazione";
import { estraiPerRuolo, estraiAllenatori, chiavePersona } from "@/logica/draft";
import FormazioneDraft from "@/componenti/FormazioneDraft";

const TOTALE_SCELTE = TOTALE_SLOT + 1; // 18 giocatori + 1 allenatore

// Schermata del draft: estrae una squadra per lo slot corrente (poi gli
// allenatori) e fa scegliere a overall nascosto, mentre la formazione si
// compone di fianco. Quando tutto è pieno, completa.
export default function SchermataDraft({ onCompletato }) {
  const [picks, setPicks] = useState([]);
  const [estrazione, setEstrazione] = useState(null);
  const [allenatori, setAllenatori] = useState(null);

  const faseAllenatore = picks.length >= TOTALE_SLOT;
  const slotCorrente = faseAllenatore ? null : SLOT[picks.length];

  // Ad ogni passo prepara i candidati: giocatori del ruolo, poi allenatori.
  useEffect(() => {
    if (picks.length < TOTALE_SLOT) {
      const idsUsati = new Set(picks.map((p) => p.giocatore._id));
      const personeUsate = new Set(picks.map((p) => chiavePersona(p.giocatore)));
      setEstrazione(estraiPerRuolo(SLOT[picks.length].ruolo, idsUsati, personeUsate));
      setAllenatori(null);
    } else {
      setAllenatori(estraiAllenatori(4));
      setEstrazione(null);
    }
  }, [picks]);

  function scegliGiocatore(giocatore) {
    setPicks((prev) => [
      ...prev,
      {
        slot: SLOT[prev.length],
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
    onCompletato({ rosa: picks, allenatore });
  }

  if (faseAllenatore ? !allenatori : !estrazione) return null;

  const percentuale = Math.round((picks.length / TOTALE_SCELTE) * 100);

  return (
    <div className="draft">
      <header className="intestazione">
        <div className="logo">Draft</div>
        <h1>
          {faseAllenatore
            ? "Scegli l'allenatore"
            : `Scegli il tuo ${NOMI_RUOLO[slotCorrente.ruolo]}`}
        </h1>
      </header>

      <div className="draft-top">
        <div className="progresso">
          <div style={{ width: `${percentuale}%` }} />
        </div>
        <div className="draft-meta">
          <span>
            Scelta {picks.length + 1} di {TOTALE_SCELTE}
          </span>
          <span
            className={`badge-ruolo ${
              faseAllenatore || slotCorrente.tipo === "panchina"
                ? "tipo-panchina"
                : ""
            }`}
          >
            {faseAllenatore
              ? "Allenatore"
              : `${slotCorrente.tipo === "titolare" ? "Titolare" : "Panchina"} · ${NOMI_RUOLO[slotCorrente.ruolo]}`}
          </span>
        </div>
      </div>

      <div className="draft-spread">
        <div className="draft-scelta">
          {faseAllenatore ? (
            <>
              <div className="squadra-estratta">
                <div className="occhiello">Ultimo tassello</div>
                <div className="nome">In panchina</div>
                <div className="anno">Scegli chi guiderà la dinastia</div>
              </div>
              <p className="istruzione">
                Scegli <b>un allenatore</b>. L&apos;overall resta nascosto fino
                alla fine.
              </p>
              <div className="lista-candidati">
                {allenatori.map((a) => (
                  <button
                    key={a._id}
                    className="candidato"
                    onClick={() => scegliAllenatore(a)}
                  >
                    <span>
                      <span className="nome-g">
                        {a.nome} {a.cognome}
                      </span>
                      <br />
                      <span className="ruolo-g">Allenatore</span>
                    </span>
                    <span className="freccia">＋</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="squadra-estratta">
                <div className="occhiello">Squadra estratta</div>
                <div className="nome">
                  <span
                    className="pallino"
                    style={{ background: estrazione.squadra.colore }}
                  />
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
                  <button
                    key={g._id}
                    className="candidato"
                    onClick={() => scegliGiocatore(g)}
                  >
                    <span>
                      <span className="nome-g">
                        {g.nome} {g.cognome}
                      </span>
                      <br />
                      <span className="ruolo-g">{NOMI_RUOLO[g.ruolo]}</span>
                    </span>
                    <span className="freccia">＋</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="draft-formazione">
          <h3 className="sezione-titolo">La tua squadra</h3>
          <FormazioneDraft
            picks={picks}
            slotCorrente={picks.length}
            allenatore={null}
            faseAllenatore={faseAllenatore}
          />
        </aside>
      </div>
    </div>
  );
}
