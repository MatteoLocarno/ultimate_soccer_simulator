"use client";

import Link from "next/link";
import { useConsenso } from "@/lib/cookieConsent";

// Banner cookie: card arrotondata "sospesa" in basso (staccata dai bordi),
// sopra a tutto. Compare finché l'utente non sceglie: solo dopo "Accetta"
// vengono caricati script e annunci AdSense (vedi AdSenseLoader e AdSlot,
// entrambi condizionati a questo consenso).
export default function CookieBanner() {
  const [consenso, setConsenso] = useConsenso();

  if (consenso !== null) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consenso cookie">
      <p className="cookie-testo">
        Usiamo cookie tecnici per far funzionare il gioco e, solo con il tuo
        consenso, cookie pubblicitari (Google AdSense). Dettagli nella{" "}
        <Link href="/cookie-policy">Cookie Policy</Link> e nella{" "}
        <Link href="/privacy">Privacy Policy</Link>.
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
