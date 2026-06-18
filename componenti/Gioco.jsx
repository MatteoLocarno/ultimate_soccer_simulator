"use client";

import { useState } from "react";
import SchermataHome from "@/componenti/SchermataHome";
import SchermataDraft from "@/componenti/SchermataDraft";
import SchermataRosa from "@/componenti/SchermataRosa";
import SchermataStagione from "@/componenti/SchermataStagione";

// Componente radice: gestisce la fase di gioco, il nome squadra e la rosa.
// Fasi: "home" → "draft" → "rosa" → "stagione".
export default function Gioco() {
  const [fase, setFase] = useState("home");
  const [rosa, setRosa] = useState([]);
  const [nomeSquadra, setNomeSquadra] = useState("");

  function completaDraft(rosaFinale) {
    setRosa(rosaFinale);
    setFase("rosa");
  }

  function ricomincia() {
    setRosa([]);
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
        <SchermataRosa rosa={rosa} onSimula={() => setFase("stagione")} />
      )}

      {fase === "stagione" && (
        <SchermataStagione
          rosa={rosa}
          nomeSquadra={nomeEffettivo}
          onRicomincia={ricomincia}
        />
      )}
    </main>
  );
}
