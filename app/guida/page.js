import Link from "next/link";
import AdAncora from "@/componenti/AdAncora";

export const metadata = {
  title: "Guida e approfondimenti — Dinastia Scudetto",
  description:
    "Guide, consigli e approfondimenti su Dinastia Scudetto e sul calcio storico: moduli e formazioni, le leggende della Serie A per ruolo e le strategie per vincere lo Scudetto.",
};

const ARTICOLI = [
  {
    href: "/come-si-gioca",
    titolo: "Come si gioca",
    testo: "La guida passo passo: draft a overall nascosto, moduli, mercato estivo e dinastia.",
  },
  {
    href: "/guida/moduli-e-formazioni",
    titolo: "Moduli e formazioni",
    testo: "4-3-3, 4-4-2, 3-5-2 e gli altri: pregi, difetti e quando conviene ciascun modulo.",
  },
  {
    href: "/guida/leggende-serie-a",
    titolo: "Le leggende della Serie A per ruolo",
    testo: "Un viaggio tra i grandi interpreti di ogni ruolo che hanno scritto la storia del campionato.",
  },
  {
    href: "/guida/consigli-scudetto",
    titolo: "Consigli per vincere lo Scudetto",
    testo: "Strategie di draft, equilibrio della rosa e gestione del mercato per costruire una dinastia.",
  },
  {
    href: "/faq",
    titolo: "Domande frequenti",
    testo: "Le risposte rapide ai dubbi più comuni sul gioco.",
  },
];

export default function GuidaPage() {
  return (
    <main className="pagina-legale pagina-contenuto">
      <Link href="/" className="legale-torna">← Torna al gioco</Link>
      <h1>Guida e approfondimenti</h1>
      <p className="legale-data">Il centro contenuti di Dinastia Scudetto</p>

      <p>
        Qui trovi guide al gioco e approfondimenti sul calcio storico che ispira{" "}
        <strong>Dinastia Scudetto</strong>. Che tu sia alle prime armi o voglia
        affinare la strategia, parti da qui.
      </p>

      <div className="guida-lista">
        {ARTICOLI.map((a) => (
          <Link key={a.href} href={a.href} className="guida-card">
            <span className="guida-card-titolo">{a.titolo}</span>
            <span className="guida-card-testo">{a.testo}</span>
            <span className="guida-card-freccia">›</span>
          </Link>
        ))}
      </div>

      <Link href="/" className="legale-torna">← Torna al gioco</Link>
      <AdAncora slot="8853641825" />
    </main>
  );
}
