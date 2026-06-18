"use client";

import { useEffect, useState } from "react";
import { SLOT, TOTALE_SLOT, NOMI_RUOLO } from "@/logica/formazione";
import { estraiPerRuolo } from "@/logica/draft";

// Schermata del draft: estrae una squadra per lo slot corrente e fa scegliere
// un giocatore (overall nascosto). Quando i 18 slot sono pieni, completa.
export default function SchermataDraft({ onCompletato }) {
  const [picks, setPicks] = useState([]);
  const [estrazione, setEstrazione] = useState(null);

  const slotCorrente = SLOT[picks.length];

  // Ad ogni nuovo slot, estrae una squadra adatta al ruolo richiesto.
  useEffect(() => {
    if (picks.length >= TOTALE_SLOT) return;
    const idsUsati = new Set(picks.map((p) => p.giocatore._id));
    const ruolo = SLOT[picks.length].ruolo;
    setEstrazione(estraiPerRuolo(ruolo, idsUsati));
  }, [picks]);

  function scegli(giocatore) {
    const pick = {
      slot: slotCorrente,
      giocatore,
      provenienza: {
        squadra: estrazione.squadra.squadra,
        anno: estrazione.squadra.anno,
        colore: estrazione.squadra.colore,
      },
    };
    const nuove = [...picks, pick];
    if (nuove.length >= TOTALE_SLOT) {
      onCompletato(nuove);
    } else {
      setPicks(nuove);
    }
  }

  if (!estrazione || !slotCorrente) return null;

  const percentuale = Math.round((picks.length / TOTALE_SLOT) * 100);

  return (
    <div className="draft">
      <header className="intestazione">
        <div className="logo">Draft</div>
        <h1>Scegli il tuo {NOMI_RUOLO[slotCorrente.ruolo]}</h1>
      </header>

      <div className="draft-top">
        <div className="progresso">
          <div style={{ width: `${percentuale}%` }} />
        </div>
        <div className="draft-meta">
          <span>
            Scelta {picks.length + 1} di {TOTALE_SLOT}
          </span>
          <span
            className={`badge-ruolo ${
              slotCorrente.tipo === "panchina" ? "tipo-panchina" : ""
            }`}
          >
            {slotCorrente.tipo === "titolare" ? "Titolare" : "Panchina"} ·{" "}
            {NOMI_RUOLO[slotCorrente.ruolo]}
          </span>
        </div>
      </div>

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
            onClick={() => scegli(g)}
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

      {picks.length > 0 && (
        <div className="mini-rosa">
          {picks.map((p, i) => (
            <span className="gettone" key={i}>
              <span className="r">{p.slot.ruolo}</span> {p.giocatore.cognome || p.giocatore.nome}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
