"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/componenti/AuthProvider";
import { costruisciSlot } from "@/logica/formazione";
import {
  pvpAttivo,
  getTorneoCorrente,
  getProfilo,
  getMiaEntry,
  getEntries,
  salvaEntry,
  faseTorneo,
} from "@/logica/pvp";
import Stemma from "@/componenti/Stemma";
import ModaleAuth from "@/componenti/ModaleAuth";
import ModaleNickname from "@/componenti/ModaleNickname";
import CaricamentoSquadre from "@/componenti/CaricamentoSquadre";
import SchermataSetup, { COLORI } from "@/componenti/SchermataSetup";
import SchermataDraft from "@/componenti/SchermataDraft";
import PvpRisultati from "@/componenti/pvp/PvpRisultati";
import PvpClassificaGenerale from "@/componenti/pvp/PvpClassificaGenerale";
import PvpMiaSquadra from "@/componenti/pvp/PvpMiaSquadra";

// Conto alla rovescia leggibile ("2g 4h 12m") fino a una data.
function conto(target, adesso) {
  let ms = new Date(target).getTime() - adesso;
  if (ms <= 0) return "0m";
  const g = Math.floor(ms / 86400000); ms -= g * 86400000;
  const h = Math.floor(ms / 3600000); ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  const parti = [];
  if (g) parti.push(`${g}g`);
  if (h || g) parti.push(`${h}h`);
  parti.push(`${m}m`);
  return parti.join(" ");
}

function dataIt(d) {
  try {
    return new Date(d).toLocaleString("it-IT", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

// Orchestratore della modalità Online (Sfida settimanale). Gestisce login,
// nickname, iscrizione via draft, attesa e rivelazione della domenica.
export default function PvpOnline({ dati, squadrePronte, progresso, onEsci }) {
  const { utente, caricato: authCaricato, attivo: authAttivo } = useAuth();

  const [caricamento, setCaricamento] = useState(true);
  const [configurato, setConfigurato] = useState(true);
  const [torneo, setTorneo] = useState(null);
  const [profilo, setProfilo] = useState(null);
  const [miaEntry, setMiaEntry] = useState(null);
  const [entries, setEntries] = useState([]);

  const [vista, setVista] = useState("dashboard"); // dashboard | setup | draft | generale
  const [mostraLogin, setMostraLogin] = useState(false);
  const [mostraNickname, setMostraNickname] = useState(false);

  // Impostazioni draft (come nel singolo giocatore).
  const [nomeSquadra, setNomeSquadra] = useState("");
  const [colore, setColore] = useState(COLORI[0]);
  const [modulo, setModulo] = useState(dati.formazioni[0]);
  const [salvataggio, setSalvataggio] = useState(false);
  const [erroreSalva, setErroreSalva] = useState(null);

  const [adesso, setAdesso] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAdesso(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Carica torneo + profilo + entry (e, se concluso, tutte le iscrizioni).
  const carica = useCallback(async () => {
    if (!pvpAttivo) { setCaricamento(false); return; }
    setCaricamento(true);
    const { torneo: t, configurato: conf } = await getTorneoCorrente();
    setConfigurato(conf);
    setTorneo(t);

    if (utente) {
      const { profilo: p } = await getProfilo(utente.id);
      setProfilo(p);
      if (t) setMiaEntry(await getMiaEntry(t.id, utente.id));
    } else {
      setProfilo(null);
      setMiaEntry(null);
    }

    if (t && faseTorneo(t) === "concluso") {
      setEntries(await getEntries(t.id));
    }
    setCaricamento(false);
  }, [utente]);

  useEffect(() => {
    if (!authCaricato) return;
    carica();
  }, [authCaricato, carica]);

  // Sync modulo se i dati (formazioni) arrivano dopo il mount.
  useEffect(() => {
    setModulo((m) => m || dati.formazioni[0]);
  }, [dati.formazioni]);

  async function completaDraft({ rosa, allenatore, capitano }) {
    setErroreSalva(null);
    setSalvataggio(true);
    const { ok, errore } = await salvaEntry(torneo, utente.id, profilo.nickname, {
      nomeSquadra, colore, modulo, rosa, allenatore, capitano,
    });
    setSalvataggio(false);
    if (ok) {
      setMiaEntry(await getMiaEntry(torneo.id, utente.id));
      setVista("dashboard");
      window.scrollTo(0, 0);
    } else {
      setErroreSalva(errore || "Salvataggio non riuscito.");
    }
  }

  // Avvia la creazione squadra: richiede login e nickname. L'iscrizione è
  // definitiva — se esiste già una rosa per questa settimana non si rifà il
  // draft (blocco anche qui, non solo nell'interfaccia).
  function iniziaIscrizione() {
    if (miaEntry) return;
    if (!utente) { setMostraLogin(true); return; }
    if (!profilo) { setMostraNickname(true); return; }
    setNomeSquadra("");
    setModulo(dati.formazioni[0]);
    setVista("setup");
    window.scrollTo(0, 0);
  }

  // --- Guard rail: casi in cui il PvP non è disponibile --------------------
  if (!pvpAttivo || !authAttivo) {
    return (
      <PvpGuscio onEsci={onEsci} titolo="Sfida settimanale">
        <p className="pvp-avviso">
          La modalità online non è al momento disponibile. Riprova più tardi.
        </p>
      </PvpGuscio>
    );
  }

  if (caricamento || !authCaricato) {
    return (
      <PvpGuscio onEsci={onEsci} titolo="Sfida settimanale">
        <p className="pvp-avviso">Caricamento della sfida…</p>
      </PvpGuscio>
    );
  }

  if (!configurato || !torneo) {
    return (
      <PvpGuscio onEsci={onEsci} titolo="Sfida settimanale">
        <p className="pvp-avviso">
          La <b>Sfida settimanale</b> sta per arrivare! Il sistema online è in
          fase di attivazione. Torna a trovarci tra poco.
        </p>
      </PvpGuscio>
    );
  }

  // --- Sotto-viste ----------------------------------------------------------
  if (vista === "generale") {
    return <PvpClassificaGenerale profilo={profilo} onIndietro={() => setVista("dashboard")} />;
  }

  if (vista === "setup") {
    return (
      <SchermataSetup
        nome={nomeSquadra}
        onNome={setNomeSquadra}
        moduli={dati.formazioni}
        modulo={modulo}
        onModulo={setModulo}
        colore={colore}
        onColore={setColore}
        onConferma={() => { setVista("draft"); window.scrollTo(0, 0); }}
        onIndietro={() => setVista("dashboard")}
      />
    );
  }

  if (vista === "draft") {
    if (!squadrePronte) return <CaricamentoSquadre fatti={progresso.fatti} totali={progresso.totali} />;
    return (
      <div className="pvp-draft-wrap">
        {erroreSalva && <p className="pvp-avviso errore">{erroreSalva}</p>}
        {salvataggio && <p className="pvp-avviso">Salvataggio dell&apos;iscrizione…</p>}
        <SchermataDraft
          slot={costruisciSlot(modulo)}
          squadre={dati.squadre}
          allenatori={dati.allenatori}
          onCompletato={completaDraft}
        />
      </div>
    );
  }

  // --- Rivelazione della domenica ------------------------------------------
  const fase = faseTorneo(torneo, new Date(adesso));
  if (fase === "concluso") {
    return (
      <PvpRisultati
        torneo={torneo}
        entries={entries}
        viewerUserId={utente?.id ?? null}
        squadreDB={dati.squadre}
        onGenerale={() => setVista("generale")}
        onEsci={onEsci}
      />
    );
  }

  // --- Dashboard (aperto / chiuso) -----------------------------------------
  return (
    <PvpGuscio onEsci={onEsci} titolo="Sfida settimanale" settimana={torneo.settimana}>
      <div className="pvp-dashboard">
        {!utente ? (
          <div className="card pvp-hero">
            <Stemma size={72} />
            <h2>Sfida gli allenatori di tutta Italia</h2>
            <p>
              Ogni settimana pesca la tua rosa di leggende e mandala in campo:
              <b> domenica</b> si gioca un vero campionato tra tutte le squadre
              iscritte. Il migliore vince lo <b>Scudetto</b> ed entra nell&apos;albo
              d&apos;oro.
            </p>
            <button className="btn" onClick={() => setMostraLogin(true)}>Accedi per partecipare</button>
            <button className="btn secondario" onClick={() => setVista("generale")}>Vedi la classifica generale</button>
          </div>
        ) : fase === "aperto" ? (
          miaEntry ? (
            <div className="card pvp-iscritto">
              <div className="pvp-badge-ok">✓ Sei iscritto</div>
              <h2>{miaEntry.nome_squadra}</h2>
              <p className="pvp-iscritto-sub">
                La tua squadra è in gara come <b>{profilo?.nickname}</b>. Il campionato
                verrà simulato <b>domenica alle 12:00</b>.
              </p>
              <div className="pvp-countdown">
                <span className="pvp-cd-l">Iscrizioni aperte ancora</span>
                <span className="pvp-cd-v">{conto(torneo.chiusura_iscrizioni, adesso)}</span>
              </div>
              <p className="pvp-bloccata">
                🔒 L&apos;iscrizione è definitiva: la rosa non si può rifare. Qui sotto
                puoi rivederla mentre aspetti la domenica.
              </p>
              <PvpMiaSquadra entry={miaEntry} />
              <div className="pvp-azioni">
                <button className="btn" onClick={() => setVista("generale")}>Classifica generale →</button>
              </div>
            </div>
          ) : (
            <div className="card pvp-hero">
              <Stemma size={72} />
              <h2>Ciao {profilo?.nickname || "allenatore"}!</h2>
              <p>
                Le iscrizioni della settimana <b>{torneo.settimana}</b> sono aperte.
                Pesca la tua rosa e schierala: domenica scoprirai come te la cavi
                contro tutti gli altri iscritti.
              </p>
              <div className="pvp-countdown">
                <span className="pvp-cd-l">Iscrizioni aperte ancora</span>
                <span className="pvp-cd-v">{conto(torneo.chiusura_iscrizioni, adesso)}</span>
              </div>
              <div className="pvp-info-riga">
                <span>👥 {torneo.num_iscritti} iscritti</span>
                <span>🏁 Chiusura: {dataIt(torneo.chiusura_iscrizioni)}</span>
              </div>
              <button className="btn" onClick={iniziaIscrizione}>Crea la tua squadra</button>
              <button className="btn secondario" onClick={() => setVista("generale")}>Classifica generale</button>
            </div>
          )
        ) : (
          // fase === "chiuso"
          <div className="card pvp-attesa">
            <div className="pvp-attesa-icona">⏳</div>
            <h2>Iscrizioni chiuse</h2>
            <p>
              Il campionato della settimana <b>{torneo.settimana}</b> con
              <b> {torneo.num_iscritti} iscritti</b> verrà simulato domenica.
              Torna qui per scoprire la classifica e il campione!
            </p>
            <div className="pvp-countdown">
              <span className="pvp-cd-l">Rivelazione tra</span>
              <span className="pvp-cd-v">{conto(torneo.rivelazione, adesso)}</span>
            </div>
            {miaEntry ? (
              <>
                <p className="pvp-badge-ok inline">✓ Sei in gara con «{miaEntry.nome_squadra}»</p>
                <PvpMiaSquadra entry={miaEntry} />
              </>
            ) : (
              <p className="pvp-avviso">Non ti sei iscritto in tempo per questa settimana.</p>
            )}
            <button className="btn secondario" onClick={() => setVista("generale")}>Classifica generale</button>
          </div>
        )}
      </div>

      {mostraLogin && <ModaleAuth onChiudi={() => { setMostraLogin(false); carica(); }} />}
      {mostraNickname && utente && (
        <ModaleNickname
          userId={utente.id}
          onChiudi={() => setMostraNickname(false)}
          onFatto={async () => {
            setMostraNickname(false);
            const { profilo: p } = await getProfilo(utente.id);
            setProfilo(p);
            setVista("setup");
          }}
        />
      )}
    </PvpGuscio>
  );
}

// Guscio comune con intestazione e pulsante "esci".
function PvpGuscio({ titolo, settimana, children, onEsci }) {
  return (
    <div className="stagione pvp-online">
      <header className="barra-marchio">
        <div className="marchio">
          <Stemma size={34} />
          <span className="marchio-nome">Sfida<br />settimanale</span>
        </div>
        <span className="barra-fase">{settimana || titolo}</span>
      </header>
      {children}
      <div className="azione-fissa">
        <button className="btn secondario" onClick={onEsci}>← Menu principale</button>
      </div>
    </div>
  );
}
