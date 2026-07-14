"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT } from "@/lib/adsense";
import { useConsenso } from "@/lib/cookieConsent";

// Banner pubblicitario "ancorato" in basso (sticky), pensato SOLO per le
// pagine di contenuto (guida, FAQ, articoli), dove c'è materiale editoriale
// vero. Non va usato sulle schermate di gioco. Come gli altri annunci, non
// carica nulla finché l'utente non ha ACCETTATO i cookie; ha un pulsante per
// chiuderlo.
export default function AdAncora({ slot }) {
  const [consenso] = useConsenso();
  const [chiuso, setChiuso] = useState(false);
  const spinto = useRef(false);

  useEffect(() => {
    if (consenso !== "accettato" || chiuso || spinto.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      spinto.current = true;
    } catch {
      // in sviluppo/localhost adsbygoogle non è ancora pronto: innocuo.
    }
  }, [consenso, chiuso]);

  if (consenso !== "accettato" || chiuso) return null;

  return (
    <div className="ad-ancora" role="complementary" aria-label="Pubblicità">
      <button className="ad-ancora-chiudi" onClick={() => setChiuso(true)} aria-label="Chiudi pubblicità">
        ×
      </button>
      <span className="ad-ancora-label">Pubblicità</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "70px" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
