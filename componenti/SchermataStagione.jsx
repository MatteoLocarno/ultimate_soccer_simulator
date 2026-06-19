"use client";

import { useState } from "react";
import {
  costruisciCampionato,
  simulaStagione,
} from "@/logica/simulazione";
import Stemma from "@/componenti/Stemma";
import Campo from "@/componenti/Campo";
import AndamentoChart from "@/componenti/AndamentoChart";

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

// Calcola miglior vittoria e peggior sconfitta dal punto di vista dell'utente.
function estremi(partiteUtente) {
  let migliore = null;
  let peggiore = null;
  for (const m of partiteUtente) {
    const pro = m.inCasa ? m.golCasa : m.golOspite;
    const contro = m.inCasa ? m.golOspite : m.golCasa;
    const avversario = m.inCasa ? m.ospite : m.casa;
    const margine = pro - contro;
    const voce = { pro, contro, avversario, margine };
    if (margine > 0 && (!migliore || margine > migliore.margine || (margine === migliore.margine && pro > migliore.pro)))
      migliore = voce;
    if (margine < 0 && (!peggiore || margine < peggiore.margine || (margine === peggiore.margine && contro > peggiore.contro)))
      peggiore = voce;
  }
  return { migliore, peggiore };
}

export default function SchermataStagione({
  rosa,
  allenatore,
  capitano,
  nomeSquadra,
  colore,
  squadre,
  onRicomincia,
}) {
  // Simula una sola volta, all'avvio della schermata.
  const [{ classifica, partiteUtente, andamentoUtente }] = useState(() => {
    const campionato = costruisciCampionato(rosa, nomeSquadra, allenatore, colore, squadre);
    return simulaStagione(campionato);
  });

  // Il "listone" delle partite si apre/chiude con un click (chiuso di default).
  const [partiteAperte, setPartiteAperte] = useState(false);

  const posizione = classifica.findIndex((r) => r.utente) + 1;
  const mia = classifica[posizione - 1];
  const v = verdetto(posizione);
  const { migliore, peggiore } = estremi(partiteUtente);
  const titolari = rosa.filter((p) => p.slot.tipo === "titolare");
  const capitanoPick = titolari.find((p) => p.giocatore._id === capitano);
  const capitanoNome = capitanoPick
    ? `${capitanoPick.giocatore.nome} ${capitanoPick.giocatore.cognome}`
    : null;

  return (
    <div className="stagione">
      {/* marchio in alto a sinistra + etichetta fase a destra */}
      <header className="barra-marchio">
        <div className="marchio">
          <Stemma size={36} />
          <span className="marchio-nome">
            Dinastia<br />Scudetto
          </span>
        </div>
        <span className="barra-fase">Fine stagione</span>
      </header>

      <div className={`verdetto ${v.classe}`}>
        {posizione === 1 && <Stemma size={84} className="verdetto-stemma" />}
        <div className="posizione">{posizione}°</div>
        <div className="titolo">{v.titolo}</div>
        <div className="sottotitolo">
          {nomeSquadra} — {v.sotto}
        </div>
      </div>

      {/* spread: classifica a sinistra, formazione + andamento a destra */}
      <div className="spread">
        <section className="card col-classifica">
          <h2 className="sezione-titolo">Classifica finale</h2>
          <table className="tab-classifica">
            <thead>
              <tr>
                <th className="sx" colSpan={2}>Squadra</th>
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
                    className={`${r.utente ? "utente" : ""} ${i < 4 ? "zona-champions" : ""}`}
                  >
                    <td className="sx pos">{i + 1}</td>
                    <td className="sx">
                      <span className="nome-sq">
                        <span className="pallino" style={{ background: r.colore }} />
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
        </section>

        <aside className="col-lato">
          <section className="card">
            <h2 className="sezione-titolo">La tua formazione</h2>
            <Campo titolari={titolari} mini capitanoId={capitano} />
            {allenatore && (
              <div className="all-caption">
                <span className="ac-l">Allenatore</span>
                <span className="ac-v">
                  {allenatore.nome} {allenatore.cognome}
                </span>
              </div>
            )}
            {capitanoNome && (
              <div className="all-caption">
                <span className="ac-l">Capitano</span>
                <span className="ac-v">{capitanoNome}</span>
              </div>
            )}
          </section>

          <section className="card">
            <h2 className="sezione-titolo">Il tuo andamento</h2>
            <div className="stat-griglia">
              <div className="stat"><span className="stat-v">{posizione}°</span><span className="stat-l">Posizione</span></div>
              <div className="stat"><span className="stat-v">{mia.punti}</span><span className="stat-l">Punti</span></div>
              <div className="stat"><span className="stat-v">{mia.v}</span><span className="stat-l">Vittorie</span></div>
              <div className="stat"><span className="stat-v">{mia.n}</span><span className="stat-l">Pareggi</span></div>
              <div className="stat"><span className="stat-v">{mia.p}</span><span className="stat-l">Sconfitte</span></div>
              <div className="stat"><span className="stat-v">{mia.gf}</span><span className="stat-l">Gol fatti</span></div>
              <div className="stat"><span className="stat-v">{mia.gs}</span><span className="stat-l">Gol subiti</span></div>
              <div className="stat">
                <span className="stat-v">{mia.gf - mia.gs > 0 ? `+${mia.gf - mia.gs}` : mia.gf - mia.gs}</span>
                <span className="stat-l">Diff. reti</span>
              </div>
            </div>
            <ul className="andamento-extra">
              {migliore && (
                <li>
                  <span className="ae-l">Miglior vittoria</span>
                  <span className="ae-v">{migliore.pro}–{migliore.contro} <em>vs {migliore.avversario}</em></span>
                </li>
              )}
              {peggiore && (
                <li>
                  <span className="ae-l">Peggior sconfitta</span>
                  <span className="ae-v">{peggiore.pro}–{peggiore.contro} <em>vs {peggiore.avversario}</em></span>
                </li>
              )}
            </ul>
          </section>
        </aside>
      </div>

      <section className="card">
        <button
          className="sezione-toggle"
          onClick={() => setPartiteAperte((v) => !v)}
          aria-expanded={partiteAperte}
        >
          <span className="sezione-titolo">Le tue partite</span>
          <span className="toggle-icona">{partiteAperte ? "−" : "+"}</span>
        </button>
        {partiteAperte && (
          <div className="partite">
            {partiteUtente.map((m, i) => (
              <div className="partita" key={i}>
                <span className={`casa ${m.inCasa ? "mia" : ""}`}>{m.casa}</span>
                <span className="ris">{m.golCasa}–{m.golOspite}</span>
                <span className={`ospite ${!m.inCasa ? "mia" : ""}`}>{m.ospite}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="sezione-titolo">Andamento in classifica</h2>
        <AndamentoChart andamento={andamentoUtente} nSquadre={classifica.length} />
      </section>

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
