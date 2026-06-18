// ============================================================================
//  FORMAZIONE E STRUTTURA DELLA ROSA
// ----------------------------------------------------------------------------
//  La rosa è composta da 18 slot: 11 titolari (4-3-3) + 7 panchinari.
//  Ogni slot ha un ruolo richiesto, che guida il draft.
// ============================================================================

// Etichette leggibili dei ruoli.
export const NOMI_RUOLO = {
  P: "Portiere",
  D: "Difensore",
  C: "Centrocampista",
  A: "Attaccante",
};

// Nome completo del ruolo al plurale (per i titoli di reparto).
export const NOMI_RUOLO_PLURALE = {
  P: "Portiere",
  D: "Difensori",
  C: "Centrocampisti",
  A: "Attaccanti",
};

// Definizione degli slot in ordine di draft.
// tipo: "titolare" | "panchina"
// Titolari: modulo 4-3-3 → 1 P, 4 D, 3 C, 3 A
// Panchina: 1 P, 2 D, 2 C, 2 A
export const SLOT = [
  // ----- Titolari (4-3-3) -----
  { ruolo: "P", tipo: "titolare" },
  { ruolo: "D", tipo: "titolare" },
  { ruolo: "D", tipo: "titolare" },
  { ruolo: "D", tipo: "titolare" },
  { ruolo: "D", tipo: "titolare" },
  { ruolo: "C", tipo: "titolare" },
  { ruolo: "C", tipo: "titolare" },
  { ruolo: "C", tipo: "titolare" },
  { ruolo: "A", tipo: "titolare" },
  { ruolo: "A", tipo: "titolare" },
  { ruolo: "A", tipo: "titolare" },
  // ----- Panchina -----
  { ruolo: "P", tipo: "panchina" },
  { ruolo: "D", tipo: "panchina" },
  { ruolo: "D", tipo: "panchina" },
  { ruolo: "C", tipo: "panchina" },
  { ruolo: "C", tipo: "panchina" },
  { ruolo: "A", tipo: "panchina" },
  { ruolo: "A", tipo: "panchina" },
].map((slot, indice) => ({ ...slot, indice }));

// Numero totale di slot da riempire.
export const TOTALE_SLOT = SLOT.length;
