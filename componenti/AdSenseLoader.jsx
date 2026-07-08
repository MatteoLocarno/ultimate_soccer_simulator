"use client";

import Script from "next/script";
import { useConsenso } from "@/lib/cookieConsent";
import { ADSENSE_CLIENT } from "@/lib/adsense";

// Carica lo script AdSense SOLO dopo che l'utente ha accettato i cookie: se
// rifiuta (o non ha ancora deciso), lo script non viene richiesto affatto.
// La verifica di proprietà del sito non dipende da questo script (usa il
// meta tag statico in app/layout.js), quindi può restare condizionato senza
// alcun problema.
export default function AdSenseLoader() {
  const [consenso] = useConsenso();

  if (consenso !== "accettato") return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
