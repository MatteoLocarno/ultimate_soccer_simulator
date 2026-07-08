"use client";

import Link from "next/link";
import Stemma from "@/componenti/Stemma";
import { resettaConsenso } from "@/lib/cookieConsent";

// Footer minimale in fondo a ogni pagina: marrone scuro (come il titolo),
// stemma + nome, link legali e revoca consenso cookie. Piccolo e discreto.
export default function Footer() {
  const anno = new Date().getFullYear();
  return (
    <footer className="footer-sito">
      <div className="footer-brand">
        <Stemma size={26} />
        <span className="footer-titolo">Dinastia Scudetto</span>
      </div>

      <nav className="footer-link">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/cookie-policy">Cookie Policy</Link>
        <button type="button" onClick={resettaConsenso}>Gestisci cookie</button>
      </nav>

      <p className="footer-nota">
        © {anno} Dinastia Scudetto · Progetto amatoriale a scopo ludico, non
        affiliato né sponsorizzato dalla Lega Serie A o dai club. Nomi e dati
        dei calciatori usati a fini di intrattenimento.
      </p>
    </footer>
  );
}
