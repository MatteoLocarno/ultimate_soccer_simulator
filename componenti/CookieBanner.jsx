"use client";

import { useConsenso } from "@/lib/cookieConsent";

// Banner cookie in stile vintage, fisso in fondo. Compare finché l'utente
// non sceglie: solo dopo "Accetta" vengono caricati script e annunci
// AdSense (vedi AdSenseLoader e AdSlot, entrambi gated su questo consenso).
export default function CookieBanner() {
  const [consenso, setConsenso] = useConsenso();

  if (consenso !== null) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consenso cookie">
      <p>
        Usiamo cookie tecnici per far funzionare il gioco e, solo se
        acconsenti, cookie pubblicitari (Google AdSense) per mostrare
        annunci.
      </p>
      <div className="cookie-azioni">
        <button className="btn btn-secondario" onClick={() => setConsenso("rifiutato")}>
          Rifiuta
        </button>
        <button className="btn" onClick={() => setConsenso("accettato")}>
          Accetta
        </button>
      </div>
    </div>
  );
}
