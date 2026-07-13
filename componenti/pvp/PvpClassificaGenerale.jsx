"use client";

import { useEffect, useState } from "react";
import Stemma from "@/componenti/Stemma";
import { getClassificaGenerale } from "@/logica/pvp";

// Albo d'oro: classifica generale degli allenatori per Scudetti vinti nelle
// sfide settimanali.
export default function PvpClassificaGenerale({ profilo, onIndietro }) {
  const [righe, setRighe] = useState(null);

  useEffect(() => {
    let attivo = true;
    getClassificaGenerale(100).then((r) => { if (attivo) setRighe(r); });
    return () => { attivo = false; };
  }, []);

  return (
    <div className="stagione pvp-generale">
      <header className="barra-marchio">
        <div className="marchio">
          <Stemma size={34} />
          <span className="marchio-nome">Albo<br />d&apos;oro</span>
        </div>
        <span className="barra-fase">Classifica generale</span>
      </header>

      <section className="card col-classifica">
        <h2 className="sezione-titolo">🏆 Gli allenatori più vincenti</h2>
        {righe === null ? (
          <p className="pvp-avviso">Caricamento…</p>
        ) : righe.length === 0 ? (
          <p className="pvp-avviso">
            Ancora nessuno scudetto assegnato. Sii il primo a entrare nell&apos;albo d&apos;oro:
            partecipa alla sfida di questa settimana!
          </p>
        ) : (
          <table className="tab-classifica tab-albo">
            <thead>
              <tr>
                <th className="sx" colSpan={2}>Allenatore</th>
                <th>Part.</th>
                <th>🏆</th>
              </tr>
            </thead>
            <tbody>
              {righe.map((r) => (
                <tr
                  key={r.user_id}
                  className={`${r.posizione === 1 ? "zona-champions" : ""} ${profilo && r.user_id === profilo.id ? "utente" : ""}`}
                >
                  <td className="sx pos">{r.posizione}</td>
                  <td className="sx"><span className="nome-sq">{r.nickname}</span></td>
                  <td>{r.partecipazioni}</td>
                  <td className="pt">{r.scudetti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="azione-fissa">
        <button className="btn secondario" onClick={onIndietro}>← Indietro</button>
      </div>
    </div>
  );
}
