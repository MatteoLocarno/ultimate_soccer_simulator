import Link from "next/link";
import AdSlot from "@/componenti/AdSlot";
import AdAncora from "@/componenti/AdAncora";

export const metadata = {
  title: "Come si gioca a Dinastia Scudetto — Guida completa",
  description:
    "Guida passo passo a Dinastia Scudetto: il draft a overall nascosto, la scelta di modulo e posizioni, la simulazione della stagione, il mercato estivo col dado e la dinastia di cinque stagioni.",
};

export default function ComeSiGiocaPage() {
  return (
    <main className="pagina-legale pagina-contenuto">
      <Link href="/" className="legale-torna">← Torna al gioco</Link>
      <h1>Come si gioca a Dinastia Scudetto</h1>
      <p className="legale-data">Guida completa · aggiornata a luglio 2026</p>

      <p>
        <strong>Dinastia Scudetto</strong> è un gioco di draft in stile vintage
        dedicato alle grandi squadre della storia della Serie A. L&apos;idea è
        semplice ma insidiosa: costruisci la tua rosa scegliendo un giocatore
        per ogni ruolo <strong>senza vedere il suo overall</strong>. Conta solo
        la tua memoria calcistica. Alla fine gli overall vengono svelati e la
        squadra affronta un campionato simulato. Questa guida ti accompagna in
        ogni fase.
      </p>

      <h2>1. Prepara la squadra</h2>
      <p>
        Dopo aver premuto <em>Giocatore singolo</em>, scegli il{" "}
        <strong>modulo</strong> (ad esempio 4-3-3, 4-4-2 o 3-5-2), il{" "}
        <strong>nome</strong> e i <strong>colori</strong> della tua squadra. Il
        modulo determina quali ruoli dovrai riempire e la disposizione in
        campo: un 3-5-2 chiede tre difensori centrali e cinque centrocampisti,
        un 4-3-3 punta sulle ali. Non esiste un modulo &laquo;migliore&raquo; in
        assoluto: dipende dai campioni che riuscirai a pescare.
      </p>

      <h2>2. Il draft a overall nascosto</h2>
      <p>
        È il cuore del gioco. A ogni turno viene estratta una{" "}
        <strong>squadra storica</strong> e ti viene mostrata la sua rosa
        disponibile, divisa per reparto. Scegli un giocatore: il suo valore
        resta nascosto fino alla fine. Devi affidarti a quello che ricordi di
        quel calciatore in quella stagione. Hai a disposizione tre{" "}
        <strong>&laquo;skip&raquo;</strong> per ripescare i candidati con criteri
        diversi (cambia tutto, stessa stagione, stesso club) quando la proposta
        non ti convince.
      </p>
      <p>
        Quando per un ruolo ci sono più posizioni libere — per esempio i due
        difensori centrali o i due centrocampisti — puoi <strong>scegliere
        dove schierare</strong> il giocatore, toccando la posizione sul campo.
        Così decidi tu chi mettere a destra e chi a sinistra.
      </p>

      <h2>3. Allenatore e capitano</h2>
      <p>
        Completati gli undici titolari, scegli l&apos;<strong>allenatore</strong>{" "}
        tra quattro proposti (anche qui a overall nascosto) e nomini il{" "}
        <strong>capitano</strong> tra i tuoi giocatori. L&apos;allenatore incide
        sulla forza complessiva della squadra, il capitano è il simbolo della
        tua rosa.
      </p>

      <h2>4. Il reveal e la simulazione</h2>
      <p>
        A questo punto gli overall vengono <strong>svelati</strong>: scopri se
        la tua memoria ti ha premiato. Viene calcolata la{" "}
        <strong>forza della squadra</strong> e parte la simulazione di un
        campionato a venti squadre, con classifica in tempo reale, andamento,
        marcatori e assist. In base al piazzamento finale ottieni un verdetto:
        Scudetto, qualificazione europea, salvezza o retrocessione.
      </p>

      <AdSlot slot="8853641825" />

      <h2>5. Il mercato estivo e la dinastia</h2>
      <p>
        Qui il gioco diventa una <strong>dinastia</strong>. A fine stagione puoi
        scegliere di giocarne un&apos;altra: si apre il <strong>mercato
        estivo</strong>. Per ogni cambio tiri un <strong>dado</strong> e vengono
        pescati dieci profili di quel ruolo a overall nascosto; ne scegli uno e
        il suo valore si svela una volta inserito in rosa. Puoi cambiare fino a
        tre giocatori più, se vuoi, l&apos;allenatore. Tra una stagione e
        l&apos;altra ti viene anche chiesto se vuoi <strong>cambiare
        capitano</strong>.
      </p>
      <p>
        Una dinastia dura al massimo <strong>cinque stagioni</strong>. Al
        termine arriva il <strong>bilancio</strong>: numero di stagioni,
        scudetti vinti, miglior piazzamento, punti totali, capocannoniere e
        assistman di tutta la dinastia. Puoi anche scaricare un&apos;immagine
        curata della formazione o del bilancio da salvare.
      </p>

      <h2>Consigli per iniziare</h2>
      <ul>
        <li>
          Non farti ingannare dai nomi altisonanti fuori posizione: un fuoriclasse
          in un ruolo che non è il suo può rendere meno di un buon specialista.
        </li>
        <li>
          Usa gli skip con criterio: conservane almeno uno per i ruoli più
          difficili da coprire verso la fine del draft.
        </li>
        <li>
          Pensa all&apos;equilibrio: una difesa solida vale spesso più di un
          attacco stellare ma sbilanciato.
        </li>
      </ul>

      <p>
        Vuoi approfondire? Leggi la nostra{" "}
        <Link href="/guida/moduli-e-formazioni">guida ai moduli e alle formazioni</Link>{" "}
        oppure i <Link href="/guida/consigli-scudetto">consigli per vincere lo Scudetto</Link>.
        Se hai dubbi, dai un&apos;occhiata alle <Link href="/faq">domande frequenti</Link>.
      </p>

      <Link href="/" className="legale-torna">← Torna al gioco</Link>
      <AdAncora slot="8853641825" />
    </main>
  );
}
