"use client";

import { useEffect, useState } from "react";

// Leggende italiane storiche: il nome ruota con effetto blur.
const LEGGENDE = [
  "Maldini", "Del Piero", "Totti", "Pirlo", "Baggio",
  "Buffon", "Baresi", "Cannavaro", "Nesta", "Zola",
];

// TODO: sostituire con il link reale della raccolta GoFundMe quando pronto.
const LINK_DONAZIONE = "https://www.gofundme.com/";

// Pillola "offrici un caffè" in alto a destra, mostrata solo in home.
export default function DonaCaffe() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % LEGGENDE.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <a
      className="dona-caffe"
      href={LINK_DONAZIONE}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ehi <span key={i} className="dona-nome">{LEGGENDE[i]}</span>, donaci un
      caffè ☕ 1€
    </a>
  );
}
