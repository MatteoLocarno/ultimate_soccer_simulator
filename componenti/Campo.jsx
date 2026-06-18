// Campo da gioco con la formazione 4-3-3: i titolari sono disposti come
// gettoni (overall + cognome) sul terreno, in stile lavagna tattica vintage.

function classeOvr(overall) {
  if (overall >= 88) return "tok-ovr top";
  if (overall >= 82) return "tok-ovr alto";
  return "tok-ovr";
}

function Gettone({ p, ritardo }) {
  const g = p.giocatore;
  return (
    <div className="token" style={{ animationDelay: `${ritardo}ms` }}>
      <div className={classeOvr(g.overall)}>{g.overall}</div>
      <div className="tok-nome">{g.cognome || g.nome}</div>
    </div>
  );
}

export default function Campo({ titolari, mini = false }) {
  const perRuolo = (r) => titolari.filter((p) => p.slot.ruolo === r);

  // Dall'alto (attacco) verso il basso (porta).
  const file = [
    { y: "13%", g: perRuolo("A") },
    { y: "40%", g: perRuolo("C") },
    { y: "67%", g: perRuolo("D") },
    { y: "89%", g: perRuolo("P") },
  ];

  let indice = 0;
  return (
    <div className={`campo${mini ? " campo-mini" : ""}`}>
      {file.map((fila, ri) => (
        <div className="fila" style={{ top: fila.y }} key={ri}>
          {fila.g.map((p) => (
            <Gettone key={p.giocatore._id} p={p} ritardo={indice++ * 70} />
          ))}
        </div>
      ))}
    </div>
  );
}
