import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Dinastia Scudetto",
  description: "Come Dinastia Scudetto tratta i dati e usa i cookie.",
};

export default function PrivacyPage() {
  return (
    <main className="pagina-legale">
      <Link href="/" className="legale-torna">← Torna al gioco</Link>
      <h1>Privacy Policy</h1>
      <p className="legale-data">Ultimo aggiornamento: luglio 2026</p>

      <p>
        Questa informativa spiega quali dati vengono trattati quando usi
        <strong> Dinastia Scudetto</strong> (di seguito &laquo;il sito&raquo;,
        raggiungibile su dinastiascudetto.netlify.app) e quali sono i tuoi
        diritti. Il sito è un progetto amatoriale e gratuito.
      </p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        Il sito è gestito a titolo personale dal suo autore. Per qualsiasi
        richiesta relativa ai dati o alla privacy puoi scrivere a:{" "}
        <a href="mailto:locarnomatteo6@gmail.com">locarnomatteo6@gmail.com</a>.
      </p>

      <h2>2. Quali dati raccogliamo</h2>
      <p>
        Il gioco è utilizzabile <strong>senza registrazione</strong>. La
        creazione di un account è <strong>facoltativa</strong> e serve solo a
        salvare i tuoi progressi. In particolare:
      </p>
      <ul>
        <li>
          <strong>Account (facoltativo)</strong>: se scegli di registrarti — via
          email oppure con Google — trattiamo l&apos;indirizzo email
          associato al tuo account, gestito tramite il servizio di
          autenticazione di <strong>Supabase</strong>. Se accedi con Google,
          riceviamo solo i dati base del profilo (email e nome) necessari
          all&apos;accesso. Non è obbligatorio: puoi giocare senza account.
        </li>
        <li>
          <strong>Preferenza sui cookie</strong>: la tua scelta (accetta o
          rifiuta) è salvata unicamente nel tuo browser, tramite archiviazione
          locale (localStorage), e non viene inviata a noi.
        </li>
        <li>
          <strong>Dati di navigazione tecnici</strong>: il fornitore di hosting
          (Netlify) può registrare log tecnici standard, come l&apos;indirizzo
          IP, per garantire il funzionamento e la sicurezza del servizio.
        </li>
        <li>
          <strong>Dati raccolti dalla pubblicità</strong>: solo se acconsenti,
          Google AdSense e i suoi partner possono raccogliere dati tramite
          cookie (vedi sezione 4).
        </li>
      </ul>

      <h2>3. Cookie e tecnologie simili</h2>
      <p>
        Il sito usa cookie tecnici (necessari) e, con il tuo consenso, cookie
        pubblicitari di terze parti. Il dettaglio completo è nella nostra{" "}
        <Link href="/cookie-policy">Cookie Policy</Link>. Puoi accettare o
        rifiutare tramite il banner e cambiare idea in qualsiasi momento dal
        link &laquo;Gestisci cookie&raquo; nel footer.
      </p>

      <h2>4. Pubblicità (Google AdSense)</h2>
      <p>
        Se acconsenti, questo sito mostra annunci tramite <strong>Google
        AdSense</strong>. Google e i suoi partner utilizzano cookie per
        erogare annunci — anche personalizzati — in base alle tue visite a
        questo e ad altri siti, e per misurarne il rendimento. Il codice di
        AdSense è presente sul sito, ma <strong>nessun annuncio viene mostrato
        e nessun cookie pubblicitario impostato finché non dai il
        consenso</strong>; per gli utenti UE il consenso è gestito anche tramite
        il messaggio sulla privacy di Google.
      </p>
      <p>
        Puoi gestire le tue preferenze pubblicitarie direttamente da Google su{" "}
        <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">
          Google My Ad Center
        </a>
        . Per sapere come Google usa i dati vedi{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          questa pagina
        </a>
        .
      </p>

      <h2>5. Servizi di terze parti</h2>
      <ul>
        <li><strong>Netlify</strong> — hosting del sito.</li>
        <li><strong>Supabase</strong> — database dei dati calcistici (giocatori, squadre, statistiche) e servizio di autenticazione per l&apos;eventuale account (email di accesso).</li>
        <li><strong>Google</strong> — accesso facoltativo &laquo;con Google&raquo; (OAuth), oltre alla pubblicità AdSense.</li>
        <li><strong>Google AdSense</strong> — pubblicità (solo con consenso).</li>
      </ul>

      <h2>6. Base giuridica</h2>
      <p>
        I cookie tecnici sono trattati per necessità di funzionamento del
        servizio. I cookie pubblicitari sono trattati esclusivamente sulla base
        del tuo <strong>consenso</strong> (art. 6 GDPR), che puoi revocare in
        ogni momento.
      </p>

      <h2>7. Minori</h2>
      <p>
        Il sito è rivolto a un pubblico generale e non è destinato a minori di
        14 anni. Non raccogliamo consapevolmente dati personali di minori.
      </p>

      <h2>8. I tuoi diritti</h2>
      <p>
        In base al GDPR hai diritto di accesso, rettifica, cancellazione,
        limitazione e opposizione al trattamento, oltre alla revoca del
        consenso. Poiché non deteniamo dati che ti identificano direttamente,
        per esercitare i diritti relativi ai cookie pubblicitari puoi anche
        agire tramite gli strumenti di Google indicati sopra, o scriverci
        all&apos;indirizzo in sezione 1.
      </p>

      <h2>9. Modifiche</h2>
      <p>
        Possiamo aggiornare questa informativa. La versione in vigore è sempre
        quella pubblicata su questa pagina, con la data di aggiornamento in
        alto.
      </p>

      <Link href="/" className="legale-torna">← Torna al gioco</Link>
    </main>
  );
}
