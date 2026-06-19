"use client";

import { useEffect, useMemo, useState } from "react";
import { costruisciSlot, MODULO_DEFAULT } from "@/logica/formazione";
import { caricaDati, DATI_LOCALI } from "@/dati/caricaDati";
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
  const [modulo, setModulo] = useState(MODULO_DEFAULT);
  const [colore, setColore] = useState(COLORI[0]);

  const [rosa, setRosa] = useState([]);
  const [allenatore, setAllenatore] = useState(null);
  const [capitano, setCapitano] = useState(null);

  // Dati del gioco: parte dai dati locali (gioco subito disponibile) e prova a
  // sostituirli con quelli di Supabase se la connessione va a buon fine.
  const [dati, setDati] = useState(DATI_LOCALI);
  useEffect(() => {
    let attivo = true;
    caricaDati().then((d) => {
      if (attivo && d) setDati(d);
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
    setFase("home");
  }

  const nomeEffettivo = nomeSquadra.trim() || "La tua squadra";

  return (
    <main className={`app fase-${fase}`}>
      {fase === "home" && <SchermataHome onAvvia={() => setFase("setup")} />}

      {fase === "setup" && (
        <SchermataSetup
          nome={nomeSquadra}
          onNome={setNomeSquadra}
          modulo={modulo}
          onModulo={setModulo}
          colore={colore}
          onColore={setColore}
          onConferma={() => setFase("draft")}
          onIndietro={() => setFase("home")}
        />
      )}

      {fase === "draft" && (
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
          rosa={rosa}
          allenatore={allenatore}
          capitano={capitano}
          nomeSquadra={nomeEffettivo}
          colore={colore}
          squadre={dati.squadre}
          onRicomincia={ricomincia}
        />
      )}
    </main>
  );
}
