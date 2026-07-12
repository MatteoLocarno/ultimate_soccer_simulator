"use client";

// Contesto di autenticazione: tiene la sessione Supabase (utente loggato) e la
// aggiorna in tempo reale. Se Supabase non è configurato, resta inattivo e
// l'app funziona comunque (login semplicemente non disponibile).
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseAttivo } from "@/lib/supabaseClient";

const AuthContext = createContext({ utente: null, caricato: true, attivo: false });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [utente, setUtente] = useState(null);
  const [caricato, setCaricato] = useState(!supabaseAttivo);

  useEffect(() => {
    if (!supabaseAttivo) return;
    let attivo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!attivo) return;
      setUtente(data.session?.user ?? null);
      setCaricato(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessione) => {
      setUtente(sessione?.user ?? null);
      setCaricato(true);
    });

    return () => {
      attivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ utente, caricato, attivo: supabaseAttivo }}>
      {children}
    </AuthContext.Provider>
  );
}
