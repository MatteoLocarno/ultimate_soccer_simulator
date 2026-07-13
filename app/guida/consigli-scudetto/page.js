import Link from "next/link";
import AdSlot from "@/componenti/AdSlot";

export const metadata = {
  title: "Consigli per vincere lo Scudetto — Dinastia Scudetto",
  description:
    "Strategie di draft, equilibrio della rosa, gestione degli skip e del mercato estivo: i consigli pratici per costruire una squadra vincente in Dinastia Scudetto.",
};

export default function ConsigliPage() {
  return (
    <main className="pagina-legale pagina-contenuto">
      <Link href="/guida" className="legale-torna">← Torna alla guida</Link>
      <h1>Consigli per vincere lo Scudetto</h1>
      <p className="legale-data">Strategia · tempo di lettura ~4 minuti</p>

      <p>
        Vincere a <strong>Dinastia Scudetto</strong> non è solo fortuna: le
        scelte al draft e al mercato fanno una differenza enorme. Ecco le
        strategie che ti aiutano a costruire una rosa competitiva e a
        trasformare una buona stagione in una dinastia.
      </p>

      <h2>1. Cerca l&apos;equilibrio, non solo i nomi</h2>
      <p>
        La tentazione è pescare sempre il campione più famoso. Ma una squadra
        vincente è bilanciata: un portiere affidabile, una difesa solida, un
        centrocampo che sa recuperare palloni e un attacco concreto. Un
        fuoriclasse isolato in mezzo a comprimari rende meno di undici giocatori
        che si completano. Valuta ogni scelta pensando al reparto, non al singolo.
      </p>

      <h2>2. Rispetta i ruoli</h2>
      <p>
        Un grande giocatore fuori posizione perde gran parte del suo valore. Se
        un campione ti viene proposto in un ruolo che non è il suo, chiediti se
        conviene davvero: spesso è meglio uno specialista in forma nella sua zona
        di campo. La coerenza tra giocatore e posizione è una delle chiavi
        nascoste del gioco.
      </p>

      <h2>3. Gestisci gli skip con testa</h2>
      <p>
        Hai tre skip per ripescare i candidati con criteri diversi. Non
        sprecarli all&apos;inizio per capriccio: i ruoli più specifici (un
        terzino sinistro, un regista) diventano difficili da coprire verso la
        fine del draft, quando restano poche posizioni aperte. Tieni almeno uno
        skip di riserva per i momenti critici.
      </p>

      <AdSlot slot="8853641825" />

      <h2>4. Scegli la posizione giusta</h2>
      <p>
        Quando puoi decidere <em>dove</em> schierare un giocatore — per esempio
        tra i due centrali o i due centrocampisti — sfrutta la cosa: metti il
        più difensivo a protezione e il più propositivo dove può spingere. Sono
        dettagli che, sommati, spostano l&apos;equilibrio della squadra.
      </p>

      <h2>5. Usa il mercato estivo per correggere</h2>
      <p>
        Tra una stagione e l&apos;altra hai fino a tre cambi (più
        l&apos;allenatore). Non cambiare a caso: individua i punti deboli emersi
        nella simulazione — un reparto che ha subito troppo, un attacco sterile —
        e prova a rinforzarli. Ricorda che i profili pescati col dado hanno
        overall nascosto finché non li inserisci: è un rischio calcolato, come un
        vero colpo di mercato.
      </p>

      <h2>6. Pensa a lungo termine</h2>
      <p>
        Una dinastia dura cinque stagioni: l&apos;obiettivo non è solo lo
        scudetto di quest&apos;anno, ma un ciclo vincente. Costruisci una base
        solida e miglioria stagione dopo stagione. Il bilancio finale premia chi
        ha saputo restare in alto con continuità, non solo chi ha avuto
        un&apos;annata fortunata.
      </p>

      <p>
        Ora tocca a te: <Link href="/">crea la tua squadra</Link> e inizia la
        scalata. Se ti serve un ripasso, torna a{" "}
        <Link href="/come-si-gioca">come si gioca</Link> o alle{" "}
        <Link href="/faq">domande frequenti</Link>.
      </p>

      <Link href="/guida" className="legale-torna">← Torna alla guida</Link>
    </main>
  );
}
