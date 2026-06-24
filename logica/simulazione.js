// ============================================================================
//  SIMULAZIONE DEL CAMPIONATO
// ----------------------------------------------------------------------------
//  20 squadre, andata/ritorno (38 giornate, calendario col metodo del cerchio).
//  Produce: classifica finale, partite dell'utente, andamento per giornata,
//  snapshot di classifica dopo ogni giornata (per la sim live animata) e le
//  classifiche marcatori/assist (gol/assist attribuiti per ruolo + overall).
// ============================================================================

import { SQUADRE } from "@/dati/squadre";
import { macroRuolo } from "@/logica/formazione";

const VANTAGGIO_CASA = 0.3;
const GOL_BASE = 1.3;
const BONUS_ALL_BASE = 0.8;

export function bonusAllenatore(allenatore) {
  if (!allenatore) return 0;
  return (allenatore.overall - 82) * 0.3;
}

export function forzaDaGiocatori(giocatori) {
  const ordinati = [...giocatori].sort((a, b) => b.overall - a.overall);
  const migliori = ordinati.slice(0, 11);
  return migliori.reduce((t, g) => t + g.overall, 0) / migliori.length;
}

export function forzaUtente(rosa, allenatore) {
  const titolari = rosa.filter((p) => p.slot.tipo === "titolare");
  const somma = titolari.reduce((t, p) => t + p.giocatore.overall, 0);
  return somma / titolari.length + bonusAllenatore(allenatore);
}

// Ruolo "principale" (quello col miglior overall) di un giocatore del DB.
function ruoloPrincipale(g) {
  if (!g.ruoli || !g.ruoli.length) return g.ruolo || "C";
  return g.ruoli.reduce((a, b) => (b.overall > a.overall ? b : a)).ruolo;
}

// Costruisce le 20 squadre: la tua + 19 storiche casuali, ognuna con la "rosa"
// (serve per attribuire gol/assist).
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
    colore,
    forza: forzaUtente(rosaUtente, allenatore),
    utente: true,
    rosa: rosaUtente.map((p) => ({
      nome: p.giocatore.nome,
      cognome: p.giocatore.cognome,
      ruolo: p.giocatore.ruolo,
      overall: p.giocatore.overall,
    })),
  };

  const mescolate = [...squadreDB].sort(() => Math.random() - 0.5).slice(0, 19);
  const avversarie = mescolate.map((s) => ({
    id: s.id,
    nome: `${s.squadra} ${s.anno}`.trim(),
    squadra: s.squadra,
    anno: s.anno,
    colore: s.colore,
    forza: forzaDaGiocatori(s.giocatori) + BONUS_ALL_BASE,
    utente: false,
    rosa: s.giocatori.map((g) => ({
      nome: g.nome,
      cognome: g.cognome,
      ruolo: ruoloPrincipale(g),
      overall: g.overall,
    })),
  }));

  return [tua, ...avversarie];
}

function golPoisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}
const limita = (v, min, max) => Math.max(min, Math.min(max, v));

function simulaPartita(casa, ospite) {
  const diff = (casa.forza - ospite.forza) / 7;
  const lc = limita(GOL_BASE + VANTAGGIO_CASA + diff, 0.2, 5.5);
  const lo = limita(GOL_BASE - diff, 0.2, 5.5);
  const fc = 0.82 + Math.random() * 0.36;
  const fo = 0.82 + Math.random() * 0.36;
  return { golCasa: golPoisson(lc * fc), golOspite: golPoisson(lo * fo) };
}

// --- attribuzione gol/assist per ruolo + overall ---------------------------
const PESO_GOL = { A: 1.0, C: 0.42, D: 0.12, P: 0.01 };
const PESO_ASSIST = { A: 0.7, C: 1.0, D: 0.32, P: 0.03 };

function peso(mappa, p) {
  const m = macroRuolo(p.ruolo) || "C";
  const base = mappa[m] ?? 0.3;
  return base * Math.pow(Math.max(p.overall, 40) / 100, 2);
}
function scegliPesato(rosa, mappa, escludi) {
  const pool = escludi ? rosa.filter((p) => p !== escludi) : rosa;
  if (!pool.length) return null;
  const pesi = pool.map((p) => peso(mappa, p));
  const tot = pesi.reduce((a, b) => a + b, 0);
  if (tot <= 0) return pool[Math.floor(Math.random() * pool.length)];
  let r = Math.random() * tot;
  for (let i = 0; i < pool.length; i++) {
    r -= pesi[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function rigaVuota(s) {
  return { ...s, g: 0, v: 0, n: 0, p: 0, gf: 0, gs: 0, punti: 0 };
}
function registra(rc, ro, gc, go) {
  rc.g++; ro.g++;
  rc.gf += gc; rc.gs += go; ro.gf += go; ro.gs += gc;
  if (gc > go) { rc.v++; rc.punti += 3; ro.p++; }
  else if (gc < go) { ro.v++; ro.punti += 3; rc.p++; }
  else { rc.n++; ro.n++; rc.punti++; ro.punti++; }
}
function ordinaClassifica(a, b) {
  if (b.punti !== a.punti) return b.punti - a.punti;
  const da = a.gf - a.gs, db = b.gf - b.gs;
  if (db !== da) return db - da;
  return b.gf - a.gf;
}
function calendario(n) {
  const idx = [...Array(n).keys()];
  const giornate = [];
  for (let r = 0; r < n - 1; r++) {
    const g = [];
    for (let i = 0; i < n / 2; i++) {
      const a = idx[i], b = idx[n - 1 - i];
      g.push(i % 2 === 0 ? [a, b] : [b, a]);
    }
    giornate.push(g);
    idx.splice(1, 0, idx.pop());
  }
  return giornate;
}

export function simulaStagione(squadre) {
  const n = squadre.length;
  const righe = {};
  squadre.forEach((s) => { righe[s.id] = rigaVuota(s); });

  const partiteUtente = [];
  const andamentoUtente = [];
  const giornateSnap = [];
  const tally = new Map(); // chiave giocatore -> { nome, cognome, squadra, gol, assist, utente }

  function segna(team, golFatti) {
    if (!golFatti || !team.rosa?.length) return;
    for (let i = 0; i < golFatti; i++) {
      const marcatore = scegliPesato(team.rosa, PESO_GOL, null);
      if (!marcatore) continue;
      const conAssist = Math.random() < 0.72;
      const assistman = conAssist ? scegliPesato(team.rosa, PESO_ASSIST, marcatore) : null;
      for (const [p, tipo] of [[marcatore, "gol"], [assistman, "assist"]]) {
        if (!p) continue;
        const k = `${team.id}__${p.nome}_${p.cognome}`;
        let t = tally.get(k);
        if (!t) { t = { nome: p.nome, cognome: p.cognome, squadra: team.nome, gol: 0, assist: 0, utente: team.utente }; tally.set(k, t); }
        t[tipo]++;
      }
    }
  }

  const andata = calendario(n);
  const ritorno = andata.map((g) => g.map(([h, a]) => [a, h]));
  const stagione = [...andata, ...ritorno];

  stagione.forEach((giornata, gi) => {
    for (const [hi, ai] of giornata) {
      const casa = squadre[hi], ospite = squadre[ai];
      const { golCasa, golOspite } = simulaPartita(casa, ospite);
      registra(righe[casa.id], righe[ospite.id], golCasa, golOspite);
      segna(casa, golCasa);
      segna(ospite, golOspite);
      if (casa.utente || ospite.utente) {
        partiteUtente.push({
          giornata: gi + 1, casa: casa.nome, ospite: ospite.nome,
          golCasa, golOspite, inCasa: casa.utente,
        });
      }
    }
    const ord = Object.values(righe).sort(ordinaClassifica);
    const pos = ord.findIndex((r) => r.utente) + 1;
    andamentoUtente.push({ g: gi + 1, pos, punti: righe["__utente"].punti });
    giornateSnap.push(
      ord.map((r) => ({
        id: r.id, nome: r.nome, colore: r.colore, utente: r.utente,
        g: r.g, punti: r.punti, gf: r.gf, gs: r.gs,
      }))
    );
  });

  const classifica = Object.values(righe).sort(ordinaClassifica);

  const elenco = [...tally.values()];
  const marcatori = elenco.filter((t) => t.gol > 0).sort((a, b) => b.gol - a.gol || b.assist - a.assist).slice(0, 12);
  const assist = elenco.filter((t) => t.assist > 0).sort((a, b) => b.assist - a.assist || b.gol - a.gol).slice(0, 12);

  return { classifica, partiteUtente, andamentoUtente, giornate: giornateSnap, marcatori, assist };
}
