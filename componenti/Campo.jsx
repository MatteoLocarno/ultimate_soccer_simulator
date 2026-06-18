// Campo da gioco: i titolari sono disposti nelle posizioni del modulo scelto
// (lette da pick.slot.x/y), con overall e, sul capitano, la fascia "C".

function classeOvr(overall) {
  if (overall >= 88) return "tok-ovr top";
  if (overall >= 82) return "tok-ovr alto";
  return "tok-ovr";
}

export default function Campo({ titolari, mini = false, capitanoId = null }) {
  return (
    <div className={`campo campo-schieramento${mini ? " campo-mini" : ""}`}>
      {titolari.map((p, i) => {
        const g = p.giocatore;
        const capitano = g._id === capitanoId;
        return (
          <div
            key={g._id}
            className="token"
            style={{
              left: `${p.slot.x}%`,
              top: `${p.slot.y}%`,
              animationDelay: `${i * 55}ms`,
            }}
          >
            <div className={classeOvr(g.overall)}>
              {g.overall}
              {capitano && <span className="fascia">C</span>}
            </div>
            <div className="tok-nome">{g.cognome || g.nome}</div>
          </div>
        );
      })}
    </div>
  );
}
