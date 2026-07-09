import { forzaUtente } from "@/logica/simulazione";
import Campo from "@/componenti/Campo";

const ORDINE_RUOLI = ["P", "D", "C", "A"];

// Classe CSS in base alla qualità dell'overall (per evidenziare i fuoriclasse).
function classeOvr(overall) {
  if (overall >= 88) return "ovr top";
  if (overall >= 82) return "ovr alto";
  return "ovr";
}

// Schermata di riepilogo: rivela gli overall, mostra il campo, l'allenatore e
// la forza complessiva.
export default function SchermataRosa({
  rosa,
  allenatore,
  capitano,
  modulo,
  onSimula,
}) {
  const forza = Math.round(forzaUtente(rosa, allenatore) * 10) / 10;

  const titolari = rosa.filter((p) => p.slot.tipo === "titolare");
  const panchina = rosa.filter((p) => p.slot.tipo === "panchina");

  function gruppoPerRuolo(elenco) {
    return ORDINE_RUOLI.map((ruolo) => ({
      ruolo,
      giocatori: elenco.filter((p) => p.slot.ruolo === ruolo),
    })).filter((g) => g.giocatori.length > 0);
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
          <div className="etichetta-sub">11 titolari + allenatore</div>
        </div>
        <div className="valore">{forza}</div>
      </div>

      {allenatore && (
        <div className="card allenatore-card">
          <div className={classeOvr(allenatore.overall)}>
            {allenatore.overall}
          </div>
          <div className="info">
            <div className="nome-g">
              {allenatore.nome} {allenatore.cognome}
            </div>
            <div className="prov">Allenatore</div>
          </div>
        </div>
      )}

      <h3 className="reparto-modulo">
        Formazione <span>{modulo?.nome}</span>
      </h3>
      <Campo titolari={titolari} capitanoId={capitano} />

      {panchina.length > 0 && (
        <section className="reparto reparto-panchina">
          <h3>Panchina</h3>
          {gruppoPerRuolo(panchina).map((g) => (
            <div key={g.ruolo}>
              {g.giocatori.map((p, i) => (
                <div className="riga-giocatore panchina" key={`p-${g.ruolo}-${i}`}>
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
              ))}
            </div>
          ))}
        </section>
      )}

      <div className="azione-fissa">
        <button className="btn" onClick={onSimula}>
          Simula la Stagione
        </button>
      </div>
    </div>
  );
}
