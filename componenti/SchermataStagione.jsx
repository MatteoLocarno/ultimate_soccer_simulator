"use client";

import { useEffect, useState } from "react";
import { costruisciCampionato, simulaStagione } from "@/logica/simulazione";
import Stemma from "@/componenti/Stemma";
import Campo from "@/componenti/Campo";
import AndamentoChart from "@/componenti/AndamentoChart";
import AdSlot from "@/componenti/AdSlot";

const VELOCITA = {
  standard: { ms: 650, label: "Standard" },
  rapido: { ms: 260, label: "Rapido" },
  ultra: { ms: 70, label: "Ultra" },
};
const ROW = 30; // altezza riga classifica live (px)

// Zona di classifica per posizione (1-based), stessa logica per la
// classifica live e quella finale: Champions/Europa/Conference in cima,
// retrocessione negli ultimi 3 posti (su un girone a 20 squadre).
function zonaClassifica(pos, n) {
  if (pos <= 4) return "zona-champions";
  if (pos === 5) return "zona-europa";
  if (pos === 6) return "zona-conference";
  if (pos > n - 3) return "zona-retro";
  return "";
}

// Il verdetto di fine stagione non guarda solo la posizione, ma anche
// QUANTO è stata sofferta o dominata: due squadre entrambe 15e possono
// aver vissuto stagioni opposte (corsa salvezza risicata vs comoda
// tranquillità), e un 11° posto è comunque metà classifica vera, non una
// salvezza "per un pelo" solo perché non è tra le prime 10.
function verdetto(classifica, p) {
  const n = classifica.length;
  if (p === 1) return { classe: "scudetto", titolo: "🏆 SCUDETTO!", sotto: "Sei nella storia della Serie A." };
  if (p <= 4) return { classe: "", titolo: "Qualificazione Champions League", sotto: "Tra le grandi d'Europa." };
  if (p === 5) return { classe: "", titolo: "Qualificazione Europa League", sotto: "Stagione di altissimo livello." };
  if (p === 6) return { classe: "", titolo: "Qualificazione Conference League", sotto: "Un pass europeo comunque prezioso." };
  if (p <= 8) return { classe: "", titolo: "Stagione di alto profilo", sotto: "Hai sfiorato l'Europa: quasi un'impresa." };

  const posUltimaSalva = n - 3; // 17ª su 20
  const puntiUtente = classifica[p - 1].punti;

  if (p <= posUltimaSalva) {
    const puntiPrimaRetrocessa = classifica[posUltimaSalva].punti;
    const margine = puntiUtente - puntiPrimaRetrocessa;
    if (p <= 13 || margine >= 12) {
      return { classe: "", titolo: "Stagione di metà classifica", sotto: "Un campionato solido, senza troppi patemi." };
    }
    if (margine >= 5) {
      return { classe: "", titolo: "Salvezza raggiunta con merito", sotto: "Qualche pensiero di troppo, ma mai davvero in bilico." };
    }
    return { classe: "", titolo: "Salvezza con brivido", sotto: "Ti sei salvato, ma soffrendo fino alla fine." };
  }

  const puntiUltimaSalva = classifica[posUltimaSalva - 1].punti;
  const distacco = puntiUltimaSalva - puntiUtente;
  if (distacco <= 3) {
    return { classe: "", titolo: "Retrocessione beffarda", sotto: "Salvezza sfumata all'ultimo respiro." };
  }
  return { classe: "", titolo: "Retrocessione", sotto: "Serie B il prossimo anno..." };
}

function estremi(partite) {
  let migliore = null, peggiore = null;
  for (const m of partite) {
    const pro = m.inCasa ? m.golCasa : m.golOspite;
    const contro = m.inCasa ? m.golOspite : m.golCasa;
    const avversario = m.inCasa ? m.ospite : m.casa;
    const margine = pro - contro;
    const v = { pro, contro, avversario, margine };
    if (margine > 0 && (!migliore || margine > migliore.margine || (margine === migliore.margine && pro > migliore.pro))) migliore = v;
    if (margine < 0 && (!peggiore || margine < peggiore.margine || (margine === peggiore.margine && contro > peggiore.contro))) peggiore = v;
  }
  return { migliore, peggiore };
}

// Classifica animata: righe posizionate per rango con transizione.
function ClassificaAnimata({ snapshot }) {
  return (
    <div className="classifica-live" style={{ height: snapshot.length * ROW }}>
      {snapshot.map((r, i) => {
        const dr = r.gf - r.gs;
        return (
          <div
            key={r.id}
            className={`riga-live ${zonaClassifica(i + 1, snapshot.length)} ${r.utente ? "utente" : ""}`}
            style={{ top: i * ROW }}
          >
            <span className="rl-pos">{i + 1}</span>
            <span className="pallino" style={{ background: r.colore }} />
            <span className="rl-nome">{r.nome}</span>
            <span className="rl-dr">{dr > 0 ? `+${dr}` : dr}</span>
            <span className="rl-pt">{r.punti}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SchermataStagione({ rosa, allenatore, capitano, nomeSquadra, colore, squadre, onRicomincia }) {
  const [sim] = useState(() => {
    const camp = costruisciCampionato(rosa, nomeSquadra, allenatore, colore, squadre);
    return simulaStagione(camp);
  });
  const { classifica, partiteUtente, andamentoUtente, giornate, marcatori, assist } = sim;
  const totale = giornate.length;

  const [fase, setFase] = useState("live");
  const [velocita, setVelocita] = useState("standard");
  const [idx, setIdx] = useState(1); // giornate giocate
  const [partiteAperte, setPartiteAperte] = useState(false);

  // Avanzamento automatico della sim live.
  useEffect(() => {
    if (fase !== "live") return;
    if (idx >= totale) { const t = setTimeout(() => { setFase("recap"); window.scrollTo(0, 0); }, 600); return () => clearTimeout(t); }
    const t = setTimeout(() => setIdx((i) => Math.min(i + 1, totale)), VELOCITA[velocita].ms);
    return () => clearTimeout(t);
  }, [fase, idx, velocita, totale]);

  // ----------------------------------------------------------------- LIVE ---
  if (fase === "live") {
    const snapshot = giornate[idx - 1] || giornate[0];
    const miaPartita = partiteUtente.find((m) => m.giornata === idx);
    return (
      <div className="stagione">
        <header className="barra-marchio">
          <div className="marchio">
            <Stemma size={32} />
            <span className="marchio-nome">Dinastia<br />Scudetto</span>
          </div>
          <span className="barra-fase">Giornata {idx}/{totale}</span>
        </header>

        <div className="live-top">
          <div className="velocita-bar">
            {Object.entries(VELOCITA).map(([k, v]) => (
              <button key={k} className={`vel-btn ${velocita === k ? "attivo" : ""}`} onClick={() => setVelocita(k)}>{v.label}</button>
            ))}
            <button className="vel-btn salta" onClick={() => { setIdx(totale); setFase("recap"); window.scrollTo(0, 0); }}>Salta »</button>
          </div>
          {miaPartita && (
            <div className="live-mia">
              <span className={miaPartita.inCasa ? "mia" : ""}>{miaPartita.casa}</span>
              <span className="ris">{miaPartita.golCasa}–{miaPartita.golOspite}</span>
              <span className={!miaPartita.inCasa ? "mia" : ""}>{miaPartita.ospite}</span>
            </div>
          )}
        </div>

        <div className="spread">
          <section className="card col-classifica">
            <h2 className="sezione-titolo">Classifica · {idx}ª giornata</h2>
            <ClassificaAnimata snapshot={snapshot} />
          </section>
          <aside className="col-lato">
            <section className="card">
              <h2 className="sezione-titolo">Andamento</h2>
              <AndamentoChart andamento={andamentoUtente.slice(0, idx)} totaleGiornate={totale} nSquadre={classifica.length} />
            </section>
          </aside>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- RECAP ---
  const posizione = classifica.findIndex((r) => r.utente) + 1;
  const mia = classifica[posizione - 1];
  const v = verdetto(classifica, posizione);
  const { migliore, peggiore } = estremi(partiteUtente);
  const titolari = rosa.filter((p) => p.slot.tipo === "titolare");
  const capitanoPick = titolari.find((p) => p.giocatore._id === capitano);
  const capitanoNome = capitanoPick ? `${capitanoPick.giocatore.nome} ${capitanoPick.giocatore.cognome}` : null;

  const tabellaBomber = (lista, campo, titolo) => (
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
    <div className="stagione">
      <header className="barra-marchio">
        <div className="marchio">
          <Stemma size={36} />
          <span className="marchio-nome">Dinastia<br />Scudetto</span>
        </div>
        <span className="barra-fase">Fine stagione</span>
      </header>

      <div className={`verdetto ${v.classe}`}>
        {posizione === 1 && <Stemma size={84} className="verdetto-stemma" />}
        <div className="posizione">{posizione}°</div>
        <div className="titolo">{v.titolo}</div>
        <div className="sottotitolo">{nomeSquadra} — {v.sotto}</div>
      </div>

      <div className="spread">
        <section className="card col-classifica">
          <h2 className="sezione-titolo">Classifica finale</h2>
          <table className="tab-classifica">
            <thead>
              <tr><th className="sx" colSpan={2}>Squadra</th><th>G</th><th>DR</th><th>Pt</th></tr>
            </thead>
            <tbody>
              {classifica.map((r, i) => {
                const dr = r.gf - r.gs;
                return (
                  <tr key={r.id} className={`${zonaClassifica(i + 1, classifica.length)} ${r.utente ? "utente" : ""}`}>
                    <td className="sx pos">{i + 1}</td>
                    <td className="sx"><span className="nome-sq"><span className="pallino" style={{ background: r.colore }} />{r.nome}</span></td>
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
            {allenatore && (<div className="all-caption"><span className="ac-l">Allenatore</span><span className="ac-v">{allenatore.nome} {allenatore.cognome}</span></div>)}
            {capitanoNome && (<div className="all-caption"><span className="ac-l">Capitano</span><span className="ac-v">{capitanoNome}</span></div>)}
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
              <div className="stat"><span className="stat-v">{mia.gf - mia.gs > 0 ? `+${mia.gf - mia.gs}` : mia.gf - mia.gs}</span><span className="stat-l">Diff. reti</span></div>
            </div>
            <ul className="andamento-extra">
              {migliore && (<li><span className="ae-l">Miglior vittoria</span><span className="ae-v">{migliore.pro}–{migliore.contro} <em>vs {migliore.avversario}</em></span></li>)}
              {peggiore && (<li><span className="ae-l">Peggior sconfitta</span><span className="ae-v">{peggiore.pro}–{peggiore.contro} <em>vs {peggiore.avversario}</em></span></li>)}
            </ul>
          </section>
        </aside>
      </div>

      <div className="spread">
        {marcatori.length > 0 && tabellaBomber(marcatori, "gol", "Classifica marcatori")}
        {assist.length > 0 && tabellaBomber(assist, "assist", "Classifica assist")}
      </div>

      <section className="card">
        <button className="sezione-toggle" onClick={() => setPartiteAperte((x) => !x)} aria-expanded={partiteAperte}>
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

      {/* Solo a fine partita, dopo tutti i contenuti: l'utente ha finito di
          leggere il recap, nessun pulsante interattivo nelle vicinanze. */}
      <AdSlot slot="8853641825" />

      <div className="azione-fissa">
        <button className="btn" onClick={onRicomincia}>Gioca ancora</button>
      </div>
    </div>
  );
}
