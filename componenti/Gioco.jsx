"use client";

import { useState } from "react";
import SchermataHome from "@/componenti/SchermataHome";
import SchermataDraft from "@/componenti/SchermataDraft";
import SchermataRosa from "@/componenti/SchermataRosa";
import SchermataStagione from "@/componenti/SchermataStagione";

// Componente radice: gestisce la fase di gioco e la rosa costruita dall'utente.
// Fasi: "home" → "draft" → "rosa" → "stagione".
export default function Gioco() {
  const [fase, setFase] = useState("home");
  const [rosa, setRosa] = useState([]);

  function completaDraft(rosaFinale) {
    setRosa(rosaFinale);
    setFase("rosa");
  }

  function ricomincia() {
    setRosa([]);
    setFase("home");
  }

  return (
    <main className="app">
      {fase === "home" && <SchermataHome onInizia={() => setFase("draft")} />}

      {fase === "draft" && <SchermataDraft onCompletato={completaDraft} />}

      {fase === "rosa" && (
        <SchermataRosa rosa={rosa} onSimula={() => setFase("stagione")} />
      )}

      {fase === "stagione" && (
        <SchermataStagione rosa={rosa} onRicomincia={ricomincia} />
      )}
    </main>
  );
}
