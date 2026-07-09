// Pallone di cuoio "storico" (a spicchi, con i lacci), disegnato in SVG per
// restare coerente con lo stile vintage del sito invece del solito emoji ⚽
// (che è un pallone moderno bianco/nero).
export default function PalloneStorico({ size = 34, className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="45" fill="#c9973e" stroke="#5c4425" strokeWidth="4" />
      <path d="M50 6 C 30 26, 30 74, 50 94" fill="none" stroke="#5c4425" strokeWidth="3" />
      <path d="M50 6 C 70 26, 70 74, 50 94" fill="none" stroke="#5c4425" strokeWidth="3" />
      <path d="M7 50 C 27 31, 73 31, 93 50" fill="none" stroke="#5c4425" strokeWidth="3" />
      <path d="M7 50 C 27 69, 73 69, 93 50" fill="none" stroke="#5c4425" strokeWidth="3" />
      <rect x="41" y="7" width="18" height="9" rx="2" fill="#5c4425" />
      <line x1="45" y1="9" x2="45" y2="14" stroke="#c9973e" strokeWidth="1.4" />
      <line x1="50" y1="9" x2="50" y2="14" stroke="#c9973e" strokeWidth="1.4" />
      <line x1="55" y1="9" x2="55" y2="14" stroke="#c9973e" strokeWidth="1.4" />
    </svg>
  );
}
