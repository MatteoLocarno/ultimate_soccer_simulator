"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/adsense";

// Slot pubblicitario AdSense riutilizzabile. Va inserito SOLO nelle schermate
// "di pausa" del gioco (home, fine stagione): mai nel draft o nella
// simulazione live, dove l'utente clicca di continuo su pulsanti vicini —
// aumenterebbe i click accidentali, penalizzati dalle policy AdSense.
//
// NB: "slot" è l'ID dell'unità annuncio creata nella dashboard AdSense
// (Annunci → Per unità annuncio → Annuncio display). I valori placeholder
// qui sotto vanno sostituiti con quelli reali prima che gli annunci servano
// davvero: finché restano placeholder, il tag semplicemente non renderizza
// nulla (nessun errore visibile per l'utente).
export default function AdSlot({ slot, formato = "auto", className = "" }) {
  const spinto = useRef(false);

  useEffect(() => {
    if (spinto.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      spinto.current = true;
    } catch {
      // in sviluppo/localhost adsbygoogle non è ancora pronto: innocuo.
    }
  }, []);

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
