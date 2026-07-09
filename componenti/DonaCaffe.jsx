"use client";

import { useEffect, useState } from "react";

// Leggende italiane storiche: il nome ruota con effetto blur.
const LEGGENDE = [
  "Maldini", "Del Piero", "Totti", "Pirlo", "Baggio",
  "Buffon", "Baresi", "Cannavaro", "Nesta", "Zola",
];

const LINK_DONAZIONE = "https://gofund.me/d8fbfea23";

// Pillola "offrici un caffè": fissa in alto a destra su ogni schermo
// (className "dona-fissa", vedi app/layout.js). Fuori dal flusso del
// documento apposta, così non sposta mai nient'altro nel layout.
export default function DonaCaffe({ className = "" }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % LEGGENDE.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <a
      className={`dona-caffe ${className}`}
      href={LINK_DONAZIONE}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ehi <span key={i} className="dona-nome">{LEGGENDE[i]}</span>, donaci un
      caffè ☕ 1€
    </a>
  );
}
