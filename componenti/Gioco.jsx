"use client";

import { useEffect, useMemo, useState } from "react";
import { costruisciSlot } from "@/logica/formazione";
import { caricaAllenatoriEFormazioni, caricaSquadre, DATI_LOCALI } from "@/dati/caricaDati";
import DonaCaffe from "@/componenti/DonaCaffe";
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

  // Dati del gioco: parte dai dati locali (gioco subito disponibile) e prova a
  // sostituirli con quelli di Supabase se la connessione va a buon fine.
  const [dati, setDati] = useState(DATI_LOCALI);
  // Modulo scelto (default: primo modulo disponibile).
  const [modulo, setModulo] = useState(DATI_LOCALI.formazioni[0]);

  useEffect(() => {
    let attivo = true;
    // Allenatori/formazioni: piccoli, arrivano subito (servono già in setup).
    caricaAllenatoriEFormazioni().then((d) => {
      if (!attivo || !d) return;
      setDati((prev) => ({ ...prev, allenatori: d.allenatori, formazioni: d.formazioni }));
      if (d.formazioni?.length) setModulo(d.formazioni[0]);
    });
    // Squadre: centinaia di righe, più lente (servono solo al draft).
    caricaSquadre().then((d) => {
      if (!attivo || !d) return;
      setDati((prev) => ({ ...prev, squadre: d.squadre }));
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
      {/* Fuori dalla home la pillola resta fissa in alto a destra; in home
          ci pensa SchermataHome col suo banner sopra lo stemma. */}
      {fase !== "home" && <DonaCaffe className="dona-fissa" />}

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
