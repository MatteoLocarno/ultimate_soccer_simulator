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

const VANTAGGIO_CASA = 0.22;
const GOL_BASE = 1.18;
const BONUS_ALL_BASE = 0.8;
// Il divario di forza tra due squadre (es. un "dream team" col 95 di media
// contro una storica media) veniva applicato senza freni: con una rosa
// fortissima il lambda del Poisson finiva quasi sempre al tetto massimo, IN
// OGNI PARTITA della stagione, facendo esplodere sia i gol di squadra che
// quelli del bomber di turno (osservato: capocannonieri a 50+ gol,
// impossibile). Il divario ora viene attutito (divisore più alto) e
// comunque limitato (DIFF_CAP), e il tetto massimo del lambda per partita è
// più basso: testato su centinaia di stagioni simulate con una rosa-limite
// (tutti giocatori ~90+), il capocannoniere resta sotto i 40 gol (il record
// vero di Serie A a 38 giornate è 36) e la media in un campionato equilibrato
// è ~19-21 gol, in linea con i veri capocannonieri di Serie A.
const DIFF_DIVISORE = 16;
const DIFF_CAP = 1.25;
const LAMBDA_MAX = 2.9;

// Le rose delle squadre storiche arrivano dall'archivio SoFIFA e possono
// avere 30-45 giocatori. Usarle tutte per il lotto gol/assist diluisce troppo
// i bomber tra decine di riserve: si limita la "rosa attiva" (quella usata
// per marcatori/assist) ai migliori per reparto, per un peso realistico.
const ROSA_ATTIVA_MAX = { P: 2, D: 8, C: 8, A: 6 };

function rosaAttiva(giocatori) {
  const perRuolo = { P: [], D: [], C: [], A: [] };
  for (const g of giocatori) {
    const m = macroRuolo(g.ruolo) || "C";
    (perRuolo[m] || perRuolo.C).push(g);
  }
  const risultato = [];
  for (const m of Object.keys(ROSA_ATTIVA_MAX)) {
    const ordinati = [...perRuolo[m]].sort((a, b) => b.overall - a.overall);
    risultato.push(...ordinati.slice(0, ROSA_ATTIVA_MAX[m]));
  }
  return risultato.length ? risultato : giocatori;
}

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

  // Massimo una squadra-stagione per club reale (niente due Milan, due
  // Juve...): si raggruppa per nome squadra e se ne pesca una a caso per
  // ogni club, poi si scelgono 19 club a caso tra quelli disponibili.
  const perClub = new Map();
  for (const s of squadreDB) {
    if (!perClub.has(s.squadra)) perClub.set(s.squadra, []);
    perClub.get(s.squadra).push(s);
  }
  const club = [...perClub.keys()].sort(() => Math.random() - 0.5).slice(0, 19);
  const mescolate = club.map((c) => {
    const opzioni = perClub.get(c);
    return opzioni[Math.floor(Math.random() * opzioni.length)];
  });
  const avversarie = mescolate.map((s) => ({
    id: s.id,
    nome: `${s.squadra} ${s.anno}`.trim(),
    squadra: s.squadra,
    anno: s.anno,
    colore: s.colore,
    forza: forzaDaGiocatori(s.giocatori) + BONUS_ALL_BASE,
    utente: false,
    rosa: rosaAttiva(
      s.giocatori.map((g) => ({
        nome: g.nome,
        cognome: g.cognome,
        ruolo: ruoloPrincipale(g),
        overall: g.overall,
      }))
    ),
  }));

  return [tua, ...avversarie];
}

function golPoisson(lambda, rng = Math.random) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}
const limita = (v, min, max) => Math.max(min, Math.min(max, v));

function simulaPartita(casa, ospite, rng = Math.random) {
  const diff = limita((casa.forza - ospite.forza) / DIFF_DIVISORE, -DIFF_CAP, DIFF_CAP);
  const lc = limita(GOL_BASE + VANTAGGIO_CASA + diff, 0.2, LAMBDA_MAX);
  const lo = limita(GOL_BASE - diff, 0.2, LAMBDA_MAX);
  const fc = 0.82 + rng() * 0.36;
  const fo = 0.82 + rng() * 0.36;
  return { golCasa: golPoisson(lc * fc, rng), golOspite: golPoisson(lo * fo, rng) };
}

// --- attribuzione gol/assist per ruolo + overall ---------------------------
// Oltre al peso per ruolo/overall, si dà un bonus al "titolare designato" di
// ogni reparto (1°, 2°, 3° per overall): senza, con rose ampie (30-45
// giocatori) gli overall dei migliori sono troppo vicini tra loro e i gol si
// spalmano su troppi pochi-utilizzati invece di concentrarsi sui bomber veri
// (in una stagione reale il capocannoniere fa da solo il 30-40% dei gol
// squadra). Per gli assist il bonus è più lieve: nel calcio reale gli assist
// sono più distribuiti tra i giocatori offensivi/creativi.
const PESO_GOL = { A: 1.0, C: 0.25, D: 0.1, P: 0.01 };
const PESO_ASSIST = { A: 0.7, C: 1.0, D: 0.28, P: 0.03 };
// Bonus del "titolare designato" (1°, 2°, 3° per overall del reparto) e
// esponente con cui l'overall pesa nella scelta: valori più alti
// concentrano troppo i gol su un solo giocatore quando la rosa è fortissima
// (osservato: capocannonieri a 50+ gol). Ritarati insieme al tetto lambda
// qui sopra: vedi commento su DIFF_DIVISORE per i numeri di validazione.
const BONUS_RANGO_GOL = [2.8, 1.6, 1.15];
const BONUS_RANGO_ASSIST = [3, 1.8, 1.2];
const ESPONENTE_PESO = 1.7;

// Rango (1°, 2°, 3°… per overall) di ogni giocatore nel proprio reparto,
// dentro una rosa: serve per il bonus "titolare designato".
function rangoPerReparto(rosa) {
  const perReparto = new Map();
  for (const p of rosa) {
    const m = macroRuolo(p.ruolo) || "C";
    if (!perReparto.has(m)) perReparto.set(m, []);
    perReparto.get(m).push(p);
  }
  const rango = new Map();
  for (const lista of perReparto.values()) {
    lista.sort((a, b) => b.overall - a.overall);
    lista.forEach((p, i) => rango.set(p, i));
  }
  return rango;
}

function peso(mappa, bonusRango, p, indiceRango) {
  const m = macroRuolo(p.ruolo) || "C";
  const base = mappa[m] ?? 0.3;
  const bonus = bonusRango[indiceRango] ?? 1;
  return base * Math.pow(Math.max(p.overall, 40) / 100, ESPONENTE_PESO) * bonus;
}
function scegliPesato(rosa, mappa, bonusRango, rango, escludi, rng = Math.random) {
  const pool = escludi ? rosa.filter((p) => p !== escludi) : rosa;
  if (!pool.length) return null;
  const pesi = pool.map((p) => peso(mappa, bonusRango, p, rango.get(p) ?? 99));
  const tot = pesi.reduce((a, b) => a + b, 0);
  if (tot <= 0) return pool[Math.floor(rng() * pool.length)];
  let r = rng() * tot;
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
// Metodo del cerchio per il calendario all'italiana: la squadra in idx[0]
// resta FISSA (solo le altre ruotano), quindi senza correzione gioca in
// casa in OGNI giornata di andata e in trasferta in OGNI giornata di
// ritorno (i%2 vale sempre 0 per lei, essendo sempre i=0) — è sempre
// squadre[0], cioè la squadra dell'utente. Si alterna casa/trasferta per
// lei in base alla parità del turno, così anche la sua squadra ha un
// calendario vero (casa, trasferta, casa, trasferta...) invece di tutte le
// giornate in casa seguite da tutte in trasferta.
function calendario(n) {
  const idx = [...Array(n).keys()];
  const giornate = [];
  for (let r = 0; r < n - 1; r++) {
    const g = [];
    for (let i = 0; i < n / 2; i++) {
      const a = idx[i], b = idx[n - 1 - i];
      let [casa, ospite] = i % 2 === 0 ? [a, b] : [b, a];
      if (i === 0 && r % 2 === 1) [casa, ospite] = [ospite, casa];
      g.push([casa, ospite]);
    }
    giornate.push(g);
    idx.splice(1, 0, idx.pop());
  }
  return giornate;
}

// rng opzionale: il singolo giocatore usa Math.random (default, ogni stagione
// diversa); il PvP passa un RNG seedato dal torneo così TUTTI gli iscritti
// vedono lo stesso identico campionato simulato (classifica ufficiale stabile).
export function simulaStagione(squadre, rng = Math.random) {
  const n = squadre.length;
  const righe = {};
  squadre.forEach((s) => { righe[s.id] = rigaVuota(s); });

  const partiteUtente = [];
  const andamentoUtente = [];
  const giornateSnap = [];
  const tally = new Map(); // chiave giocatore -> { nome, cognome, squadra, gol, assist, utente }
  // rango per reparto di ogni squadra, calcolato una volta sola (non cambia
  // durante la stagione) e riusato ad ogni gol per il bonus "titolare".
  const rangoSquadre = new Map(squadre.map((s) => [s.id, rangoPerReparto(s.rosa || [])]));

  function segna(team, golFatti) {
    if (!golFatti || !team.rosa?.length) return;
    const rango = rangoSquadre.get(team.id);
    for (let i = 0; i < golFatti; i++) {
      const marcatore = scegliPesato(team.rosa, PESO_GOL, BONUS_RANGO_GOL, rango, null, rng);
      if (!marcatore) continue;
      const conAssist = rng() < 0.72;
      const assistman = conAssist ? scegliPesato(team.rosa, PESO_ASSIST, BONUS_RANGO_ASSIST, rango, marcatore, rng) : null;
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
      const { golCasa, golOspite } = simulaPartita(casa, ospite, rng);
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
    // Squadra "seguita": nel singolo giocatore ha id "__utente"; nel PvP è la
    // squadra del visitatore (id diverso). Si prende la riga con utente=true,
    // così l'andamento funziona in entrambi i casi (e non crasha se non c'è).
    const rigaSeguita = ord.find((r) => r.utente);
    andamentoUtente.push({ g: gi + 1, pos, punti: rigaSeguita ? rigaSeguita.punti : 0 });
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
