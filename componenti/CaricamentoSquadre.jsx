"use client";

import { useEffect, useState } from "react";

// Curiosità di Serie A che ruotano durante il caricamento: tengono
// compagnia mentre si scaricano le squadre storiche (~15-20s).
const CURIOSITA = [
  "Nel 1986-87 Diego Maradona trascinò il Napoli al primo Scudetto della sua storia.",
  "Paolo Maldini ha giocato 25 stagioni nel Milan, tutte in Serie A, senza mai cambiare squadra.",
  "Il Verona vinse lo Scudetto 1984-85 con un monte ingaggi tra i più bassi del campionato.",
  "Francesco Totti ha segnato per la Roma in Serie A per 22 stagioni consecutive.",
  "Nella stagione 1999-2000 la Lazio di Eriksson vinse lo Scudetto all'ultima giornata.",
  "Gianluigi Buffon ha vestito la maglia della Nazionale in 5 diverse edizioni dei Mondiali.",
  "L'Hellas Verona 1984-85 è ancora oggi la squadra più \"a sorpresa\" a vincere lo Scudetto.",
  "Andrea Pirlo, scartato dal Milan nel 2011, vinse 4 Scudetti consecutivi con la Juventus.",
  "Il Grande Torino vinse 5 Scudetti consecutivi prima della tragedia di Superga nel 1949.",
  "Roberto Baggio è stato il primo calciatore a vincere il Pallone d'Oro giocando in Serie A con la Juventus.",
  "Il record di gol in una singola stagione di Serie A a 38 giornate appartiene a Higuaín: 36 gol nel 2015-16.",
  "Javier Zanetti ha giocato per un solo club, l'Inter, per 19 stagioni consecutive.",
  "Il Milan di Arrigo Sacchi (1988-89) è considerato una delle squadre più forti nella storia del calcio.",
  "Alessandro Del Piero ha segnato più di 200 gol in Serie A, tutti con la maglia della Juventus.",
  "Fabio Cannavaro è l'unico difensore ad aver vinto il Pallone d'Oro nel nuovo millennio.",
  "Il Napoli di Spalletti (2022-23) ha vinto lo Scudetto con 2 giornate di anticipo dopo 33 anni di attesa.",
  "Zlatan Ibrahimović ha vinto lo Scudetto con tre squadre diverse: Juventus, Inter e Milan.",
];

// Barra "a segmenti" in stile videogioco retrò, con avanzamento reale (non
// finto): riflette i blocchi di squadre effettivamente scaricati.
const SEGMENTI = 16;

export default function CaricamentoSquadre({ fatti = 0, totali = 0 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % CURIOSITA.length), 3400);
    return () => clearInterval(t);
  }, []);

  const percentuale = totali ? Math.min(100, Math.round((fatti / totali) * 100)) : 0;
  const segmentiPieni = Math.round((percentuale / 100) * SEGMENTI);

  return (
    <div className="attesa-squadre">
      <div className="attesa-occhiello">Stagione in preparazione</div>
      <h2 className="attesa-titolo">Apriamo l&apos;archivio storico…</h2>

      <div className="attesa-barra" role="progressbar" aria-valuenow={percentuale} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: SEGMENTI }).map((_, idx) => (
          <span key={idx} className={`attesa-segmento ${idx < segmentiPieni ? "pieno" : ""}`} />
        ))}
      </div>
      <div className="attesa-percentuale">{percentuale}%</div>

      <p key={i} className="attesa-curiosita">
        <span className="attesa-pallone">⚽</span> {CURIOSITA[i]}
      </p>
    </div>
  );
}
