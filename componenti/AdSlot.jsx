"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/adsense";
import { useConsenso } from "@/lib/cookieConsent";

// Slot pubblicitario AdSense riutilizzabile. Va inserito SOLO nelle schermate
// "di pausa" del gioco (home, fine stagione): mai nel draft o nella
// simulazione live, dove l'utente clicca di continuo su pulsanti vicini —
// aumenterebbe i click accidentali, penalizzati dalle policy AdSense.
//
// Non renderizza nulla finché l'utente non ha ACCETTATO i cookie (vedi
// CookieBanner + lib/cookieConsent.js): rispetta il rifiuto senza fare
// nemmeno la richiesta dell'annuncio.
export default function AdSlot({ slot, formato = "auto", className = "" }) {
  const [consenso] = useConsenso();
  const spinto = useRef(false);

  useEffect(() => {
    if (consenso !== "accettato" || spinto.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      spinto.current = true;
    } catch {
      // in sviluppo/localhost adsbygoogle non è ancora pronto: innocuo.
    }
  }, [consenso]);

  if (consenso !== "accettato") return null;

  return (
    <div className={`ad-slot ${className}`}>
      <span className="ad-label">Pubblicità</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={formato}
        data-full-width-responsive="true"
      />
    </div>
  );
}
