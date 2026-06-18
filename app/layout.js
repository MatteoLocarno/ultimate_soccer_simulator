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
  title: "Leggende di Serie A — Draft Storico",
  description:
    "Crea la tua squadra leggendaria pescando i campioni della storia della Serie A e vinci il campionato.",
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
