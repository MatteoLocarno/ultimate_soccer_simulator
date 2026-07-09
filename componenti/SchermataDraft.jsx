"use client";

import { useEffect, useState } from "react";
import { NOMI_RUOLO, macroRuolo } from "@/logica/formazione";
import { estraiCandidati, estraiAllenatori, chiavePersona } from "@/logica/draft";
import FormazioneDraft from "@/componenti/FormazioneDraft";

const SKIP = [
  { tipo: "tutto", etichetta: "Cambia tutto", icona: "🔄" },
  { tipo: "stagione", etichetta: "Stessa stagione", icona: "📅" },
  { tipo: "club", etichetta: "Stesso club", icona: "🛡️" },
];

// Macro-ruoli (P/D/C/A) che non hanno più nessuno slot libero: non vanno
// più proposti tra i candidati (non ci sarebbe dove metterli).
function calcolaRuoliEsauriti(slot, assegnazioni) {
  const totali = {};
  const occupati = {};
  for (const s of slot) {
    const m = macroRuolo(s.ruolo) || "C";
    totali[m] = (totali[m] || 0) + 1;
    if (assegnazioni[s.indice]) occupati[m] = (occupati[m] || 0) + 1;
  }
  const esauriti = new Set();
  for (const m of Object.keys(totali)) {
    if ((occupati[m] || 0) >= totali[m]) esauriti.add(m);
  }
  return esauriti;
}

// Primo slot libero per il ruolo del giocatore scelto. Priorità in ordine:
//  1. titolare con lo stesso ruolo ESATTO (un'ala sinistra nello slot AS,
//     non in un AD solo perché libero prima)
//  2. titolare dello stesso reparto (macro-ruolo) se non c'è un esatto
//  3. panchina con ruolo esatto
//  4. panchina dello stesso reparto
// "Titolare" viene sempre prima di "panchina", indipendentemente
// dall'esattezza del ruolo: altrimenti un giocatore può finire diretto in
// panchina (che usa solo macro-ruoli tipo "D") anche con un titolare dello
// stesso reparto ancora libero, solo perché quello "combacia" più
// letteralmente.
function trovaSlotLibero(slot, assegnazioni, ruolo) {
  const r = String(ruolo).toUpperCase();
  const macro = macroRuolo(ruolo);
  const aperti = slot.filter((s) => !assegnazioni[s.indice]);
  for (const tipo of ["titolare", "panchina"]) {
    const delTipo = aperti.filter((s) => s.tipo === tipo);
    const esatto = delTipo.find((s) => String(s.ruolo).toUpperCase() === r);
    if (esatto) return esatto;
    const compatibile = delTipo.find((s) => macroRuolo(s.ruolo) === macro);
    if (compatibile) return compatibile;
  }
  return null;
}

export default function SchermataDraft({ slot, squadre, allenatori: listaAllenatori, onCompletato }) {
  const totaleSlot = slot.length;
  const totaleScelte = totaleSlot + 2; // + allenatore + capitano

  // Indicizzata per slot.indice (non per ordine di scelta): un giocatore
  // scelto può finire in un qualsiasi slot libero del suo ruolo, non
  // necessariamente nel prossimo in ordine.
  const [assegnazioni, setAssegnazioni] = useState(() => Array(totaleSlot).fill(null));
  const [candidati, setCandidati] = useState([]);
  const [squadraEstratta, setSquadraEstratta] = useState(null);
  const [allenatori, setAllenatori] = useState(null);
  const [allenatoreScelto, setAllenatoreScelto] = useState(null);
  const [skipUsati, setSkipUsati] = useState([]); // tipi di skip già usati (tutto il draft)

  const numAssegnati = assegnazioni.filter(Boolean).length;
  const faseGiocatori = numAssegnati < totaleSlot;
  const faseAllenatore = !faseGiocatori && !allenatoreScelto;
  const faseCapitano = !faseGiocatori && !!allenatoreScelto;

  const idsUsati = () => new Set(assegnazioni.filter(Boolean).map((a) => a.giocatore._id));
  const personeUsate = () => new Set(assegnazioni.filter(Boolean).map((a) => chiavePersona(a.giocatore)));

  // Nuovi candidati ad ogni assegnazione: 10 giocatori (ruoli misti) dalla
  // stessa squadra storica (scope "squadra", default); allenatori in fase
  // coach.
  useEffect(() => {
    if (faseGiocatori) {
      const ruoliEsauriti = calcolaRuoliEsauriti(slot, assegnazioni);
      const { candidati, squadra } = estraiCandidati(idsUsati(), personeUsate(), squadre, { tipo: "squadra" }, ruoliEsauriti);
      setCandidati(candidati);
      setSquadraEstratta(squadra || null);
    } else if (faseAllenatore) {
      setAllenatori(estraiAllenatori(4, listaAllenatori));
    }
  }, [assegnazioni, allenatoreScelto]); // eslint-disable-line react-hooks/exhaustive-deps

  function usaSkip(tipo) {
    if (skipUsati.includes(tipo) || !faseGiocatori) return;
    setSkipUsati((s) => [...s, tipo]);
    const ruoliEsauriti = calcolaRuoliEsauriti(slot, assegnazioni);
    const { candidati, squadra } = estraiCandidati(idsUsati(), personeUsate(), squadre, { tipo }, ruoliEsauriti);
    setCandidati(candidati);
    setSquadraEstratta(squadra || null);
  }

  function scegliGiocatore(c) {
    const slotLibero = trovaSlotLibero(slot, assegnazioni, c.ruolo);
    if (!slotLibero) return; // di sicurezza: non dovrebbe succedere
    setAssegnazioni((prev) => {
      const next = [...prev];
      next[slotLibero.indice] = {
        giocatore: { nome: c.nome, cognome: c.cognome, ruolo: c.ruolo, overall: c.overall, _id: c._id },
        provenienza: c.provenienza,
      };
      return next;
    });
  }
  function scegliAllenatore(a) { setAllenatoreScelto(a); }
  function scegliCapitano(p) {
    const rosa = assegnazioni.map((a, i) => ({ slot: slot[i], giocatore: a.giocatore, provenienza: a.provenienza }));
    onCompletato({ rosa, allenatore: allenatoreScelto, capitano: p.giocatore._id });
  }

  if (faseAllenatore && !allenatori) return null;

  const scelteFatte = numAssegnati + (allenatoreScelto ? 1 : 0);
  const percentuale = Math.round((scelteFatte / totaleScelte) * 100);
  const titolari = assegnazioni
    .map((a, i) => (a ? { slot: slot[i], giocatore: a.giocatore } : null))
    .filter((p) => p && p.slot.tipo === "titolare");

  // Slot ancora liberi il cui ruolo compare tra i candidati proposti ora:
  // indicano dove potrebbe atterrare la prossima scelta.
  const ruoliInGioco = new Set(candidati.map((c) => macroRuolo(c.ruolo)));
  const slotEvidenziati = new Set(
    slot.filter((s) => !assegnazioni[s.indice] && ruoliInGioco.has(macroRuolo(s.ruolo))).map((s) => s.indice)
  );

  let titolo, etichetta;
  if (faseGiocatori) {
    titolo = "Scegli un giocatore";
    etichetta = `Scelta ${numAssegnati + 1} di ${totaleSlot}`;
  } else if (faseAllenatore) {
    titolo = "Scegli l'allenatore"; etichetta = "Allenatore";
  } else {
    titolo = "Scegli il capitano"; etichetta = "Capitano";
  }

  return (
    <div className="draft">
      <header className="intestazione">
        <div className="logo">Draft</div>
        <h1>{titolo}</h1>
      </header>

      <div className="draft-top">
        <div className="progresso"><div style={{ width: `${percentuale}%` }} /></div>
        <div className="draft-meta">
          <span>Scelta {scelteFatte + 1} di {totaleScelte}</span>
          <span className="badge-ruolo">{etichetta}</span>
        </div>
      </div>

      <div className="draft-spread">
        <div className="draft-scelta">
          {faseGiocatori && (
            <>
              <p className="istruzione">
                {squadraEstratta
                  ? <>10 candidati da <b>{squadraEstratta.squadra} {squadraEstratta.anno}</b>, ognuno col suo ruolo.</>
                  : "10 candidati, ognuno col suo ruolo."}{" "}
                Scegli chi vuoi: occuperà il primo posto libero del suo ruolo.{" "}
                <b>L&apos;overall resta nascosto.</b>
              </p>
              <div className="skip-bar">
                {SKIP.map((s) => (
                  <button
                    key={s.tipo}
                    className="skip-btn"
                    disabled={skipUsati.includes(s.tipo)}
                    onClick={() => usaSkip(s.tipo)}
                    title={`Ripesca i candidati: ${s.etichetta}`}
                  >
                    <span className="skip-ic">{s.icona}</span> {s.etichetta}
                  </button>
                ))}
              </div>
              <div className="lista-candidati">
                {candidati.map((c) => (
                  <button key={c._id} className="candidato" onClick={() => scegliGiocatore(c)}>
                    <span className="cand-info">
                      <span className="nome-g">{c.nome} {c.cognome}</span>
                      <span className="ruolo-g">
                        {NOMI_RUOLO[c.ruolo] || c.ruolo} · {c.provenienza.squadra} {c.provenienza.anno}
                      </span>
                    </span>
                    <span className="freccia">＋</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {faseAllenatore && (
            <>
              <div className="squadra-estratta">
                <div className="occhiello">In panchina</div>
                <div className="nome">L&apos;allenatore</div>
                <div className="anno">Chi guiderà la dinastia?</div>
              </div>
              <p className="istruzione">Scegli <b>un allenatore</b>. L&apos;overall resta nascosto.</p>
              <div className="lista-candidati">
                {allenatori.map((a) => (
                  <button key={a._id} className="candidato" onClick={() => scegliAllenatore(a)}>
                    <span className="cand-info">
                      <span className="nome-g">{a.nome} {a.cognome}</span>
                      <span className="ruolo-g">Allenatore</span>
                    </span>
                    <span className="freccia">＋</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {faseCapitano && (
            <>
              <div className="squadra-estratta">
                <div className="occhiello">Ultimo atto</div>
                <div className="nome">La fascia</div>
                <div className="anno">Chi è il leader della squadra?</div>
              </div>
              <p className="istruzione">Scegli <b>il capitano</b> tra i tuoi titolari.</p>
              <div className="lista-candidati">
                {titolari.map((pick) => (
                  <button key={pick.giocatore._id} className="candidato" onClick={() => scegliCapitano(pick)}>
                    <span className="cand-info">
                      <span className="nome-g">{pick.giocatore.nome} {pick.giocatore.cognome}</span>
                      <span className="ruolo-g">{NOMI_RUOLO[pick.giocatore.ruolo] || pick.giocatore.ruolo}</span>
                    </span>
                    <span className="freccia">Ⓒ</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="draft-formazione">
          <h3 className="sezione-titolo">La tua squadra</h3>
          <FormazioneDraft
            slot={slot}
            picks={assegnazioni}
            slotEvidenziati={faseGiocatori ? slotEvidenziati : null}
            allenatore={allenatoreScelto}
            faseAllenatore={faseAllenatore}
          />
        </aside>
      </div>
    </div>
  );
}
