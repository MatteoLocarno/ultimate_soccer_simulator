"use client";

import { MODULI } from "@/logica/formazione";
import MiniModulo from "@/componenti/MiniModulo";

// Palette colori selezionabili per la squadra (tinte d'epoca + classiche).
export const COLORI = [
  "#9c2a24", // rosso
  "#0b1f8f", // blu
  "#222222", // nero
  "#3f6b3a", // verde
  "#12a0d7", // celeste
  "#7b2bbd", // viola
  "#a8761a", // oro
  "#8e1b2e", // granata
  "#d4711f", // arancio
];

// Schermata di creazione squadra: nome, modulo e colore. Da qui parte il draft.
export default function SchermataSetup({
  nome,
  onNome,
  modulo,
  onModulo,
  colore,
  onColore,
  onConferma,
  onIndietro,
}) {
  return (
    <div className="setup">
      <header className="intestazione">
        <div className="logo">Nuova squadra</div>
        <h1>Crea la tua squadra</h1>
      </header>

      <div className="campo-nome">
        <label htmlFor="nome-squadra">Nome della squadra</label>
        <input
          id="nome-squadra"
          type="text"
          value={nome}
          onChange={(e) => onNome(e.target.value)}
          placeholder="La tua squadra"
          maxLength={24}
          autoComplete="off"
        />
      </div>

      <section className="setup-sezione">
        <h3 className="sezione-titolo">Modulo</h3>
        <div className="griglia-moduli">
          {MODULI.map((m) => (
            <button
              key={m.id}
              className={`modulo-card ${m.id === modulo.id ? "scelto" : ""}`}
              onClick={() => onModulo(m)}
            >
              <MiniModulo modulo={m} />
              <span className="modulo-nome">{m.nome}</span>
              <span className="modulo-desc">{m.descrizione}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="setup-sezione">
        <h3 className="sezione-titolo">Colore</h3>
        <div className="griglia-colori">
          {COLORI.map((c) => (
            <button
              key={c}
              className={`swatch ${c === colore ? "scelto" : ""}`}
              style={{ background: c }}
              onClick={() => onColore(c)}
              aria-label={`Colore ${c}`}
            />
          ))}
        </div>
      </section>

      <div className="azione-fissa setup-azioni">
        <button className="btn btn-secondario" onClick={onIndietro}>
          Indietro
        </button>
        <button className="btn" onClick={onConferma}>
          Inizia il Draft
        </button>
      </div>
    </div>
  );
}
