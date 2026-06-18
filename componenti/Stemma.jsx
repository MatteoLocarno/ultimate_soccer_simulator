// Stemma "Dinastia Scudetto": scudo tricolore (lo scudetto) sormontato da tre
// stelle dorate (la dinastia = più titoli). SVG disegnato a mano, in stile
// vintage. Riusato in home, verdetto scudetto e favicon.

// Genera il path di una stella a 5 punte centrata in (cx, cy) con raggio R.
function stella(cx, cy, R) {
  const r = R * 0.42;
  const punti = [];
  for (let i = 0; i < 5; i++) {
    const ao = ((-90 + i * 72) * Math.PI) / 180;
    const ai = ((-90 + 36 + i * 72) * Math.PI) / 180;
    punti.push(`${(cx + R * Math.cos(ao)).toFixed(2)},${(cy + R * Math.sin(ao)).toFixed(2)}`);
    punti.push(`${(cx + r * Math.cos(ai)).toFixed(2)},${(cy + r * Math.sin(ai)).toFixed(2)}`);
  }
  return "M" + punti.join(" L") + " Z";
}

// Profilo dello scudo (heater shield).
const SCUDO = "M16,26 H84 V62 C84,90 68,108 50,118 C32,108 16,90 16,62 Z";

export default function Stemma({ size = 120, className = "" }) {
  return (
    <svg
      className={className}
      height={size}
      width={(size * 100) / 124}
      viewBox="0 0 100 124"
      role="img"
      aria-label="Stemma Dinastia Scudetto"
    >
      <defs>
        <clipPath id="ritaglioScudo">
          <path d={SCUDO} />
        </clipPath>
      </defs>

      {/* tre stelle dorate sopra lo scudo */}
      <g fill="#c2902a" stroke="#6e4d10" strokeWidth="0.8" strokeLinejoin="round">
        <path d={stella(26, 15, 7.5)} />
        <path d={stella(50, 10, 9)} />
        <path d={stella(74, 15, 7.5)} />
      </g>

      {/* bande tricolore ritagliate sullo scudo */}
      <g clipPath="url(#ritaglioScudo)">
        <rect x="16" y="24" width="22.7" height="96" fill="#3f6b3a" />
        <rect x="38.7" y="24" width="22.7" height="96" fill="#efe4c4" />
        <rect x="61.3" y="24" width="22.7" height="96" fill="#9c2a24" />
      </g>

      {/* bordo doppio dello scudo */}
      <path d={SCUDO} fill="none" stroke="#2d2417" strokeWidth="4" strokeLinejoin="round" />
      <path d={SCUDO} fill="none" stroke="#d9c79a" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
