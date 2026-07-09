// ============================================================================
//  FORMAZIONE, MODULI E STRUTTURA DELLA ROSA
// ----------------------------------------------------------------------------
//  Le formazioni "vere" vengono da Supabase (tabelle formations +
//  formation_slots, con ruoli dettagliati e coordinate). Qui restano i MODULI
//  locali come fallback e le utility comuni (nomi ruolo, macro-ruolo, slot).
//
//  RUOLI dettagliati (enum DB): POR, TD, TS, DC, ED, ES, CDC, CC, TRQ, AD, AS,
//  ATT. MACRO-ruoli del gioco: P (portiere), D (difensore), C (centrocampista,
//  include anche ED/ES/CDC/TRQ), A (attaccante, include anche AD/AS). La
//  panchina usa i macro-ruoli.
// ============================================================================

// Nomi leggibili (macro + dettagliati).
export const NOMI_RUOLO = {
  P: "Portiere", D: "Difensore", C: "Centrocampista", A: "Attaccante",
  POR: "Portiere",
  TD: "Terzino destro", TS: "Terzino sinistro", DC: "Difensore centrale",
  ED: "Esterno destro", ES: "Esterno sinistro",
  CDC: "Mediano", CC: "Centrocampista", TRQ: "Trequartista",
  AD: "Ala destra", AS: "Ala sinistra", ATT: "Attaccante",
};

export const NOMI_RUOLO_PLURALE = {
  P: "Portiere", D: "Difensori", C: "Centrocampisti", A: "Attaccanti",
};

// Riduzione ruolo (dettagliato o macro) → P/D/C/A.
const MACRO = {
  POR: "P", GK: "P", P: "P",
  TD: "D", TS: "D", DC: "D", DCD: "D", DCS: "D", DD: "D", DS: "D", D: "D",
  CC: "C", CDC: "C", MED: "C", REG: "C", MEZ: "C", ED: "C", ES: "C", C: "C",
  AD: "A", AS: "A", ATT: "A", SP: "A", PC: "A", SS: "A", A: "A",
  TRQ: "C", COC: "C",
};

export function macroRuolo(r) {
  if (!r) return null;
  const s = String(r).trim().toUpperCase();
  if (MACRO[s]) return MACRO[s];
  if (s.startsWith("PORT")) return "P";
  if (s.startsWith("DIF") || s.startsWith("TER")) return "D";
  if (s.startsWith("CEN") || s.startsWith("MED") || s.startsWith("EST") || s.startsWith("TREQ")) return "C";
  if (s.startsWith("ATT") || s.startsWith("ALA") || s.startsWith("PUN")) return "A";
  return null;
}

// Panchina rimossa per ora (solo titolari nel draft): la lista resta qui
// pronta, giusto scommentare in costruisciSlot per riattivarla.
// const PANCHINA = [
//   { ruolo: "P" }, { ruolo: "D" }, { ruolo: "D" },
//   { ruolo: "C" }, { ruolo: "C" }, { ruolo: "A" }, { ruolo: "A" },
// ];

const pos = (ruolo, x, y) => ({ ruolo, x, y });

// MODULI locali di fallback (se Supabase non è disponibile). Coordinate con
// y = 0 in alto/attacco, y = 100 in basso/porta (stesso orientamento del campo).
export const MODULI = [
  {
    id: "4-3-3", nome: "4-3-3", descrizione: "4 Dif · 3 Cen · 3 Att",
    posizioni: [
      pos("POR", 50, 88),
      pos("TS", 16, 69), pos("DC", 39, 71), pos("DC", 61, 71), pos("TD", 84, 69),
      pos("CC", 27, 48), pos("CDC", 50, 50), pos("CC", 73, 48),
      pos("AS", 28, 22), pos("ATT", 50, 19), pos("AD", 72, 22),
    ],
  },
  {
    id: "4-4-2", nome: "4-4-2", descrizione: "4 Dif · 4 Cen · 2 Att",
    posizioni: [
      pos("POR", 50, 88),
      pos("TS", 16, 70), pos("DC", 39, 72), pos("DC", 61, 72), pos("TD", 84, 70),
      pos("ES", 16, 49), pos("CC", 39, 51), pos("CC", 61, 51), pos("ED", 84, 49),
      pos("ATT", 35, 21), pos("ATT", 65, 21),
    ],
  },
  {
    id: "3-5-2", nome: "3-5-2", descrizione: "3 Dif · 5 Cen · 2 Att",
    posizioni: [
      pos("POR", 50, 88),
      pos("DC", 27, 72), pos("DC", 50, 73), pos("DC", 73, 72),
      pos("ES", 11, 53), pos("CC", 31, 48), pos("CDC", 50, 51), pos("CC", 69, 48), pos("ED", 89, 53),
      pos("ATT", 35, 21), pos("ATT", 65, 21),
    ],
  },
];

export const MODULO_DEFAULT = MODULI[0];

// Numero totale di slot (solo titolari, per ora: panchina rimossa).
export const TOTALE_SLOT = 11;

// Costruisce l'elenco ordinato degli slot dal modulo scelto.
export function costruisciSlot(modulo) {
  const titolari = (modulo.posizioni || []).map((p) => ({
    ruolo: p.ruolo, tipo: "titolare", x: p.x, y: p.y,
  }));
  return titolari.map((s, indice) => ({ ...s, indice }));
}

// Descrizione "X Dif · Y Cen · Z Att" dalle posizioni dei titolari.
export function descriviModulo(posizioni) {
  const c = { D: 0, C: 0, A: 0 };
  for (const p of posizioni) {
    const m = macroRuolo(p.ruolo);
    if (c[m] !== undefined) c[m]++;
  }
  return `${c.D} Dif · ${c.C} Cen · ${c.A} Att`;
}
