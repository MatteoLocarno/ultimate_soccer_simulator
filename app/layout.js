import "./globals.css";
import { Oswald } from "next/font/google";

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
      <body>{children}</body>
    </html>
  );
}
