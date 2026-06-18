import { NOMI_RUOLO_PLURALE } from "@/logica/formazione";
import { forzaUtente } from "@/logica/simulazione";

const ORDINE_RUOLI = ["P", "D", "C", "A"];

// Classe CSS in base alla qualità dell'overall (per evidenziare i fuoriclasse).
function classeOvr(overall) {
  if (overall >= 88) return "ovr top";
  if (overall >= 82) return "ovr alto";
  return "ovr";
}

// Schermata di riepilogo: rivela gli overall e mostra forza complessiva.
export default function SchermataRosa({ rosa, onSimula }) {
  const forza = Math.round(forzaUtente(rosa) * 10) / 10;

  const titolari = rosa.filter((p) => p.slot.tipo === "titolare");
  const panchina = rosa.filter((p) => p.slot.tipo === "panchina");

  function gruppoPerRuolo(elenco) {
    return ORDINE_RUOLI.map((ruolo) => ({
      ruolo,
      giocatori: elenco.filter((p) => p.slot.ruolo === ruolo),
    })).filter((g) => g.giocatori.length > 0);
  }

  function rigaGiocatore(p, i, panchina = false) {
    return (
      <div className={`riga-giocatore ${panchina ? "panchina" : ""}`} key={i}>
        <div className={classeOvr(p.giocatore.overall)}>
          {p.giocatore.overall}
        </div>
        <div className="info">
          <div className="nome-g">
            {p.giocatore.nome} {p.giocatore.cognome}
          </div>
          <div className="prov">
            {p.provenienza.squadra} · {p.provenienza.anno}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rosa">
      <header className="intestazione">
        <div className="logo">La tua rosa</div>
        <h1>Reveal degli overall</h1>
      </header>

      <div className="card riepilogo-forza">
        <div>
          <div className="etichetta">Forza della squadra</div>
          <div style={{ fontSize: 12, color: "var(--testo-soft)" }}>
            media degli 11 titolari
          </div>
        </div>
        <div className="valore">{forza}</div>
      </div>

      <section className="reparto">
        <h3>Titolari · 4-3-3</h3>
        {gruppoPerRuolo(titolari).map((g) => (
          <div key={g.ruolo}>
            {g.giocatori.map((p, i) => rigaGiocatore(p, `t-${g.ruolo}-${i}`))}
          </div>
        ))}
      </section>

      <section className="reparto">
        <h3>Panchina</h3>
        {gruppoPerRuolo(panchina).map((g) => (
          <div key={g.ruolo}>
            {g.giocatori.map((p, i) =>
              rigaGiocatore(p, `p-${g.ruolo}-${i}`, true)
            )}
          </div>
        ))}
      </section>

      <div className="azione-fissa">
        <button className="btn" onClick={onSimula}>
          Simula la Stagione
        </button>
      </div>
    </div>
  );
}
