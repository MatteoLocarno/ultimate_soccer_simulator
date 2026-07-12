"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/componenti/AuthProvider";
import ModaleAuth from "@/componenti/ModaleAuth";

// Etichetta breve dell'utente: nome da Google se c'è, altrimenti la parte
// dell'email prima della @.
function nomeUtente(u) {
  const meta = u?.user_metadata || {};
  return meta.full_name || meta.name || (u?.email || "").split("@")[0] || "Utente";
}

export default function BarraAccount() {
  const { utente, caricato, attivo } = useAuth();
  const [modale, setModale] = useState(false);

  if (!attivo) return null; // Supabase non configurato: niente login

  async function esci() {
    await supabase.auth.signOut();
  }

  return (
    <div className="barra-account">
      {!caricato ? (
        <span className="acc-caricamento" />
      ) : utente ? (
        <>
          <span className="acc-ciao">👤 {nomeUtente(utente)}</span>
          <button className="acc-btn esci" onClick={esci}>Esci</button>
        </>
      ) : (
        <button className="acc-btn accedi" onClick={() => setModale(true)}>
          Accedi / Registrati
        </button>
      )}

      {modale && <ModaleAuth onChiudi={() => setModale(false)} />}
    </div>
  );
}
