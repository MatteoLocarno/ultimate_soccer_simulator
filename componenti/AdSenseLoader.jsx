import { ADSENSE_CLIENT } from "@/lib/adsense";

// Carica lo script loader di AdSense. Usiamo un tag <script> "grezzo" (non
// next/script): React 19 lo riconosce come script hoistabile e lo emette
// come vero <script src> nell'HTML statico, dentro <head>. È il codice che
// il crawler di Google deve trovare per far passare il sito da "non pronto"
// a idoneo agli annunci (next/script emetteva solo un <link preload>, che
// il crawler non considera "codice AdSense").
//
// Nota: questo carica SOLO la libreria adsbygoogle. Gli annunci veri (i
// blocchi <ins> in AdSlot/AdAncora) restano condizionati al consenso ai
// cookie: nessun annuncio viene mostrato finché l'utente non accetta. Per
// l'UE, la gestione del consenso agli annunci va affidata al messaggio
// GDPR / CMP di Google (da attivare nel pannello AdSense).
export default function AdSenseLoader() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
