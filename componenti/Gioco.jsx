"use client";

import { useState } from "react";
import SchermataHome from "@/componenti/SchermataHome";
import SchermataDraft from "@/componenti/SchermataDraft";
import SchermataRosa from "@/componenti/SchermataRosa";
import SchermataStagione from "@/componenti/SchermataStagione";

// Componente radice: gestisce la fase di gioco, il nome squadra, la rosa e
// l'allenatore. Fasi: "home" → "draft" → "rosa" → "stagione".
export default function Gioco() {
  const [fase, setFase] = useState("home");
  const [rosa, setRosa] = useState([]);
  const [allenatore, setAllenatore] = useState(null);
  const [nomeSquadra, setNomeSquadra] = useState("");

  function completaDraft({ rosa: rosaFinale, allenatore: all }) {
    setRosa(rosaFinale);
    setAllenatore(all);
    setFase("rosa");
  }

  function ricomincia() {
    setRosa([]);
    setAllenatore(null);
    setFase("home");
  }

  // Nome effettivo usato nel campionato (fallback se lasciato vuoto).
  const nomeEffettivo = nomeSquadra.trim() || "La tua squadra";

  return (
    <main className={`app fase-${fase}`}>
      {fase === "home" && (
        <SchermataHome
          nome={nomeSquadra}
          onNome={setNomeSquadra}
          onInizia={() => setFase("draft")}
        />
      )}

      {fase === "draft" && <SchermataDraft onCompletato={completaDraft} />}

      {fase === "rosa" && (
        <SchermataRosa
          rosa={rosa}
          allenatore={allenatore}
          onSimula={() => setFase("stagione")}
        />
      )}

      {fase === "stagione" && (
        <SchermataStagione
          rosa={rosa}
          allenatore={allenatore}
          nomeSquadra={nomeEffettivo}
          onRicomincia={ricomincia}
        />
      )}
    </main>
  );
}
