// Formazione che si compone durante il draft: mostra gli 11 titolari (nelle
// posizioni del modulo scelto) + i 7 panchinari + l'allenatore. Gli slot già
// scelti mostrano il COGNOME (mai l'overall, nascosto fino al reveal). Gli
// slot ancora liberi il cui ruolo è tra i candidati proposti in quel
// momento pulsano (indicano dove potrebbe atterrare la scelta).

import { macroRuolo } from "@/logica/formazione";

function stato(indice, pick, slotEvidenziati) {
  if (pick) return "pieno";
  if (slotEvidenziati && slotEvidenziati.has(indice)) return "corrente";
  return "vuoto";
}

export default function FormazioneDraft({
  slot,
  picks,
  slotEvidenziati,
  allenatore,
  faseAllenatore,
}) {
  const cognome = (p) => p.giocatore.cognome || p.giocatore.nome;
  const titolari = slot.filter((s) => s.tipo === "titolare");
  const panchina = slot.filter((s) => s.tipo === "panchina");

  return (
    <div className="formazione-draft">
      <div className="campo campo-costruzione">
        {titolari.map((s) => {
          const pick = picks[s.indice];
          const st = stato(s.indice, pick, slotEvidenziati);
          return (
            <div
              key={s.indice}
              className={`slot-pos slot-${st}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <span className="slot-disc">{macroRuolo(s.ruolo)}</span>
              {pick && <span className="slot-lbl">{cognome(pick)}</span>}
            </div>
          );
        })}
      </div>

      <div className="riserve-draft">
        <div className="rd-fila">
          <span className="rd-tit">Panchina</span>
          <div className="rd-slots">
            {panchina.map((s) => {
              const pick = picks[s.indice];
              const st = stato(s.indice, pick, slotEvidenziati);
              return (
                <div key={s.indice} className={`rd-chip slot-${st}`}>
                  <span className="slot-disc">{s.ruolo}</span>
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
              {allenatore && <span className="rd-nome">{allenatore.cognome}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
