import Link from "next/link";
import AdSlot from "@/componenti/AdSlot";
import AdAncora from "@/componenti/AdAncora";

export const metadata = {
  title: "Domande frequenti (FAQ) — Dinastia Scudetto",
  description:
    "Le risposte alle domande più comuni su Dinastia Scudetto: come funziona, se è gratis, se serve registrarsi, cosa sono gli overall nascosti e come si vince lo Scudetto.",
};

const FAQ = [
  {
    d: "Che cos'è Dinastia Scudetto?",
    r: "È un gioco gratuito da browser in cui componi una squadra pescando i campioni della storia della Serie A a overall nascosto, poi simuli un campionato e provi a costruire una dinastia vincente lungo cinque stagioni.",
  },
  {
    d: "Si gioca gratis?",
    r: "Sì, è completamente gratuito. È un progetto amatoriale a scopo ludico, non affiliato né sponsorizzato dalla Lega Serie A o dai club.",
  },
  {
    d: "Serve registrarsi per giocare?",
    r: "No, puoi giocare subito senza account. La registrazione (via email o con Google) è facoltativa e serve solo a salvare i tuoi progressi e ritrovarli su ogni dispositivo.",
  },
  {
    d: "Cosa significa 'overall nascosto'?",
    r: "Quando scegli un giocatore durante il draft non vedi il suo valore numerico (overall). Devi affidarti alla memoria calcistica: chi era davvero forte in quella stagione? Gli overall vengono svelati solo alla fine, prima della simulazione.",
  },
  {
    d: "Posso scegliere dove mettere un giocatore in campo?",
    r: "Sì. Quando per un ruolo ci sono più posizioni libere (per esempio i due difensori centrali), puoi decidere tu dove schierarlo toccando la posizione sul campo.",
  },
  {
    d: "Come funziona il mercato estivo?",
    r: "Tra una stagione e l'altra puoi fare mercato: per ogni cambio tiri un dado e vengono pescati dieci profili di quel ruolo a overall nascosto. Ne scegli uno e il suo valore si svela una volta inserito. Puoi cambiare fino a tre giocatori e, se vuoi, l'allenatore.",
  },
  {
    d: "Quante stagioni dura una partita?",
    r: "Una dinastia dura al massimo cinque stagioni. Al termine vedi il bilancio complessivo: scudetti vinti, miglior piazzamento, punti totali, capocannoniere e assistman di tutta la dinastia.",
  },
  {
    d: "Come si vince lo Scudetto?",
    r: "Chiudendo il campionato simulato al primo posto. Il risultato dipende dalla forza della tua rosa (frutto delle scelte al draft e al mercato) e da un pizzico di fortuna nella simulazione, esattamente come nel calcio vero.",
  },
  {
    d: "I dati dei giocatori sono reali?",
    r: "I nomi e le valutazioni provengono da dati calcistici storici e sono usati a soli fini di intrattenimento. Il gioco non è un prodotto ufficiale e non ha alcun legame con la Lega Serie A o con i club.",
  },
  {
    d: "Posso condividere la mia squadra?",
    r: "Sì. Alla fine puoi scaricare un'immagine curata della tua formazione o del bilancio della dinastia, con il rimando al sito, pronta da salvare o inviare.",
  },
];

export default function FaqPage() {
  return (
    <main className="pagina-legale pagina-contenuto">
      <Link href="/" className="legale-torna">← Torna al gioco</Link>
      <h1>Domande frequenti</h1>
      <p className="legale-data">FAQ · aggiornate a luglio 2026</p>

      <p>
        Tutto quello che c&apos;è da sapere su <strong>Dinastia Scudetto</strong>
        in poche risposte. Se vuoi la spiegazione passo passo, leggi la guida{" "}
        <Link href="/come-si-gioca">Come si gioca</Link>.
      </p>

      {FAQ.slice(0, 5).map((f) => (
        <section key={f.d}>
          <h2>{f.d}</h2>
          <p>{f.r}</p>
        </section>
      ))}

      <AdSlot slot="8853641825" />

      {FAQ.slice(5).map((f) => (
        <section key={f.d}>
          <h2>{f.d}</h2>
          <p>{f.r}</p>
        </section>
      ))}

      <p>
        Non hai trovato la tua risposta? Scopri i{" "}
        <Link href="/guida/consigli-scudetto">consigli per vincere lo Scudetto</Link>{" "}
        o torna a <Link href="/">giocare</Link>.
      </p>

      <Link href="/" className="legale-torna">← Torna al gioco</Link>
      <AdAncora slot="8853641825" />
    </main>
  );
}
