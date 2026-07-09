"use client";

import { useId } from "react";

// Pallone di cuoio "storico" (a spicchi, con i lacci e le cuciture), in SVG
// con un po' di ombreggiatura per un effetto cuoio più realistico, coerente
// con lo stile vintage del sito invece del solito emoji ⚽ (pallone moderno
// bianco/nero, piatto).
export default function PalloneStorico({ size = 34, className = "" }) {
  const id = useId();
  const gradiente = `pallone-cuoio-${id}`;
  const lucido = `pallone-lucido-${id}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradiente} cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#e3b567" />
          <stop offset="55%" stopColor="#c9973e" />
          <stop offset="100%" stopColor="#9a6f2b" />
        </radialGradient>
        <radialGradient id={lucido} cx="32%" cy="26%" r="22%">
          <stop offset="0%" stopColor="#fff3d6" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff3d6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="45" fill={`url(#${gradiente})`} stroke="#4a341a" strokeWidth="3.5" />

      {/* spicchi in stile "mappamondo", come i palloni di cuoio anni '30-'50 */}
      <path d="M50 6 C 30 26, 30 74, 50 94" fill="none" stroke="#4a341a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M50 6 C 70 26, 70 74, 50 94" fill="none" stroke="#4a341a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M7 50 C 27 31, 73 31, 93 50" fill="none" stroke="#4a341a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M7 50 C 27 69, 73 69, 93 50" fill="none" stroke="#4a341a" strokeWidth="2.6" strokeLinecap="round" />

      {/* piccole cuciture decorative lungo i due spicchi verticali */}
      <g stroke="#4a341a" strokeWidth="1" opacity="0.5">
        <line x1="34" y1="26" x2="38" y2="27" /> <line x1="34" y1="50" x2="39" y2="50" /> <line x1="34" y1="74" x2="38" y2="73" />
        <line x1="66" y1="26" x2="62" y2="27" /> <line x1="66" y1="50" x2="61" y2="50" /> <line x1="66" y1="74" x2="62" y2="73" />
      </g>

      {/* laccio */}
      <rect x="40" y="6" width="20" height="10" rx="2.5" fill="#4a341a" />
      <line x1="44" y1="8.5" x2="44" y2="13.5" stroke="#c9973e" strokeWidth="1.5" />
      <line x1="50" y1="8.5" x2="50" y2="13.5" stroke="#c9973e" strokeWidth="1.5" />
      <line x1="56" y1="8.5" x2="56" y2="13.5" stroke="#c9973e" strokeWidth="1.5" />

      {/* riflesso di luce, per un effetto cuoio meno piatto */}
      <circle cx="35" cy="30" r="16" fill={`url(#${lucido})`} />
    </svg>
  );
}
