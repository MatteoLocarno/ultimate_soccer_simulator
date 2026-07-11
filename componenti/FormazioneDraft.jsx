// Formazione che si compone durante il draft: mostra gli 11 titolari (nelle
// posizioni del modulo scelto, panchina rimossa per ora) + l'allenatore. Gli
// slot già scelti mostrano il COGNOME (mai l'overall, nascosto fino al
// reveal). Gli slot ancora liberi il cui ruolo è tra i candidati proposti in
// quel momento pulsano (indicano dove potrebbe atterrare la scelta). Il
// ruolo sul pallino è quello DETTAGLIATO: dello slot se ancora vuoto, del
// giocatore scelto se occupato (un ED finito in uno slot CC per mancanza di
// alternative va mostrato come ED, non come CC).

function stato(indice, pick, slotEvidenziati) {
  if (pick) return "pieno";
  if (slotEvidenziati && slotEvidenziati.has(indice)) return "corrente";
  return "vuoto";
}

export default function FormazioneDraft({
  slot,
  picks,
  slotEvidenziati,
  slotPiazzabili,
  onPiazza,
  allenatore,
  faseAllenatore,
}) {
  const cognome = (p) => p.giocatore.cognome || p.giocatore.nome;
  const titolari = slot.filter((s) => s.tipo === "titolare");
  const panchina = slot.filter((s) => s.tipo === "panchina");
  const inPiazzamento = !!(slotPiazzabili && slotPiazzabili.size);

  return (
    <div className={`formazione-draft ${inPiazzamento ? "in-piazzamento" : ""}`}>
      <div className="campo campo-costruzione">
        {titolari.map((s) => {
          const pick = picks[s.indice];
          const st = stato(s.indice, pick, slotEvidenziati);
          const piazzabile = !pick && slotPiazzabili && slotPiazzabili.has(s.indice);
          return (
            <div
              key={s.indice}
              className={`slot-pos slot-${st} ${piazzabile ? "slot-piazzabile" : ""}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              role={piazzabile ? "button" : undefined}
              tabIndex={piazzabile ? 0 : undefined}
              onClick={piazzabile ? () => onPiazza(s.indice) : undefined}
              onKeyDown={
                piazzabile
                  ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPiazza(s.indice); } }
                  : undefined
              }
            >
              <span className="slot-disc">{pick ? pick.giocatore.ruolo : s.ruolo}</span>
              {pick && <span className="slot-lbl">{cognome(pick)}</span>}
              {piazzabile && <span className="slot-piazza-piu">＋</span>}
            </div>
          );
        })}
      </div>

      <div className="riserve-draft">
        {panchina.length > 0 && (
          <div className="rd-fila">
            <span className="rd-tit">Panchina</span>
            <div className="rd-slots">
              {panchina.map((s) => {
                const pick = picks[s.indice];
                const st = stato(s.indice, pick, slotEvidenziati);
                return (
                  <div key={s.indice} className={`rd-chip slot-${st}`}>
                    <span className="slot-disc">{pick ? pick.giocatore.ruolo : s.ruolo}</span>
                    {pick && <span className="rd-nome">{cognome(pick)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
