// Formazione che si compone durante il draft: mostra i 18 slot (11 in campo +
// 7 in panchina) e l'allenatore. Gli slot già scelti mostrano il COGNOME (mai
// l'overall, che resta nascosto fino al reveal). Lo slot in corso pulsa.

import { SLOT } from "@/logica/formazione";

// Posizioni in campo dei titolari (4-3-3), allineate agli indici 0..10 di SLOT.
const POS = [
  { x: 50, y: 88 }, // 0  P
  { x: 16, y: 69 }, // 1  D
  { x: 39, y: 71 }, // 2  D
  { x: 61, y: 71 }, // 3  D
  { x: 84, y: 69 }, // 4  D
  { x: 27, y: 48 }, // 5  C
  { x: 50, y: 50 }, // 6  C
  { x: 73, y: 48 }, // 7  C
  { x: 28, y: 22 }, // 8  A
  { x: 50, y: 19 }, // 9  A
  { x: 72, y: 22 }, // 10 A
];

function stato(indice, pick, slotCorrente) {
  if (pick) return "pieno";
  if (indice === slotCorrente) return "corrente";
  return "vuoto";
}

export default function FormazioneDraft({
  picks,
  slotCorrente,
  allenatore,
  faseAllenatore,
}) {
  const cognome = (p) => p.giocatore.cognome || p.giocatore.nome;

  return (
    <div className="formazione-draft">
      <div className="campo campo-costruzione">
        {POS.map((pos, i) => {
          const pick = picks[i];
          const st = stato(i, pick, slotCorrente);
          return (
            <div
              key={i}
              className={`slot-pos slot-${st}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span className="slot-disc">{SLOT[i].ruolo}</span>
              {pick && <span className="slot-lbl">{cognome(pick)}</span>}
            </div>
          );
        })}
      </div>

      <div className="riserve-draft">
        <div className="rd-fila">
          <span className="rd-tit">Panchina</span>
          <div className="rd-slots">
            {SLOT.slice(11).map((slot, k) => {
              const i = 11 + k;
              const pick = picks[i];
              const st = stato(i, pick, slotCorrente);
              return (
                <div key={i} className={`rd-chip slot-${st}`}>
                  <span className="slot-disc">{slot.ruolo}</span>
                  {pick && <span className="rd-nome">{cognome(pick)}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rd-fila">
          <span className="rd-tit">Allenatore</span>
          <div className="rd-slots">
            <div
              className={`rd-chip allenatore ${
                allenatore ? "slot-pieno" : faseAllenatore ? "slot-corrente" : "slot-vuoto"
              }`}
            >
              <span className="slot-disc">All</span>
              {allenatore && (
                <span className="rd-nome">{allenatore.cognome}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
