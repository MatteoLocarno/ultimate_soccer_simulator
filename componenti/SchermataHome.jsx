import Stemma from "@/componenti/Stemma";

// Schermata iniziale: stemma + brand + regole rapide + avvio del draft.
export default function SchermataHome({ onInizia }) {
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
            <b>Componi la rosa.</b> 11 titolari (4-3-3) + 7 in panchina. Solo
            alla fine scoprirai i valori reali dei tuoi acquisti.
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

      <button className="btn" onClick={onInizia}>
        Inizia il Draft
      </button>
    </div>
  );
}
