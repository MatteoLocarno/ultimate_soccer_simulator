"use client";

import { useId } from "react";

// Pallone di cuoio "storico" (spicchi cuciti + toppa allacciata), ispirato
// ai veri palloni da calcio in cuoio anni '30-'50: tinta calda e
// disomogenea (il cuoio invecchiato non è mai uniforme), spicchi ben
// visibili, toppa centrale allacciata con i lacci incrociati. In SVG,
// coerente con lo stile "figurina" vintage del sito invece del solito
// emoji ⚽ (pallone moderno bianco/nero, piatto).
export default function PalloneStorico({ size = 34, className = "" }) {
  const id = useId();
  const base = `pallone-base-${id}`;
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
        <radialGradient id={base} cx="36%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#d9a25a" />
          <stop offset="45%" stopColor="#b87f3a" />
          <stop offset="80%" stopColor="#8f5f28" />
          <stop offset="100%" stopColor="#6e481d" />
        </radialGradient>
        <radialGradient id={lucido} cx="30%" cy="24%" r="20%">
          <stop offset="0%" stopColor="#fbe3ab" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fbe3ab" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="45" fill={`url(#${base})`} stroke="#432c12" strokeWidth="3.5" />

      {/* macchie di cuoio invecchiato, disomogeneo come nel vero cuoio */}
      <g opacity="0.28" fill="#432c12">
        <ellipse cx="66" cy="68" rx="16" ry="12" />
        <ellipse cx="28" cy="62" rx="10" ry="8" />
        <ellipse cx="70" cy="30" rx="8" ry="6" />
      </g>

      {/* spicchi: 6 meridiani che convergono ai due poli, come un vero
          pallone a 18 pannelli */}
      <g fill="none" stroke="#432c12" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        <path d="M50 5 C 38 24, 38 76, 50 95" />
        <path d="M50 5 C 62 24, 62 76, 50 95" />
        <path d="M50 5 C 22 22, 20 55, 32 82" />
        <path d="M50 5 C 78 22, 80 55, 68 82" />
        <path d="M6 48 C 26 30, 74 30, 94 48" />
        <path d="M6 55 C 26 73, 74 73, 94 55" />
      </g>

      {/* toppa centrale allacciata */}
      <rect x="32" y="42" width="36" height="17" rx="2.5" fill="#432c12" stroke="#2c1c0c" strokeWidth="1" />
      <g stroke="#c9973e" strokeWidth="1.6" opacity="0.9">
        <line x1="37" y1="45" x2="63" y2="45" />
        <line x1="37" y1="49.5" x2="63" y2="49.5" />
        <line x1="37" y1="54" x2="63" y2="54" />
      </g>
      {[38, 44, 50, 56, 62].map((x) => (
        <line key={x} x1={x} y1="43" x2={x} y2="58" stroke="#2c1c0c" strokeWidth="1.1" opacity="0.7" />
      ))}
      <circle cx="50" cy="50.5" r="1.6" fill="#1e130a" />

      {/* riflesso di luce, per un effetto cuoio meno piatto */}
      <circle cx="34" cy="28" r="15" fill={`url(#${lucido})`} />
    </svg>
  );
}
