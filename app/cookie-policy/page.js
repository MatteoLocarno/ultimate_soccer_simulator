import Link from "next/link";

export const metadata = {
  title: "Cookie Policy — Dinastia Scudetto",
  description: "Quali cookie usa Dinastia Scudetto e come gestirli.",
};

export default function CookiePolicyPage() {
  return (
    <main className="pagina-legale">
      <Link href="/" className="legale-torna">← Torna al gioco</Link>
      <h1>Cookie Policy</h1>
      <p className="legale-data">Ultimo aggiornamento: luglio 2026</p>

      <p>
        Questa pagina spiega quali cookie e tecnologie di archiviazione usa
        <strong> Dinastia Scudetto</strong> e come puoi controllarli. Per il
        trattamento dei dati in generale vedi la{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. Cosa sono i cookie</h2>
      <p>
        I cookie (e tecnologie simili come il localStorage) sono piccoli file
        salvati dal browser che permettono al sito di ricordare informazioni
        tra una visita e l&apos;altra o di erogare servizi come la pubblicità.
      </p>

      <h2>2. Cookie tecnici (necessari)</h2>
      <p>
        Sono indispensabili per il funzionamento del sito e <strong>non
        richiedono consenso</strong>. Non ti tracciano e non condividono dati
        con terzi.
      </p>
      <ul>
        <li>
          <strong>ds-consenso-cookie</strong> (archiviazione locale,
          localStorage) — memorizza la tua scelta sul consenso ai cookie, così
          da non riproporti il banner ad ogni visita. Resta solo nel tuo
          browser.
        </li>
      </ul>

      <h2>3. Cookie pubblicitari (solo con consenso)</h2>
      <p>
        Il codice di <strong>Google AdSense</strong> è presente sul sito per
        predisporre il sistema pubblicitario, ma gli <strong>annunci vengono
        mostrati e i relativi cookie impostati unicamente se scegli
        &laquo;Accetta&raquo;</strong> nel banner. Fino a quel momento non viene
        mostrato alcun annuncio. Per gli utenti nell&apos;Unione Europea il
        consenso agli annunci è gestito anche tramite il messaggio sulla privacy
        di Google.
      </p>
      <ul>
        <li>
          <strong>Google AdSense</strong> — Google e i suoi partner impostano
          cookie (ad es. della famiglia <em>doubleclick.net</em>, come{" "}
          <em>__gads</em>, <em>__gpi</em>) per erogare e personalizzare gli
          annunci, limitarne la frequenza e misurarne il rendimento. La durata
          varia a seconda del cookie.
        </li>
      </ul>
      <p>
        Maggiori dettagli su come Google usa i cookie sono disponibili su{" "}
        <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
          policies.google.com/technologies/cookies
        </a>
        .
      </p>

      <h2>4. Come gestire il consenso</h2>
      <p>
        Puoi accettare o rifiutare i cookie pubblicitari dal banner che compare
        alla prima visita. Puoi <strong>cambiare idea in qualsiasi momento</strong>{" "}
        usando il link &laquo;Gestisci cookie&raquo; nel footer: riaprirà il
        banner e potrai fare una nuova scelta. In alternativa, puoi eliminare i
        cookie dalle impostazioni del tuo browser.
      </p>

      <h2>5. Modifiche</h2>
      <p>
        Possiamo aggiornare questa Cookie Policy: la versione valida è sempre
        quella su questa pagina, con la data indicata in alto.
      </p>

      <Link href="/" className="legale-torna">← Torna al gioco</Link>
    </main>
  );
}
