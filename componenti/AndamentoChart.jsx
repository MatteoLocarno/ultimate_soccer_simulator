// Grafico dell'andamento in classifica: posizione dell'utente per giornata.
// SVG vintage (1° in alto). Bande per zona Champions (1-4) e retrocessione
// (18-20).

const W = 620;
const H = 240;
const PAD = { t: 16, r: 14, b: 26, l: 30 };

export default function AndamentoChart({ andamento, nSquadre = 20 }) {
  if (!andamento || andamento.length === 0) return null;

  const nGiornate = andamento.length;
  const x = (g) =>
    PAD.l + ((g - 1) / (nGiornate - 1)) * (W - PAD.l - PAD.r);
  const y = (pos) =>
    PAD.t + ((pos - 1) / (nSquadre - 1)) * (H - PAD.t - PAD.b);

  const linea = andamento
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(d.g).toFixed(1)},${y(d.pos).toFixed(1)}`)
    .join(" ");

  const ultimo = andamento[andamento.length - 1];
  const righeY = [1, 5, 10, 15, 20];
  const giornateX = [1, 10, 19, 28, 38].filter((g) => g <= nGiornate);

  return (
    <svg
      className="andamento-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Grafico dell'andamento in classifica per giornata"
    >
      {/* bande zona Champions e retrocessione */}
      <rect x={PAD.l} y={y(1)} width={W - PAD.l - PAD.r} height={y(4) - y(1)} fill="#3f6b3a" opacity="0.14" />
      <rect x={PAD.l} y={y(18)} width={W - PAD.l - PAD.r} height={y(nSquadre) - y(18)} fill="#9c2a24" opacity="0.13" />

      {/* griglia orizzontale (posizioni) */}
      {righeY.map((pos) => (
        <g key={`r${pos}`}>
          <line x1={PAD.l} y1={y(pos)} x2={W - PAD.r} y2={y(pos)} stroke="#b5a274" strokeWidth="0.7" opacity="0.6" />
          <text x={PAD.l - 6} y={y(pos) + 3.5} textAnchor="end" className="ac-tick">{pos}°</text>
        </g>
      ))}

      {/* griglia verticale (giornate) */}
      {giornateX.map((g) => (
        <text key={`g${g}`} x={x(g)} y={H - 8} textAnchor="middle" className="ac-tick">{g}ª</text>
      ))}

      {/* linea dell'andamento */}
      <path d={linea} fill="none" stroke="#9c2a24" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

      {/* punto finale */}
      <circle cx={x(ultimo.g)} cy={y(ultimo.pos)} r="5" fill="#a8761a" stroke="#2d2417" strokeWidth="1.5" />
    </svg>
  );
}
