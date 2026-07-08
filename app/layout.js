import "./globals.css";
import Script from "next/script";
import { Oswald } from "next/font/google";
import { ADSENSE_CLIENT } from "@/lib/adsense";

// Font condensato in stile "programma di gioco" vintage, usato per titoli e
// numeri. Auto-hostato da Next a build time: nessuna richiesta esterna.
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://dinastiascudetto.netlify.app"),
  title: "Dinastia Scudetto — Draft Storico di Serie A",
  description:
    "Pesca i campioni della storia della Serie A a overall nascosto, componi la rosa e costruisci la tua dinastia vincendo lo Scudetto.",
  openGraph: {
    title: "Dinastia Scudetto",
    description:
      "Il draft delle leggende della Serie A. Conta solo la tua memoria calcistica.",
    type: "website",
    locale: "it_IT",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2d2419",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={oswald.variable}>
      <body>
        {children}
        {/* Caricato una sola volta, dopo l'idratazione: non blocca il primo
            render del gioco. Gli annunci veri e propri (componente AdSlot)
            sono posizionati solo nelle schermate "di pausa" (home, fine
            stagione), mai durante draft o simulazione live, per evitare
            click accidentali sui tanti pulsanti interattivi di quelle fasi. */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
