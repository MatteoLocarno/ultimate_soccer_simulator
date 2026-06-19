// ============================================================================
//  SIMULAZIONE DEL CAMPIONATO
// ----------------------------------------------------------------------------
//  20 squadre: la tua + 19 varianti storiche casuali (senza duplicare la
//  stessa squadra-stagione). Girone di andata e ritorno (38 giornate).
//  La forza dipende dagli 11 titolari e dall'allenatore; ogni partita ha una
//  "forma del giorno" che produce sorprese realistiche.
// ============================================================================

import { SQUADRE } from "@/dati/squadre";

const VANTAGGIO_CASA = 0.3; // gol attesi extra per chi gioca in casa
const GOL_BASE = 1.3; // media gol in una partita equilibrata
const BONUS_ALL_BASE = 0.8; // panchina "media" attribuita alle avversarie

// Bonus/malus di forza dato dall'allenatore (riferito a un tecnico medio ~82).
export function bonusAllenatore(allenatore) {
  if (!allenatore) return 0;
  return (allenatore.overall - 82) * 0.3;
}

// Forza di una squadra storica = media degli overall dei suoi 11 migliori.
export function forzaDaGiocatori(giocatori) {
  const ordinati = [...giocatori].sort((a, b) => b.overall - a.overall);
  const migliori = ordinati.slice(0, 11);
  const somma = migliori.reduce((tot, g) => tot + g.overall, 0);
  return somma / migliori.length;
}

// Forza della rosa dell'utente = media degli 11 titolari + bonus allenatore.
export function forzaUtente(rosa, allenatore) {
  const titolari = rosa.filter((p) => p.slot.tipo === "titolare");
  const somma = titolari.reduce((tot, p) => tot + p.giocatore.overall, 0);
  return somma / titolari.length + bonusAllenatore(allenatore);
}

// Costruisce le 20 squadre del campionato: la tua + 19 storiche casuali.
export function costruisciCampionato(
  rosaUtente,
  nomeUtente = "La tua squadra",
  allenatore = null,
  colore = "#3f6b3a",
  squadreDB = SQUADRE
) {
  const tua = {
    id: "__utente",
    nome: nomeUtente,
    squadra: nomeUtente,
    anno: "",
    colore: colore,
    forza: forzaUtente(rosaUtente, allenatore),
    utente: true,
  };

  // Mescola le squadre storiche e prendine 19 distinte (ogni voce del
  // database è già una squadra-stagione unica, quindi nessun duplicato).
  const mescolate = [...squadreDB].sort(() => Math.random() - 0.5).slice(0, 19);
  const avversarie = mescolate.map((s) => ({
    id: s.id,
    nome: `${s.squadra} ${s.anno}`,
    squadra: s.squadra,
    anno: s.anno,
    colore: s.colore,
    forza: forzaDaGiocatori(s.giocatori) + BONUS_ALL_BASE,
    utente: false,
  }));

  return [tua, ...avversarie];
}

// Estrae un numero di gol da una distribuzione di Poisson (algoritmo di Knuth).
function golPoisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function limita(valore, min, max) {
  return Math.max(min, Math.min(max, valore));
}

// Simula una singola partita e ritorna { golCasa, golOspite }.
function simulaPartita(casa, ospite) {
  const diff = (casa.forza - ospite.forza) / 7;
  const lambdaCasa = limita(GOL_BASE + VANTAGGIO_CASA + diff, 0.2, 5.5);
  const lambdaOspite = limita(GOL_BASE - diff, 0.2, 5.5);
  // forma del giorno: introduce sorprese senza stravolgere i valori
  const formaCasa = 0.82 + Math.random() * 0.36;
  const formaOspite = 0.82 + Math.random() * 0.36;
  return {
    golCasa: golPoisson(lambdaCasa * formaCasa),
    golOspite: golPoisson(lambdaOspite * formaOspite),
  };
}

// Crea una riga di classifica vuota per una squadra.
function rigaVuota(squadra) {
  return {
    ...squadra,
    g: 0,
    v: 0,
    n: 0,
    p: 0,
    gf: 0,
    gs: 0,
    punti: 0,
  };
}

// Aggiorna due righe di classifica con il risultato di una partita.
function registra(rigaCasa, rigaOspite, golCasa, golOspite) {
  rigaCasa.g++;
  rigaOspite.g++;
  rigaCasa.gf += golCasa;
  rigaCasa.gs += golOspite;
  rigaOspite.gf += golOspite;
  rigaOspite.gs += golCasa;

  if (golCasa > golOspite) {
    rigaCasa.v++;
    rigaCasa.punti += 3;
    rigaOspite.p++;
  } else if (golCasa < golOspite) {
    rigaOspite.v++;
    rigaOspite.punti += 3;
    rigaCasa.p++;
  } else {
    rigaCasa.n++;
    rigaOspite.n++;
    rigaCasa.punti++;
    rigaOspite.punti++;
  }
}

// Criterio di ordinamento della classifica: punti, poi diff. reti, poi gol fatti.
function ordinaClassifica(a, b) {
  if (b.punti !== a.punti) return b.punti - a.punti;
  const drA = a.gf - a.gs;
  const drB = b.gf - b.gs;
  if (drB !== drA) return drB - drA;
  return b.gf - a.gf;
}

// Calendario di sola andata (metodo del cerchio): n-1 giornate, n/2 partite
// ciascuna. La squadra in indice 0 resta fissa, le altre ruotano.
function calendario(n) {
  const idx = [...Array(n).keys()];
  const giornate = [];
  for (let r = 0; r < n - 1; r++) {
    const giornata = [];
    for (let i = 0; i < n / 2; i++) {
      const a = idx[i];
      const b = idx[n - 1 - i];
      // alterna casa/trasferta per equilibrare il fattore campo
      giornata.push(i % 2 === 0 ? [a, b] : [b, a]);
    }
    giornate.push(giornata);
    idx.splice(1, 0, idx.pop()); // ruota tenendo fisso idx[0]
  }
  return giornate;
}

// Simula l'intera stagione giornata per giornata e ritorna:
//  - classifica finale ordinata
//  - le partite dell'utente
//  - l'andamento dell'utente (posizione e punti dopo ogni giornata)
export function simulaStagione(squadre) {
  const n = squadre.length;
  const righe = {};
  squadre.forEach((s) => {
    righe[s.id] = rigaVuota(s);
  });

  const partiteUtente = [];
  const andamentoUtente = [];

  // Andata + ritorno (38 giornate per 20 squadre).
  const andata = calendario(n);
  const ritorno = andata.map((g) => g.map(([h, a]) => [a, h]));
  const stagione = [...andata, ...ritorno];

  stagione.forEach((giornata, gi) => {
    for (const [hi, ai] of giornata) {
      const casa = squadre[hi];
      const ospite = squadre[ai];
      const { golCasa, golOspite } = simulaPartita(casa, ospite);
      registra(righe[casa.id], righe[ospite.id], golCasa, golOspite);

      if (casa.utente || ospite.utente) {
        partiteUtente.push({
          giornata: gi + 1,
          casa: casa.nome,
          ospite: ospite.nome,
          golCasa,
          golOspite,
          inCasa: casa.utente,
        });
      }
    }

    // posizione e punti dell'utente al termine della giornata
    const ordinata = Object.values(righe).sort(ordinaClassifica);
    const posizione = ordinata.findIndex((r) => r.utente) + 1;
    andamentoUtente.push({
      g: gi + 1,
      pos: posizione,
      punti: righe["__utente"].punti,
    });
  });

  const classifica = Object.values(righe).sort(ordinaClassifica);
  return { classifica, partiteUtente, andamentoUtente };
}
