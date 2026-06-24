// Anteprima in miniatura di un modulo: disegna i pallini dei titolari sulle
// loro posizioni in campo. Usata nel selettore di modulo (setup).

import { macroRuolo } from "@/logica/formazione";

const COLORE_RUOLO = {
  P: "#c2902a",
  D: "#f1e7ca",
  C: "#f1e7ca",
  A: "#f1e7ca",
};

export default function MiniModulo({ modulo }) {
  return (
    <svg className="mini-modulo" viewBox="0 0 100 100" aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="4"
        fill="#46663b"
        stroke="#2f4a28"
        strokeWidth="2"
      />
      <line x1="2" y1="50" x2="98" y2="50" stroke="#f3ecd2" strokeWidth="0.7" opacity="0.4" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="#f3ecd2" strokeWidth="0.7" opacity="0.4" />
      {modulo.posizioni.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r="4.6"
          fill={COLORE_RUOLO[macroRuolo(pos.ruolo)] || "#f1e7ca"}
          stroke="#2d2417"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
