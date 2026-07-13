import Link from "next/link";
import AdSlot from "@/componenti/AdSlot";

export const metadata = {
  title: "Moduli e formazioni: guida completa — Dinastia Scudetto",
  description:
    "Pregi e difetti dei principali moduli del calcio (4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 3-4-3) e come sceglierli in Dinastia Scudetto in base ai giocatori che peschi.",
};

export default function ModuliPage() {
  return (
    <main className="pagina-legale pagina-contenuto">
      <Link href="/guida" className="legale-torna">← Torna alla guida</Link>
      <h1>Moduli e formazioni</h1>
      <p className="legale-data">Approfondimento · tempo di lettura ~4 minuti</p>

      <p>
        Il modulo è la spina dorsale di una squadra: decide quanti uomini
        presidiano ogni zona del campo e che tipo di gioco potrai proporre. In{" "}
        <strong>Dinastia Scudetto</strong> la scelta del modulo, prima del draft,
        stabilisce quali ruoli dovrai riempire. Ecco una panoramica dei
        principali sistemi e di quando conviene usarli.
      </p>

      <h2>4-3-3: equilibrio e ampiezza</h2>
      <p>
        Quattro difensori, tre centrocampisti e un tridente offensivo. È il
        modulo più &laquo;bilanciato&raquo;: dà solidità dietro e ampiezza
        davanti grazie alle due ali. Funziona bene quando riesci a pescare
        esterni offensivi rapidi e un centravanti di riferimento. Il rischio è
        un centrocampo in inferiorità numerica contro sistemi a cinque uomini in
        mezzo.
      </p>

      <h2>4-4-2: semplice e collaudato</h2>
      <p>
        Due linee da quattro e due punte. È il modulo classico del calcio
        italiano anni Novanta: ordinato, facile da tenere in equilibrio, ideale
        se hai una coppia d&apos;attacco affiatata e due esterni di
        centrocampo che sanno spingere e ripiegare. Cede qualcosa nel palleggio
        centrale contro chi gioca con il trequartista.
      </p>

      <h2>3-5-2: dominio a centrocampo</h2>
      <p>
        Tre difensori centrali, cinque in mezzo (con due esterni a tutta fascia)
        e due punte. Ti permette di <strong>controllare il centrocampo</strong> e
        di avere sempre un uomo in più nella zona nevralgica. Richiede però
        esterni con grande corsa e tre centrali affidabili: se peschi buoni
        difensori, è un sistema molto solido.
      </p>

      <AdSlot slot="8853641825" />

      <h2>4-2-3-1: il peso del trequartista</h2>
      <p>
        Due mediani a protezione della difesa, un trequartista e tre uomini
        offensivi dietro l&apos;unica punta. È il modulo che valorizza un{" "}
        <strong>fantasista</strong>: se al draft ti capita un grande numero
        dieci, questo sistema lo mette al centro del gioco. Serve una punta
        capace di far salire la squadra da sola.
      </p>

      <h2>3-4-3: coraggio offensivo</h2>
      <p>
        Tre difensori e un reparto avanzato folto. È il modulo più
        aggressivo: mette tanti uomini nella metà campo avversaria ma lascia i
        difensori più esposti. Da scegliere quando hai pescato un attacco
        stellare e vuoi giocartela a viso aperto.
      </p>

      <h2>Come scegliere in Dinastia Scudetto</h2>
      <p>
        Non c&apos;è un modulo perfetto: la scelta migliore dipende dai
        giocatori che riuscirai a pescare, che però restano una sorpresa. Un
        consiglio pratico: parti dai tuoi punti di forza abituali. Se ami le
        difese solide, un 3-5-2 o un 4-4-2 ti daranno più margine. Se punti allo
        spettacolo, prova il 4-3-3 o il 3-4-3. Ricorda che, a parità di
        campioni, <strong>l&apos;equilibrio della rosa</strong> pesa spesso più
        del singolo fuoriclasse.
      </p>

      <p>
        Prosegui con i{" "}
        <Link href="/guida/consigli-scudetto">consigli per vincere lo Scudetto</Link>{" "}
        o rivedi <Link href="/come-si-gioca">come si gioca</Link>.
      </p>

      <Link href="/guida" className="legale-torna">← Torna alla guida</Link>
    </main>
  );
}
