"use client";

// Mostra la rosa con cui l'utente è iscritto alla sfida settimanale: campo
// con lo schieramento salvato, allenatore, capitano e forza. Serve a poter
// rivedere la propria squadra mentre si aspetta la domenica (l'iscrizione
// non è più modificabile una volta creata).

import Campo from "@/componenti/Campo";

const ORDINE_RUOLO = { POR: 0, TD: 1, DC: 2, TS: 3, ED: 4, CDC: 5, CC: 6, TRQ: 7, ES: 8, AD: 9, ATT: 10, AS: 11 };

export default function PvpMiaSquadra({ entry }) {
  const grezzi = entry?.titolari || [];
  if (!grezzi.length) return null;

  // Adatta la rosa salvata alla forma attesa dal componente Campo.
  const titolari = grezzi.map((t, i) => ({
    slot: { x: t.x ?? 50, y: t.y ?? 50, tipo: "titolare", ruolo: t.ruolo },
    giocatore: {
      nome: t.nome,
      cognome: t.cognome,
      ruolo: t.ruolo,
      overall: t.overall,
      _id: t.id || `${t.nome}-${t.cognome}-${i}`,
    },
  }));

  const capitano = titolari.find((p) => p.giocatore._id === entry.capitano)?.giocatore;
  const inOrdine = [...titolari].sort(
    (a, b) => (ORDINE_RUOLO[a.slot.ruolo] ?? 99) - (ORDINE_RUOLO[b.slot.ruolo] ?? 99)
  );

  return (
    <section className="pvp-mia-squadra">
      <div className="pms-testa">
        <h3 className="sezione-titolo">La tua squadra in gara</h3>
        {Number.isFinite(Number(entry.forza)) && (
          <span className="pms-forza">Forza {entry.forza}</span>
        )}
      </div>

      <Campo titolari={titolari} capitanoId={entry.capitano ?? null} />

      <div className="pms-info">
        {entry.allenatore && (
          <div className="all-caption">
            <span className="ac-l">Allenatore</span>
            <span className="ac-v">
              {entry.allenatore.nome} {entry.allenatore.cognome}
              {Number.isFinite(Number(entry.allenatore.overall)) && ` (${entry.allenatore.overall})`}
            </span>
          </div>
        )}
        {capitano && (
          <div className="all-caption">
            <span className="ac-l">Capitano</span>
            <span className="ac-v">{capitano.nome} {capitano.cognome}</span>
          </div>
        )}
      </div>

      <ul className="pms-lista">
        {inOrdine.map((p) => (
          <li key={p.giocatore._id}>
            <span className="pms-ruolo">{p.giocatore.ruolo}</span>
            <span className="pms-nome">
              {p.giocatore.nome} {p.giocatore.cognome}
              {p.giocatore._id === entry.capitano && <span className="pms-fascia">Ⓒ</span>}
            </span>
            <span className="pms-ovr">{p.giocatore.overall}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
