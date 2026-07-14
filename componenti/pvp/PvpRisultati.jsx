"use client";

import { useMemo } from "react";
import Stemma from "@/componenti/Stemma";
import AndamentoChart from "@/componenti/AndamentoChart";
import { simulaCampionatoPvp, classificaIscritti } from "@/logica/pvp";

// Zona di classifica (come nel singolo giocatore): scudetto in vetta,
// retrocessione in coda.
function zona(pos, n) {
  if (pos === 1) return "zona-champions";
  if (pos <= 4) return "zona-champions";
  if (pos === 5) return "zona-europa";
  if (pos === 6) return "zona-conference";
  if (pos > n - 3) return "zona-retro";
  return "";
}

// Rivelazione della domenica: campionato simulato tra tutte le squadre iscritte
// (più eventuali storiche se gli iscritti sono meno di 20). La classifica è
// deterministica (stessa per tutti): seedata dal torneo.
export default function PvpRisultati({ torneo, entries, viewerUserId, squadreDB, onGenerale, onEsci }) {
  const sim = useMemo(
    () => simulaCampionatoPvp(torneo, entries, viewerUserId, squadreDB),
    [torneo, entries, viewerUserId, squadreDB]
  );
  const { classifica, marcatori, assist, andamentoUtente } = sim;

  const iscritti = classificaIscritti(classifica);
  const campione = iscritti[0] || null;
  const nIscritti = iscritti.length;

  // La mia squadra e la mia posizione (assoluta e tra gli iscritti).
  const mioIndice = classifica.findIndex((r) => r.utente);
  const mia = mioIndice >= 0 ? classifica[mioIndice] : null;
  const miaPosAssoluta = mioIndice >= 0 ? mioIndice + 1 : null;
  const miaPosIscritti = mia ? iscritti.find((r) => r.utente)?.posIscritti : null;
  const hoVinto = miaPosIscritti === 1;

  const tabellaBomber = (lista, campo, titolo) =>
    lista.length > 0 && (
      <section className="card">
        <h2 className="sezione-titolo">{titolo}</h2>
        <table className="tab-bomber">
          <tbody>
            {lista.map((p, i) => (
              <tr key={i} className={p.utente ? "utente" : ""}>
                <td className="bb-pos">{i + 1}</td>
                <td className="bb-nome">{p.nome} {p.cognome}</td>
                <td className="bb-squadra">{p.squadra}</td>
                <td className="bb-val">{p[campo]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );

  return (
    <div className="stagione pvp-risultati">
      <header className="barra-marchio">
        <div className="marchio">
          <Stemma size={34} />
          <span className="marchio-nome">Sfida<br />settimanale</span>
        </div>
        <span className="barra-fase">{torneo.settimana} · Risultati</span>
      </header>

      {/* Vincitore della settimana */}
      <div className={`verdetto ${hoVinto ? "scudetto" : ""}`}>
        {campione ? (
          <>
            {hoVinto && <Stemma size={84} className="verdetto-stemma" />}
            <div className="pvp-campione-occhiello">🏆 Campione della settimana</div>
            <div className="titolo">{campione.nickname || campione.nome}</div>
            <div className="sottotitolo">
              {campione.nome} — {campione.punti} punti · si aggiudica lo Scudetto
            </div>
          </>
        ) : (
          <div className="titolo">Nessun iscritto questa settimana</div>
        )}
      </div>

      {/* La mia posizione */}
      {mia ? (
        <div className={`pvp-mia-posizione ${hoVinto ? "vinto" : ""}`}>
          <div className="pmp-grande">{miaPosIscritti}<span>º</span></div>
          <div className="pmp-testo">
            <div className="pmp-nome">{mia.nome}</div>
            <div className="pmp-sub">
              {hoVinto
                ? "Hai vinto lo Scudetto! Sei nell'albo d'oro."
                : `${miaPosIscritti}º su ${nIscritti} iscritti · ${miaPosAssoluta}º assoluto in classifica`}
            </div>
          </div>
        </div>
      ) : (
        <p className="pvp-avviso">
          Non ti sei iscritto a questa settimana. Torna da lunedì per la prossima sfida!
        </p>
      )}

      <div className="spread">
        <section className="card col-classifica">
          <h2 className="sezione-titolo">Classifica finale · {classifica.length} squadre</h2>
          <table className="tab-classifica">
            <thead>
              <tr><th className="sx" colSpan={2}>Squadra</th><th>G</th><th>DR</th><th>Pt</th></tr>
            </thead>
            <tbody>
              {classifica.map((r, i) => {
                const dr = r.gf - r.gs;
                return (
                  <tr key={r.id} className={`${zona(i + 1, classifica.length)} ${r.utente ? "utente" : ""}`}>
                    <td className="sx pos">{i + 1}</td>
                    <td className="sx">
                      <span className="nome-sq">
                        <span className="pallino" style={{ background: r.colore }} />
                        {r.nome}
                        {!r.storica && <span className="pvp-tag-nick">{r.nickname}</span>}
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

        {mia && (
          <aside className="col-lato">
            <section className="card">
              <h2 className="sezione-titolo">Il tuo campionato</h2>
              <div className="stat-griglia">
                <div className="stat"><span className="stat-v">{miaPosIscritti}º</span><span className="stat-l">Tra iscritti</span></div>
                <div className="stat"><span className="stat-v">{mia.punti}</span><span className="stat-l">Punti</span></div>
                <div className="stat"><span className="stat-v">{mia.v}</span><span className="stat-l">Vittorie</span></div>
                <div className="stat"><span className="stat-v">{mia.n}</span><span className="stat-l">Pareggi</span></div>
                <div className="stat"><span className="stat-v">{mia.p}</span><span className="stat-l">Sconfitte</span></div>
                <div className="stat"><span className="stat-v">{mia.gf}</span><span className="stat-l">Gol fatti</span></div>
                <div className="stat"><span className="stat-v">{mia.gs}</span><span className="stat-l">Gol subiti</span></div>
                <div className="stat"><span className="stat-v">{mia.gf - mia.gs > 0 ? `+${mia.gf - mia.gs}` : mia.gf - mia.gs}</span><span className="stat-l">Diff. reti</span></div>
              </div>
            </section>
            <section className="card">
              <h2 className="sezione-titolo">Il tuo andamento</h2>
              <AndamentoChart andamento={andamentoUtente} nSquadre={classifica.length} />
            </section>
          </aside>
        )}
      </div>

      <div className="spread">
        {tabellaBomber(marcatori, "gol", "Classifica marcatori")}
        {tabellaBomber(assist, "assist", "Classifica assist")}
      </div>

      <div className="azione-fissa doppia">
        <button className="btn secondario" onClick={onEsci}>Menu principale</button>
        <button className="btn" onClick={onGenerale}>Classifica generale →</button>
      </div>
    </div>
  );
}
