// Dado 3x3 con i pallini (pips). `rolling` attiva l'animazione di lancio;
// `valore` (1-6) decide la faccia mostrata. Puramente estetico.
const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function Dado({ valore = 6, rolling = false, size = 64 }) {
  const attivi = PIPS[valore] || PIPS[6];
  return (
    <div className={`dado ${rolling ? "rolling" : ""}`} style={{ width: size, height: size }}>
      <div className="dado-facce">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={`pip ${attivi.includes(i) ? "on" : ""}`} />
        ))}
      </div>
    </div>
  );
}
