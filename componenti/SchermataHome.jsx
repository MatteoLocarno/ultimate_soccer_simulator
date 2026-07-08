import Stemma from "@/componenti/Stemma";
import AdSlot from "@/componenti/AdSlot";

// Schermata iniziale: stemma + brand + regole rapide. La CTA porta al setup.
export default function SchermataHome({ onAvvia }) {
  return (
    <div className="home">
      <header className="brand">
        <Stemma size={132} className="brand-stemma" />
        <h1>
          Dinastia<br />
          Scudetto
        </h1>
        <div className="brand-tag">Il draft delle leggende della Serie A</div>
      </header>

      <div className="card regole">
        <div className="regola">
          <span className="num">1</span>
          <p>
            <b>Pesca i campioni.</b> Per ogni ruolo viene estratta una squadra
            storica: scegli un giocatore <b>senza vedere il suo overall</b>.
            Conta solo la tua memoria calcistica.
          </p>
        </div>
        <div className="regola">
          <span className="num">2</span>
          <p>
            <b>Componi la rosa.</b> Scegli modulo e colori, poi 11 titolari + 7
            in panchina, allenatore e capitano. Gli overall si svelano alla
            fine.
          </p>
        </div>
        <div className="regola">
          <span className="num">3</span>
          <p>
            <b>Costruisci la dinastia.</b> Sfidi 19 squadre leggendarie in un
            torneo a 20: vinci lo Scudetto.
          </p>
        </div>
      </div>

      <button className="btn" onClick={onAvvia}>
        Crea la tua squadra
      </button>

      {/* Solo qui in home, lontano dal pulsante: nessun rischio di click
          accidentali mentre l'utente naviga il gioco. */}
      <AdSlot slot="8853641825" />
    </div>
  );
}
