"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { salvaNickname } from "@/logica/pvp";

// Modale per scegliere il nickname pubblico usato nelle classifiche PvP.
// Richiesto alla prima partecipazione online. Riusa lo stile .auth-* della
// modale di login.
export default function ModaleNickname({ userId, onFatto, onChiudi }) {
  const [nickname, setNickname] = useState("");
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState(null);
  const [montato, setMontato] = useState(false);

  useEffect(() => {
    setMontato(true);
    const prima = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prima; };
  }, []);

  async function conferma(e) {
    e.preventDefault();
    setErrore(null);
    setInvio(true);
    const { ok, errore: err } = await salvaNickname(userId, nickname);
    setInvio(false);
    if (ok) onFatto?.(nickname.trim());
    else setErrore(err || "Qualcosa è andato storto. Riprova.");
  }

  if (!montato) return null;

  return createPortal(
    <div className="auth-overlay" role="dialog" aria-modal="true" onClick={onChiudi}>
      <div className="auth-modale" onClick={(e) => e.stopPropagation()}>
        {onChiudi && (
          <button className="auth-chiudi" onClick={onChiudi} aria-label="Chiudi">×</button>
        )}

        <h2 className="auth-titolo">Scegli il tuo nickname</h2>
        <p className="auth-sub">
          È il nome con cui apparirai nelle classifiche della Sfida settimanale.
          Scegli con cura: sarà la tua identità da allenatore.
        </p>

        <form className="auth-form" onSubmit={conferma}>
          <label>
            Nickname
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              minLength={3}
              maxLength={20}
              required
              autoFocus
              placeholder="es. IlProfeta_10"
            />
          </label>

          {errore && <p className="auth-errore">{errore}</p>}
          <p className="auth-nota">Da 3 a 20 caratteri: lettere, numeri, spazio e underscore.</p>

          <button className="btn auth-invia" type="submit" disabled={invio}>
            {invio ? "Attendere…" : "Conferma nickname"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
