"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

// Traduce i messaggi d'errore più comuni di Supabase Auth in italiano.
function traduciErrore(err) {
  const m = (err?.message || "").toLowerCase();
  if (m.includes("invalid login")) return "Email o password non corretti.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Esiste già un account con questa email. Prova ad accedere.";
  if (m.includes("password should be at least")) return "La password deve avere almeno 6 caratteri.";
  if (m.includes("email not confirmed")) return "Email non ancora confermata: controlla la posta.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "Email non valida.";
  if (m.includes("rate limit") || m.includes("too many")) return "Troppi tentativi, riprova tra poco.";
  if (m.includes("provider is not enabled")) return "Accesso con Google non ancora attivo. Riprova più tardi.";
  return err?.message || "Qualcosa è andato storto. Riprova.";
}

export default function ModaleAuth({ onChiudi }) {
  const [modo, setModo] = useState("accedi"); // accedi | registrati
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState(null);
  const [info, setInfo] = useState(null);
  const [montato, setMontato] = useState(false);

  // Portal + blocco dello scroll di sfondo mentre la modale è aperta.
  useEffect(() => {
    setMontato(true);
    const prima = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prima; };
  }, []);

  async function conEmail(e) {
    e.preventDefault();
    setErrore(null);
    setInfo(null);
    setInvio(true);
    try {
      if (modo === "registrati") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setInfo("Ti abbiamo inviato una mail di conferma: aprila per attivare l'account, poi torna qui ad accedere.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        onChiudi();
      }
    } catch (err) {
      setErrore(traduciErrore(err));
    } finally {
      setInvio(false);
    }
  }

  async function conGoogle() {
    setErrore(null);
    setInfo(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    // In caso di successo la pagina viene reindirizzata a Google, quindi qui
    // si arriva solo se c'è un errore.
    if (error) setErrore(traduciErrore(error));
  }

  if (!montato) return null;

  return createPortal(
    <div className="auth-overlay" role="dialog" aria-modal="true" onClick={onChiudi}>
      <div className="auth-modale" onClick={(e) => e.stopPropagation()}>
        <button className="auth-chiudi" onClick={onChiudi} aria-label="Chiudi">×</button>

        <h2 className="auth-titolo">{modo === "accedi" ? "Accedi" : "Crea un account"}</h2>
        <p className="auth-sub">Salva le tue dinastie e ritrovale su ogni dispositivo.</p>

        <div className="auth-tabs">
          <button className={modo === "accedi" ? "attivo" : ""} onClick={() => { setModo("accedi"); setErrore(null); setInfo(null); }}>
            Accedi
          </button>
          <button className={modo === "registrati" ? "attivo" : ""} onClick={() => { setModo("registrati"); setErrore(null); setInfo(null); }}>
            Registrati
          </button>
        </div>

        <button className="auth-google" onClick={conGoogle} type="button">
          <span className="auth-g">G</span> Continua con Google
        </button>

        <div className="auth-sep"><span>oppure</span></div>

        <form className="auth-form" onSubmit={conEmail}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="tu@email.it"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={modo === "accedi" ? "current-password" : "new-password"}
              minLength={6}
              required
              placeholder="almeno 6 caratteri"
            />
          </label>

          {errore && <p className="auth-errore">{errore}</p>}
          {info && <p className="auth-info">{info}</p>}

          <button className="btn auth-invia" type="submit" disabled={invio}>
            {invio ? "Attendere…" : modo === "accedi" ? "Accedi" : "Registrati"}
          </button>
        </form>

        <p className="auth-nota">
          Non condividiamo la tua email. Usata solo per salvare i tuoi progressi.
        </p>
      </div>
    </div>,
    document.body
  );
}
