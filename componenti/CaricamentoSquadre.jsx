"use client";

import { useEffect, useMemo, useState } from "react";

// Curiosità di Serie A che ruotano durante il caricamento, in stile
// "figurina Panini": tengono compagnia mentre si scaricano le squadre
// storiche (~15-20s). Alcune hanno una foto vera (da Wikimedia Commons,
// licenza libera), le altre un'icona a tema.
const CURIOSITA = [
  {
    testo: "Paolo Maldini ha giocato 25 stagioni nel Milan, tutte in Serie A, senza mai cambiare squadra.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Paolo_Maldini_AC_Milan_Technical_director_2018.jpg/250px-Paolo_Maldini_AC_Milan_Technical_director_2018.jpg",
    alt: "Paolo Maldini",
  },
  {
    testo: "Francesco Totti ha segnato per la Roma in Serie A per 22 stagioni consecutive.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/KL-2018_%284%29.jpg/250px-KL-2018_%284%29.jpg",
    alt: "Francesco Totti",
  },
  {
    testo: "Nel 1986-87 Diego Maradona trascinò il Napoli al primo Scudetto della sua storia.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Argentina_celebrando_copa_%28cropped%29.jpg/250px-Argentina_celebrando_copa_%28cropped%29.jpg",
    alt: "Diego Maradona",
  },
  {
    testo: "Gianluigi Buffon ha vestito la maglia della Nazionale in 5 diverse edizioni dei Mondiali.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Norway_Italy_-_June_2025_A_44_%28Gianluigi_Buffon%29.jpg/250px-Norway_Italy_-_June_2025_A_44_%28Gianluigi_Buffon%29.jpg",
    alt: "Gianluigi Buffon",
  },
  {
    testo: "Andrea Pirlo, scartato dal Milan nel 2011, vinse 4 Scudetti consecutivi con la Juventus.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/20150616_-_Portugal_-_Italie_-_Gen%C3%A8ve_-_Andrea_Pirlo_%28cropped%29.jpg/250px-20150616_-_Portugal_-_Italie_-_Gen%C3%A8ve_-_Andrea_Pirlo_%28cropped%29.jpg",
    alt: "Andrea Pirlo",
  },
  {
    testo: "Alessandro Del Piero ha segnato più di 200 gol in Serie A, tutti con la maglia della Juventus.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/25th_Laureus_World_Sports_Awards_-_Alessandro_Del_Piero_-_240421_155220_%28cropped%29.jpg/250px-25th_Laureus_World_Sports_Awards_-_Alessandro_Del_Piero_-_240421_155220_%28cropped%29.jpg",
    alt: "Alessandro Del Piero",
  },
  {
    testo: "Roberto Baggio è stato il primo calciatore a vincere il Pallone d'Oro giocando in Serie A con la Juventus.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/%D8%B1%D9%88%D8%A8%D8%B1%D8%AA%D9%88_%D8%A8%D8%A7%D8%AC%D9%88_%28cropped%29.jpg/250px-%D8%B1%D9%88%D8%A8%D8%B1%D8%AA%D9%88_%D8%A8%D8%A7%D8%AC%D9%88_%28cropped%29.jpg",
    alt: "Roberto Baggio",
  },
  {
    testo: "Fabio Cannavaro è l'unico difensore ad aver vinto il Pallone d'Oro nel nuovo millennio.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Fabio_Cannavaro_2011.jpg/250px-Fabio_Cannavaro_2011.jpg",
    alt: "Fabio Cannavaro",
  },
  {
    testo: "Javier Zanetti ha giocato per un solo club, l'Inter, per 19 stagioni consecutive.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Metalist-Inter_%282%29.jpg/250px-Metalist-Inter_%282%29.jpg",
    alt: "Javier Zanetti",
  },
  {
    testo: "Zlatan Ibrahimović ha vinto lo Scudetto con tre squadre diverse: Juventus, Inter e Milan.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Zlatan_Ibrahimovi%C4%87_June_2018.jpg/250px-Zlatan_Ibrahimovi%C4%87_June_2018.jpg",
    alt: "Zlatan Ibrahimović",
  },
  { testo: "Il Verona vinse lo Scudetto 1984-85 con un monte ingaggi tra i più bassi del campionato.", icona: "🐝" },
  { testo: "Nella stagione 1999-2000 la Lazio di Eriksson vinse lo Scudetto all'ultima giornata.", icona: "🦅" },
  { testo: "L'Hellas Verona 1984-85 è ancora oggi la squadra più \"a sorpresa\" a vincere lo Scudetto.", icona: "🐝" },
  { testo: "Il Grande Torino vinse 5 Scudetti consecutivi prima della tragedia di Superga nel 1949.", icona: "🐂" },
  { testo: "Il record di gol in una singola stagione di Serie A a 38 giornate appartiene a Higuaín: 36 gol nel 2015-16.", icona: "🎯" },
  { testo: "Il Milan di Arrigo Sacchi (1988-89) è considerato una delle squadre più forti nella storia del calcio.", icona: "🏆" },
  { testo: "Il Napoli di Spalletti (2022-23) ha vinto lo Scudetto con 2 giornate di anticipo dopo 33 anni di attesa.", icona: "🌋" },
  { testo: "Il Milan ha vinto 7 Coppe dei Campioni/Champions League: nessun altro club italiano ne ha vinte tante.", icona: "⭐" },
  { testo: "La Juventus è il club più titolato d'Italia, con oltre 36 trofei tra Scudetti e Coppe Italia.", icona: "⚪⚫" },
  { testo: "Il derby della Madonnina tra Milan e Inter è uno dei derby più sentiti al mondo.", icona: "🔵🔴" },
  { testo: "La Fiorentina ha vinto il suo ultimo Scudetto nella stagione 1968-69.", icona: "🌸" },
  { testo: "Il Bologna vinse 7 Scudetti tra il 1925 e il 1964, un'epoca d'oro per i rossoblù.", icona: "🎖️" },
  { testo: "Il Cagliari di Gigi Riva vinse il suo unico Scudetto nel 1969-70.", icona: "🐎" },
  { testo: "Silvio Piola è ancora oggi il miglior marcatore nella storia della Serie A, con oltre 270 gol.", icona: "👑" },
  { testo: "La Sampdoria vinse il suo unico Scudetto nel 1990-91, con Vialli e Mancini in attacco.", icona: "🔱" },
  { testo: "La Roma vinse lo Scudetto nel 1941-42 e dovette aspettare fino al 1982-83 per il secondo.", icona: "🐺" },
  { testo: "L'Inter di Mourinho nel 2009-10 vinse il Triplete: Scudetto, Coppa Italia e Champions League.", icona: "🏆" },
  { testo: "Il record di punti in una Serie A a 38 giornate è della Juventus di Conte: 102 punti nel 2013-14.", icona: "📈" },
  { testo: "George Weah è l'unico calciatore del Milan ad aver vinto il Pallone d'Oro, nel 1995.", icona: "🌍" },
  { testo: "Il Genoa, fondato nel 1893, è il club più antico d'Italia ancora attivo.", icona: "🏛️" },
].map((c, i) => ({ ...c, chiave: i }));

// Mescolamento Fisher-Yates: ordine diverso ad ogni caricamento, invece
// del solito giro fisso.
function mescola(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Barra "a segmenti" in stile videogioco retrò, con avanzamento reale (non
// finto): riflette i blocchi di squadre effettivamente scaricati.
const SEGMENTI = 16;

export default function CaricamentoSquadre({ fatti = 0, totali = 0 }) {
  const ordine = useMemo(() => mescola(CURIOSITA), []);
  const [i, setI] = useState(0);
  const [fotoRotte, setFotoRotte] = useState(() => new Set());

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % ordine.length), 3800);
    return () => clearInterval(t);
  }, [ordine]);

  const percentuale = totali ? Math.min(100, Math.round((fatti / totali) * 100)) : 0;
  const segmentiPieni = Math.round((percentuale / 100) * SEGMENTI);
  const curiosita = ordine[i];

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

      <div key={curiosita.chiave} className="attesa-figurina">
        <div className="attesa-figurina-foto">
          {curiosita.img && !fotoRotte.has(curiosita.chiave) ? (
            <img
              src={curiosita.img}
              alt={curiosita.alt}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFotoRotte((s) => new Set(s).add(curiosita.chiave))}
            />
          ) : (
            <span className="attesa-figurina-icona">{curiosita.icona || "⚽"}</span>
          )}
        </div>
        <p className="attesa-figurina-testo">{curiosita.testo}</p>
      </div>
    </div>
  );
}
