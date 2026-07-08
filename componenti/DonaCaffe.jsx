"use client";

import { useEffect, useState } from "react";

// Leggende italiane storiche: il nome ruota con effetto blur.
const LEGGENDE = [
  "Maldini", "Del Piero", "Totti", "Pirlo", "Baggio",
  "Buffon", "Baresi", "Cannavaro", "Nesta", "Zola",
];

// TODO: sostituire con il link reale della raccolta GoFundMe quando pronto.
const LINK_DONAZIONE = "https://www.gofundme.com/";

// Pillola "offrici un caffè". className distingue la collocazione:
//  - "dona-fissa"  → in alto a destra, fissa (desktop, su ogni schermo)
//  - "dona-inline" → nel flusso, tra stemma e titolo (mobile, in home)
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
