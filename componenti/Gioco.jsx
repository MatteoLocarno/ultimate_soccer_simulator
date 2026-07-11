"use client";

import { useEffect, useMemo, useState } from "react";
import { costruisciSlot } from "@/logica/formazione";
import { caricaAllenatoriEFormazioni, caricaSquadre, DATI_LOCALI } from "@/dati/caricaDati";
import CaricamentoSquadre from "@/componenti/CaricamentoSquadre";
import SchermataHome from "@/componenti/SchermataHome";
import SchermataSetup, { COLORI } from "@/componenti/SchermataSetup";
import SchermataDraft from "@/componenti/SchermataDraft";
import SchermataRosa from "@/componenti/SchermataRosa";
import SchermataStagione from "@/componenti/SchermataStagione";

// Componente radice: gestisce fase, impostazioni squadra (nome/modulo/colore),
// rosa, allenatore e capitano.
// Fasi: "home" → "setup" → "draft" → "rosa" → "stagione".
export default function Gioco() {
  const [fase, setFase] = useState("home");
  const [nomeSquadra, setNomeSquadra] = useState("");
  const [colore, setColore] = useState(COLORI[0]);

  const [rosa, setRosa] = useState([]);
  const [allenatore, setAllenatore] = useState(null);
  const [capitano, setCapitano] = useState(null);
  // Numero di stagione della dinastia (aumenta ad ogni "prossima stagione").
  const [stagione, setStagione] = useState(1);

  // Dati del gioco: parte dai dati locali (gioco subito disponibile) e prova a
  // sostituirli con quelli di Supabase se la connessione va a buon fine.
  const [dati, setDati] = useState(DATI_LOCALI);
  // Modulo scelto (default: primo modulo disponibile).
  const [modulo, setModulo] = useState(DATI_LOCALI.formazioni[0]);
  // Diventa true quando il caricamento delle squadre (locale o Supabase) è
  // concluso: il draft aspetta questo flag, altrimenti — se ci si arriva in
  // pochi secondi — partirebbe con le sole 5 squadre di fallback locali
  // invece delle centinaia da Supabase (che impiegano ~20s a scaricarsi).
  const [squadrePronte, setSquadrePronte] = useState(false);
  // Avanzamento reale dello scaricamento (blocchi completati/totali), per la
  // barra di caricamento in stile videogioco.
  const [progresso, setProgresso] = useState({ fatti: 0, totali: 0 });

  useEffect(() => {
    let attivo = true;
    // Allenatori/formazioni: piccoli, arrivano subito (servono già in setup).
    caricaAllenatoriEFormazioni().then((d) => {
      if (!attivo || !d) return;
      setDati((prev) => ({ ...prev, allenatori: d.allenatori, formazioni: d.formazioni }));
      if (d.formazioni?.length) setModulo(d.formazioni[0]);
    });
    // Squadre: centinaia di righe, più lente (servono solo al draft).
    caricaSquadre((fatti, totali) => {
      if (attivo) setProgresso({ fatti, totali });
    }).then((d) => {
      if (!attivo || !d) return;
      setDati((prev) => ({ ...prev, squadre: d.squadre }));
      setSquadrePronte(true);
    });
    return () => {
      attivo = false;
    };
  }, []);

  // Slot del draft generati dal modulo scelto.
  const slot = useMemo(() => costruisciSlot(modulo), [modulo]);

  function completaDraft({ rosa: rosaFinale, allenatore: all, capitano: cap }) {
    setRosa(rosaFinale);
    setAllenatore(all);
    setCapitano(cap);
    setFase("rosa");
  }

  function ricomincia() {
    setRosa([]);
    setAllenatore(null);
    setCapitano(null);
    setStagione(1);
    setFase("home");
  }

  // Dinastia: la rosa (eventualmente modificata al mercato) prosegue nella
  // stagione successiva. Si rimonta SchermataStagione (via key) per far
  // ripartire una nuova simulazione con la squadra aggiornata.
  function prossimaStagione(nuovaRosa, nuovoAllenatore) {
    setRosa(nuovaRosa);
    setAllenatore(nuovoAllenatore);
    setStagione((n) => n + 1);
    window.scrollTo(0, 0);
  }

  const nomeEffettivo = nomeSquadra.trim() || "La tua squadra";

  return (
    <main className={`app fase-${fase}`}>
      {/* Il widget "dona un caffè" si vede SOLO in home (SchermataHome, col
          suo banner sopra lo stemma): altrove coprirebbe altri elementi
          dell'interfaccia di gioco. */}
      {fase === "home" && <SchermataHome onAvvia={() => setFase("setup")} />}

      {fase === "setup" && (
        <SchermataSetup
          nome={nomeSquadra}
          onNome={setNomeSquadra}
          moduli={dati.formazioni}
          modulo={modulo}
          onModulo={setModulo}
          colore={colore}
          onColore={setColore}
          onConferma={() => setFase("draft")}
          onIndietro={() => setFase("home")}
        />
      )}

      {fase === "draft" && !squadrePronte && (
        <CaricamentoSquadre fatti={progresso.fatti} totali={progresso.totali} />
      )}

      {fase === "draft" && squadrePronte && (
        <SchermataDraft
          slot={slot}
          squadre={dati.squadre}
          allenatori={dati.allenatori}
          onCompletato={completaDraft}
        />
      )}

      {fase === "rosa" && (
        <SchermataRosa
          rosa={rosa}
          allenatore={allenatore}
          capitano={capitano}
          modulo={modulo}
          onSimula={() => setFase("stagione")}
        />
      )}

      {fase === "stagione" && (
        <SchermataStagione
          key={stagione}
          rosa={rosa}
          allenatore={allenatore}
          capitano={capitano}
          nomeSquadra={nomeEffettivo}
          colore={colore}
          squadre={dati.squadre}
          allenatori={dati.allenatori}
          stagione={stagione}
          onProssimaStagione={prossimaStagione}
          onRicomincia={ricomincia}
        />
      )}
    </main>
  );
}
