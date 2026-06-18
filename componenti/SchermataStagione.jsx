"use client";

import { useState } from "react";
import {
  costruisciCampionato,
  simulaStagione,
} from "@/logica/simulazione";

// Messaggio finale in base alla posizione in classifica.
function verdetto(posizione) {
  if (posizione === 1)
    return { classe: "scudetto", titolo: "🏆 SCUDETTO!", sotto: "Sei nella storia della Serie A." };
  if (posizione <= 4)
    return { classe: "", titolo: "Qualificazione Champions", sotto: "Tra le grandi d'Europa." };
  if (posizione <= 6)
    return { classe: "", titolo: "Qualificazione Europa League", sotto: "Stagione di alto livello." };
  if (posizione <= 10)
    return { classe: "", titolo: "Metà classifica", sotto: "Tranquilla salvezza." };
  if (posizione <= 17)
    return { classe: "", titolo: "Salvezza con brivido", sotto: "Ti sei salvato, ma soffrendo." };
  return { classe: "", titolo: "Retrocessione", sotto: "Serie B il prossimo anno..." };
}

export default function SchermataStagione({ rosa, onRicomincia }) {
  // Simula una sola volta, all'avvio della schermata.
  const [{ classifica, partiteUtente }] = useState(() => {
    const campionato = costruisciCampionato(rosa);
    return simulaStagione(campionato);
  });

  const posizione = classifica.findIndex((r) => r.utente) + 1;
  const v = verdetto(posizione);

  return (
    <div className="stagione">
      <header className="intestazione">
        <div className="logo">Fine stagione</div>
        <h1>Classifica finale</h1>
      </header>

      <div className={`verdetto ${v.classe}`}>
        <div className="posizione">{posizione}°</div>
        <div className="titolo">{v.titolo}</div>
        <div className="sottotitolo">{v.sotto}</div>
      </div>

      <div className="card">
        <table className="tab-classifica">
          <thead>
            <tr>
              <th className="sx" colSpan={2}>
                Squadra
              </th>
              <th>G</th>
              <th>DR</th>
              <th>Pt</th>
            </tr>
          </thead>
          <tbody>
            {classifica.map((r, i) => {
              const dr = r.gf - r.gs;
              return (
                <tr
                  key={r.id}
                  className={`${r.utente ? "utente" : ""} ${
                    i < 4 ? "zona-champions" : ""
                  }`}
                >
                  <td className="sx pos">{i + 1}</td>
                  <td className="sx">
                    <span className="nome-sq">
                      <span
                        className="pallino"
                        style={{ background: r.colore }}
                      />
                      {r.nome}
                    </span>
                  </td>
                  <td>{r.g}</td>
                  <td>{dr > 0 ? `+${dr}` : dr}</td>
                  <td className="pt">{r.punti}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="sezione-titolo">Le tue partite</h2>
      <div className="partite">
        {partiteUtente.map((m, i) => (
          <div className="partita" key={i}>
            <span className={`casa ${m.inCasa ? "mia" : ""}`}>{m.casa}</span>
            <span className="ris">
              {m.golCasa}–{m.golOspite}
            </span>
            <span className={`ospite ${!m.inCasa ? "mia" : ""}`}>
              {m.ospite}
            </span>
          </div>
        ))}
      </div>

      <p className="footer-note">
        Le 19 avversarie sono squadre storiche estratte a caso dal database.
      </p>

      <div className="azione-fissa">
        <button className="btn" onClick={onRicomincia}>
          Gioca ancora
        </button>
      </div>
    </div>
  );
}
