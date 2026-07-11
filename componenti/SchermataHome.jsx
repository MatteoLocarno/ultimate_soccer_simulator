"use client";

import { useEffect, useState } from "react";
import Stemma from "@/componenti/Stemma";
import AdSlot from "@/componenti/AdSlot";
import DonaCaffe from "@/componenti/DonaCaffe";

// Non si mostra il banner "dona un caffè" alla primissima visita (chi
// arriva per la prima volta deve prima capire il gioco): solo dalla
// seconda visita in poi, o dopo aver ricominciato una partita.
const CHIAVE_VISITATO = "ds_visitato";

// Schermata iniziale: stemma + brand + regole rapide. La CTA porta al setup.
export default function SchermataHome({ onAvvia }) {
  const [mostraDona, setMostraDona] = useState(false);
  const [mostraOnline, setMostraOnline] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(CHIAVE_VISITATO)) {
        setMostraDona(true);
      } else {
        localStorage.setItem(CHIAVE_VISITATO, "1");
      }
    } catch {
      // localStorage non disponibile (modalità privata, ecc.): niente banner.
    }
  }, []);

  return (
    <div className="home">
      <header className="brand">
        {mostraDona && <DonaCaffe className="dona-banner" />}
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
            <b>Componi la rosa.</b> Scegli modulo e colori, poi gli 11
            titolari, allenatore e capitano. Gli overall si svelano alla
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

      <div className="modalita">
        <button className="modalita-card singolo" onClick={onAvvia}>
          <span className="mc-icona">🎮</span>
          <span className="mc-testo">
            <span className="mc-nome">Giocatore singolo</span>
            <span className="mc-desc">
              Pesca la rosa, simula la stagione e, a fine campionato, rilancia
              con 3 cambi a sorte per la tua dinastia.
            </span>
          </span>
          <span className="mc-freccia">›</span>
        </button>

        <button
          className="modalita-card online"
          onClick={() => setMostraOnline(true)}
          aria-expanded={mostraOnline}
        >
          <span className="mc-icona">🌐</span>
          <span className="mc-testo">
            <span className="mc-nome">
              Online <span className="mc-badge">Presto</span>
            </span>
            <span className="mc-desc">
              Sfida altri allenatori in tempo reale con la tua squadra di
              leggende.
            </span>
          </span>
          <span className="mc-freccia">›</span>
        </button>

        {mostraOnline && (
          <p className="modalita-avviso">
            🚧 La modalità <b>Online</b> arriverà in futuro. Per ora costruisci
            la tua dinastia in giocatore singolo!
          </p>
        )}
      </div>

      {/* Solo qui in home, lontano dal pulsante: nessun rischio di click
          accidentali mentre l'utente naviga il gioco. */}
      <AdSlot slot="8853641825" />
    </div>
  );
}
