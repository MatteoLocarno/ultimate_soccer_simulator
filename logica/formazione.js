// ============================================================================
//  FORMAZIONE, MODULI E STRUTTURA DELLA ROSA
// ----------------------------------------------------------------------------
//  La rosa è 18 slot: 11 titolari (dipendono dal MODULO scelto) + 7 panchinari
//  (fissi: 1 P, 2 D, 2 C, 2 A). Il draft segue l'ordine degli slot.
//
//  Ogni modulo definisce le posizioni in campo dei titolari (coordinate in %,
//  y=0 in alto/attacco, y=100 in basso/porta), usate sia nel draft che nel
//  reveal. L'ordine è sempre: P, poi Difensori, Centrocampisti, Attaccanti.
// ============================================================================

export const NOMI_RUOLO = {
  P: "Portiere",
  D: "Difensore",
  C: "Centrocampista",
  A: "Attaccante",
};

export const NOMI_RUOLO_PLURALE = {
  P: "Portiere",
  D: "Difensori",
  C: "Centrocampisti",
  A: "Attaccanti",
};

// Panchina fissa per ogni modulo.
const PANCHINA = [
  { ruolo: "P" },
  { ruolo: "D" },
  { ruolo: "D" },
  { ruolo: "C" },
  { ruolo: "C" },
  { ruolo: "A" },
  { ruolo: "A" },
];

// Helper per scrivere le posizioni in modo compatto.
const p = (ruolo, x, y) => ({ ruolo, x, y });

export const MODULI = [
  {
    id: "4-3-3",
    nome: "4-3-3",
    descrizione: "4 Dif · 3 Cen · 3 Att",
    posizioni: [
      p("P", 50, 88),
      p("D", 16, 69), p("D", 39, 71), p("D", 61, 71), p("D", 84, 69),
      p("C", 27, 48), p("C", 50, 50), p("C", 73, 48),
      p("A", 28, 22), p("A", 50, 19), p("A", 72, 22),
    ],
  },
  {
    id: "4-4-2",
    nome: "4-4-2",
    descrizione: "4 Dif · 4 Cen · 2 Att",
    posizioni: [
      p("P", 50, 88),
      p("D", 16, 70), p("D", 39, 72), p("D", 61, 72), p("D", 84, 70),
      p("C", 16, 49), p("C", 39, 51), p("C", 61, 51), p("C", 84, 49),
      p("A", 35, 21), p("A", 65, 21),
    ],
  },
  {
    id: "3-5-2",
    nome: "3-5-2",
    descrizione: "3 Dif · 5 Cen · 2 Att",
    posizioni: [
      p("P", 50, 88),
      p("D", 27, 72), p("D", 50, 73), p("D", 73, 72),
      p("C", 11, 53), p("C", 31, 48), p("C", 50, 51), p("C", 69, 48), p("C", 89, 53),
      p("A", 35, 21), p("A", 65, 21),
    ],
  },
  {
    id: "3-4-3",
    nome: "3-4-3",
    descrizione: "3 Dif · 4 Cen · 3 Att",
    posizioni: [
      p("P", 50, 88),
      p("D", 27, 72), p("D", 50, 73), p("D", 73, 72),
      p("C", 16, 50), p("C", 39, 52), p("C", 61, 52), p("C", 84, 50),
      p("A", 28, 23), p("A", 50, 20), p("A", 72, 23),
    ],
  },
  {
    id: "5-3-2",
    nome: "5-3-2",
    descrizione: "5 Dif · 3 Cen · 2 Att",
    posizioni: [
      p("P", 50, 89),
      p("D", 10, 71), p("D", 30, 73), p("D", 50, 74), p("D", 70, 73), p("D", 90, 71),
      p("C", 28, 50), p("C", 50, 51), p("C", 72, 50),
      p("A", 35, 22), p("A", 65, 22),
    ],
  },
  {
    id: "4-2-3-1",
    nome: "4-2-3-1",
    descrizione: "4 Dif · 5 Cen · 1 Att",
    posizioni: [
      p("P", 50, 88),
      p("D", 16, 71), p("D", 39, 73), p("D", 61, 73), p("D", 84, 71),
      p("C", 34, 58), p("C", 66, 58), p("C", 27, 38), p("C", 50, 34), p("C", 73, 38),
      p("A", 50, 17),
    ],
  },
];

export const MODULO_DEFAULT = MODULI[0];

// Numero totale di slot (sempre 11 titolari + 7 panchina).
export const TOTALE_SLOT = 18;

// Costruisce l'elenco ordinato degli slot a partire dal modulo scelto.
export function costruisciSlot(modulo) {
  const titolari = modulo.posizioni.map((pos) => ({
    ruolo: pos.ruolo,
    tipo: "titolare",
    x: pos.x,
    y: pos.y,
  }));
  const panchina = PANCHINA.map((s) => ({ ruolo: s.ruolo, tipo: "panchina" }));
  return [...titolari, ...panchina].map((s, indice) => ({ ...s, indice }));
}
