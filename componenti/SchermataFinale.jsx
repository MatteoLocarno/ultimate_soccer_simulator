"use client";

import { useState } from "react";
import Stemma from "@/componenti/Stemma";
import { scaricaDinastiaPng } from "@/logica/immagineFormazione";

// Somma i valori (gol/assist) per persona su tutte le stagioni e ritorna il
// migliore ({ nome, cognome, valore }) oppure null.
function migliorePer(storico, campo, chiave) {
  const mappa = new Map();
  for (const s of storico) {
    for (const p of s[campo] || []) {
      const k = `${p.nome}|${p.cognome}`;
      const e = mappa.get(k) || { nome: p.nome, cognome: p.cognome, valore: 0 };
      e.valore += Number(p[chiave]) || 0;
      mappa.set(k, e);
    }
  }
  let best = null;
  for (const e of mappa.values()) if (e.valore > 0 && (!best || e.valore > best.valore)) best = e;
  return best;
}

const ordinale = (p) => `${p}°`;
function titoloVerdetto(scudetti, miglior) {
  if (scudetti >= 3) return "Dinastia leggendaria";
  if (scudetti >= 1) return scudetti === 1 ? "Campioni d'Italia" : `${scudetti} volte Campioni`;
  if (miglior && miglior <= 4) return "Ai vertici d'Europa";
  if (miglior && miglior <= 10) return "Onesta metà classifica";
  return "La dinastia continua";
}

export default function SchermataFinale({ storico, rosa, allenatore, nomeSquadra, onMenu }) {
  const [statoPng, setStatoPng] = useState("idle");

  const stagioni = storico.length;
  const scudetti = storico.filter((s) => s.scudetto).length;
  const migliorPiazz = storico.reduce((m, s) => Math.min(m, s.posizione), Infinity);
  const puntiTotali = storico.reduce((t, s) => t + (s.punti || 0), 0);
  const bomber = migliorePer(storico, "marcatori", "gol");
  const assistman = migliorePer(storico, "assist", "assist");
  const perStagione = [...storico].sort((a, b) => a.stagione - b.stagione);

  const datiPng = { nomeSquadra, stagioni, scudetti, migliorPiazz, puntiTotali, bomber, assistman, allenatore, perStagione };

  async function scarica() {
    if (statoPng === "creazione") return;
    setStatoPng("creazione");
    try {
      const ok = await scaricaDinastiaPng(datiPng);
      setStatoPng(ok ? "idle" : "errore");
    } catch {
      setStatoPng("errore");
    }
  }

  return (
    <div className="finale">
      <header className="intestazione">
        <div className="logo">Bilancio</div>
        <h1>La tua dinastia</h1>
      </header>

      <div className={`verdetto ${scudetti > 0 ? "scudetto" : ""}`}>
        {scudetti > 0 && <Stemma size={84} className="verdetto-stemma" />}
        <div className="titolo">{titoloVerdetto(scudetti, migliorPiazz)}</div>
        <div className="sottotitolo">{nomeSquadra} — {stagioni} stagioni di storia</div>
        {scudetti > 0 && (
          <div className="trofei">
            {Array.from({ length: scudetti }).map((_, i) => <Stemma key={i} size={34} />)}
          </div>
        )}
      </div>

      <div className="stat-griglia finale-stat">
        <div className="stat"><span className="stat-v">{stagioni}</span><span className="stat-l">Stagioni</span></div>
        <div className="stat"><span className="stat-v">{scudetti}</span><span className="stat-l">Scudetti</span></div>
        <div className="stat"><span className="stat-v">{Number.isFinite(migliorPiazz) ? ordinale(migliorPiazz) : "—"}</span><span className="stat-l">Miglior piazz.</span></div>
        <div className="stat"><span className="stat-v">{puntiTotali}</span><span className="stat-l">Punti totali</span></div>
      </div>

      <div className="finale-mvp">
        <div className="mvp-card">
          <div className="mvp-etichetta">⚽ Capocannoniere</div>
          {bomber ? (
            <><div className="mvp-nome">{bomber.nome} {bomber.cognome}</div><div className="mvp-val">{bomber.valore} gol</div></>
          ) : (<div className="mvp-nome muto">Nessun gol registrato</div>)}
        </div>
        <div className="mvp-card">
          <div className="mvp-etichetta">🎯 Assistman</div>
          {assistman ? (
            <><div className="mvp-nome">{assistman.nome} {assistman.cognome}</div><div className="mvp-val">{assistman.valore} assist</div></>
          ) : (<div className="mvp-nome muto">Nessun assist registrato</div>)}
        </div>
      </div>

      <section className="card">
        <h2 className="sezione-titolo">Stagione per stagione</h2>
        <table className="tab-classifica">
          <thead>
            <tr><th className="sx">Stagione</th><th>Pos.</th><th>Pt</th><th>Esito</th></tr>
          </thead>
          <tbody>
            {perStagione.map((s) => (
              <tr key={s.stagione} className={s.scudetto ? "utente" : ""}>
                <td className="sx">Stagione {s.stagione}</td>
                <td>{ordinale(s.posizione)}</td>
                <td className="pt">{s.punti}</td>
                <td>{s.scudetto ? "🏆 Scudetto" : s.posizione <= 4 ? "Champions" : s.posizione <= 6 ? "Europa" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="condividi-formazione">
        <button className="btn-condividi" onClick={scarica} disabled={statoPng === "creazione"}>
          {statoPng === "creazione" ? "Creazione immagine…" : "📸 Scarica il bilancio"}
        </button>
        <p className="condividi-nota">
          {statoPng === "errore"
            ? "Non è stato possibile creare l'immagine. Riprova."
            : "Immagine della tua dinastia con scudetti, migliori e rimando al sito."}
        </p>
      </div>

      <div className="azione-fissa">
        <button className="btn" onClick={onMenu}>Menu principale</button>
      </div>
    </div>
  );
}
