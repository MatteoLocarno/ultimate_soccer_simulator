import Link from "next/link";
import AdSlot from "@/componenti/AdSlot";
import AdAncora from "@/componenti/AdAncora";

export const metadata = {
  title: "Le leggende della Serie A per ruolo — Dinastia Scudetto",
  description:
    "Un viaggio tra i grandi interpreti di ogni ruolo che hanno reso leggendaria la Serie A: portieri, difensori, registi, trequartisti e attaccanti da ricordare al draft.",
};

export default function LeggendePage() {
  return (
    <main className="pagina-legale pagina-contenuto">
      <Link href="/guida" className="legale-torna">← Torna alla guida</Link>
      <h1>Le leggende della Serie A, ruolo per ruolo</h1>
      <p className="legale-data">Approfondimento · tempo di lettura ~5 minuti</p>

      <p>
        Per decenni la Serie A è stata il campionato dei campioni: un torneo dove
        sono passati alcuni dei più grandi interpreti di ogni ruolo. È proprio
        questa memoria collettiva il cuore di <strong>Dinastia Scudetto</strong>,
        dove peschi i giocatori a valore nascosto e devi ricordarti chi contava
        davvero. Ecco un viaggio, ruolo per ruolo, tra i profili che hanno
        lasciato il segno — una traccia per allenare l&apos;occhio prima del
        draft.
      </p>

      <h2>Tra i pali</h2>
      <p>
        Il portiere è il primo mattone di ogni grande squadra. La tradizione
        italiana della porta è leggendaria: riflessi, personalità e la capacità
        di trascinare la difesa con la voce. Al draft un grande estremo difensore
        vale molto più dei suoi gol subiti: dà sicurezza a tutto il reparto
        arretrato e spesso decide le partite equilibrate.
      </p>

      <h2>La linea difensiva</h2>
      <p>
        La Serie A ha fatto scuola nel mondo per l&apos;arte del difendere. Il
        difensore centrale ideale unisce senso della posizione, tempismo
        nell&apos;anticipo e impostazione dal basso; il terzino moderno deve
        saper difendere e spingere sulla fascia. Nel gioco, una coppia di
        centrali affidabile è quasi sempre un investimento migliore di un singolo
        nome altisonante mal supportato.
      </p>

      <h2>Il centrocampo: registi e incontristi</h2>
      <p>
        È la zona dove si decidono le partite. Il <strong>regista</strong> detta
        i tempi e illumina il gioco con i lanci; il <strong>mediano</strong>{" "}
        recupera palloni e protegge la difesa; la mezzala unisce corsa e
        inserimenti. Un buon equilibrio tra questi profili rende la squadra
        solida e imprevedibile allo stesso tempo. Attenzione a non riempire il
        centrocampo solo di fantasia: senza chi fa legna, anche il talento si
        spegne.
      </p>

      <AdSlot slot="8853641825" />

      <h2>Il trequartista, il lusso</h2>
      <p>
        Il numero dieci classico — il <strong>trequartista</strong> — è la
        firma del calcio italiano più romantico: l&apos;uomo dell&apos;ultimo
        passaggio, capace di inventare dove gli altri vedono solo un muro. Se al
        draft ti capita un grande fantasista, un modulo come il 4-2-3-1 può
        esaltarlo. È un lusso che ripaga quando la squadra è costruita per
        servirlo.
      </p>

      <h2>L&apos;attacco</h2>
      <p>
        Dal centravanti d&apos;area all&apos;ala rapida, la Serie A ha ospitato
        bomber di ogni tipo. Il centravanti di riferimento fa salire la squadra e
        finalizza; le ali allargano il gioco e saltano l&apos;uomo. Nel gioco, un
        attacco stellare è spettacolare ma non basta: senza equilibrio dietro,
        rischi di subire quanto segni.
      </p>

      <h2>Perché la memoria conta</h2>
      <p>
        Il bello di Dinastia Scudetto è proprio questo: gli overall sono
        nascosti, quindi non puoi affidarti ai numeri. Devi ricordare le
        stagioni, i ruoli, i momenti di forma. Più conosci la storia della Serie
        A, più il draft diventa un vantaggio invece che una lotteria.
      </p>

      <p>
        Pronto a metterti alla prova? <Link href="/">Crea la tua squadra</Link>{" "}
        oppure leggi i{" "}
        <Link href="/guida/consigli-scudetto">consigli per vincere lo Scudetto</Link>.
      </p>

      <Link href="/guida" className="legale-torna">← Torna alla guida</Link>
      <AdAncora slot="8853641825" />
    </main>
  );
}
