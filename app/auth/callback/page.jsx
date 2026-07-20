"use client";

// Atterraggio dopo il login con Google (o dopo la conferma via email).
//
// Nota sull'architettura: il gioco è interamente client-side e la sessione
// vive in localStorage, quindi NON serve (e sarebbe dannoso) fare qui uno
// scambio server-side con exchangeCodeForSession + cookie: il client
// Supabase, con detectSessionInUrl attivo di default, scambia da solo il
// "?code=..." e ripulisce l'URL. Questa pagina serve solo a dare un
// atterraggio pulito ("Accesso in corso…") ed evitare che l'utente veda la
// home con il codice nell'indirizzo, per poi rimandarlo al gioco.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseAttivo } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    if (!supabaseAttivo) {
      router.replace("/");
      return;
    }

    // Il provider può tornare con un errore (es. consenso negato).
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const err = q.get("error_description") || q.get("error") || h.get("error_description") || h.get("error");
    if (err) {
      setErrore(err);
      return;
    }

    let concluso = false;
    const tornaAlGioco = () => {
      if (concluso) return;
      concluso = true;
      router.replace("/");
    };

    // Se la sessione è già pronta si riparte subito, altrimenti si aspetta
    // l'evento di login emesso dopo lo scambio del codice.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) tornaAlGioco();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessione) => {
      if (sessione) tornaAlGioco();
    });

    // Rete di sicurezza: se qualcosa va storto non si resta bloccati qui.
    const timeout = setTimeout(tornaAlGioco, 8000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="auth-callback">
      {errore ? (
        <>
          <h1>Accesso non riuscito</h1>
          <p className="auth-callback-errore">{errore}</p>
          <button className="btn" onClick={() => router.replace("/")}>Torna al gioco</button>
        </>
      ) : (
        <>
          <span className="auth-callback-spinner" aria-hidden="true" />
          <h1>Accesso in corso…</h1>
          <p>Un attimo e torni al gioco.</p>
        </>
      )}
    </main>
  );
}
