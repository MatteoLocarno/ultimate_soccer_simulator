"use client";

import { useEffect, useState } from "react";

const CHIAVE = "ds-consenso-cookie";
const EVENTO = "ds-consenso-cambiato";

// Stato del consenso: undefined = non ancora letto da localStorage (evita lo
// sfarfallio tra server e client), null = mai deciso (mostra il banner),
// "accettato" | "rifiutato" = scelta salvata dall'utente.
//
// Ogni componente che chiama questo hook ha il proprio useState, quindi per
// tenerli sincronizzati (banner, AdSenseLoader, AdSlot, footer) il cambio di
// consenso viene propagato con un evento su window, ascoltato da tutte le
// istanze attive dell'hook nella stessa pagina.
export function useConsenso() {
  const [consenso, setConsensoState] = useState(undefined);

  useEffect(() => {
    const leggi = () => {
      const salvato = localStorage.getItem(CHIAVE);
      setConsensoState(salvato === "accettato" || salvato === "rifiutato" ? salvato : null);
    };
    leggi();
    window.addEventListener(EVENTO, leggi);
    return () => window.removeEventListener(EVENTO, leggi);
  }, []);

  function setConsenso(valore) {
    localStorage.setItem(CHIAVE, valore);
    window.dispatchEvent(new Event(EVENTO));
  }

  return [consenso, setConsenso];
}

// Revoca/azzera la scelta: il banner ricompare, script e annunci si spengono
// (usato dal link "Gestisci cookie" nel footer — obbligo GDPR di poter
// cambiare idea in ogni momento).
export function resettaConsenso() {
  localStorage.removeItem(CHIAVE);
  window.dispatchEvent(new Event(EVENTO));
}
