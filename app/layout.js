import "./globals.css";
import { Oswald } from "next/font/google";
import { ADSENSE_CLIENT } from "@/lib/adsense";
import AdSenseLoader from "@/componenti/AdSenseLoader";
import Footer from "@/componenti/Footer";
import CookieBanner from "@/componenti/CookieBanner";
import AuthProvider from "@/componenti/AuthProvider";

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
  // Verifica proprietà del sito per AdSense: metodo "meta tag", statico e
  // riconosciuto da Google senza bisogno di eseguire JS (a differenza dello
  // script adsbygoogle, che next/script inietta solo lato client — il
  // crawler di verifica non lo vede mai, causando "sito non trovato").
  other: {
    "google-adsense-account": ADSENSE_CLIENT,
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
        {/* Il widget "dona un caffè" è renderizzato da Gioco.jsx: fisso in
            alto a destra durante il gioco, banner sopra lo stemma in home
            (solo dalla seconda visita/partita in poi). */}
        <AuthProvider>{children}</AuthProvider>
        <Footer />
        {/* Banner consenso e loader annunci a livello globale (su ogni
            pagina). Lo script adsbygoogle si carica SOLO dopo "Accetta"; la
            verifica di proprietà del sito resta valida grazie al meta tag
            sopra, statico e indipendente dal consenso. */}
        <CookieBanner />
        <AdSenseLoader />
      </body>
    </html>
  );
}
