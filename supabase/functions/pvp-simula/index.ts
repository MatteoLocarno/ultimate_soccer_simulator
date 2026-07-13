// ============================================================================
//  EDGE FUNCTION — pvp-simula
// ----------------------------------------------------------------------------
//  Simula il campionato di un torneo PvP (deterministico, seedato dal torneo)
//  e ne registra il risultato ufficiale via pvp_finalizza(): classifica,
//  Scudetto al migliore, statistiche dei profili.
//
//  Invocata da pg_cron alla rivelazione (domenica 12:00) con body
//  { "tournament_id": <id> }. L'algoritmo è IDENTICO a quello del client
//  (logica/simulazione.js + logica/pvp.js + lib/rng.js): stesse squadre iscritte
//  e stesso seme ⇒ stessa identica classifica che vedono gli utenti.
//
//  Deploy:  supabase functions deploy pvp-simula
//  (usa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY dall'ambiente della funzione)
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- RNG deterministico (mirror di lib/rng.js) ------------------------------
function hashStringa(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function creaRng(seme: string | number) {
  let a = (typeof seme === "string" ? hashStringa(seme) : seme >>> 0) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- macroRuolo (mirror di logica/formazione.js) ----------------------------
const MACRO: Record<string, string> = {
  POR: "P", GK: "P", P: "P",
  TD: "D", TS: "D", DC: "D", DCD: "D", DCS: "D", DD: "D", DS: "D", D: "D",
  CC: "C", CDC: "C", MED: "C", REG: "C", MEZ: "C", ED: "C", ES: "C", C: "C",
  AD: "A", AS: "A", ATT: "A", SP: "A", PC: "A", SS: "A", A: "A",
  TRQ: "C", COC: "C",
};
function macroRuolo(r: string | null): string | null {
  if (!r) return null;
  const s = String(r).trim().toUpperCase();
  if (MACRO[s]) return MACRO[s];
  if (s.startsWith("PORT")) return "P";
  if (s.startsWith("DIF") || s.startsWith("TER")) return "D";
  if (s.startsWith("CEN") || s.startsWith("MED") || s.startsWith("EST") || s.startsWith("TREQ")) return "C";
  if (s.startsWith("ATT") || s.startsWith("ALA") || s.startsWith("PUN")) return "A";
  return null;
}

// --- forza (mirror di logica/simulazione.js + logica/pvp.js) ----------------
function bonusAllenatore(all: any): number {
  if (!all) return 0;
  return (all.overall - 82) * 0.3;
}
function forzaEntry(titolari: any[], allenatore: any): number {
  if (!titolari?.length) return 0;
  const somma = titolari.reduce((t, g) => t + (Number(g.overall) || 0), 0);
  return somma / titolari.length + bonusAllenatore(allenatore || null);
}

// --- simulazione (mirror ESATTO di logica/simulazione.js) -------------------
const VANTAGGIO_CASA = 0.22;
const GOL_BASE = 1.18;
const DIFF_DIVISORE = 16;
const DIFF_CAP = 1.25;
const LAMBDA_MAX = 2.9;
const PESO_GOL: Record<string, number> = { A: 1.0, C: 0.25, D: 0.1, P: 0.01 };
const PESO_ASSIST: Record<string, number> = { A: 0.7, C: 1.0, D: 0.28, P: 0.03 };
const BONUS_RANGO_GOL = [2.8, 1.6, 1.15];
const BONUS_RANGO_ASSIST = [3, 1.8, 1.2];
const ESPONENTE_PESO = 1.7;

const limita = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function golPoisson(lambda: number, rng: () => number): number {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}
function simulaPartita(casa: any, ospite: any, rng: () => number) {
  const diff = limita((casa.forza - ospite.forza) / DIFF_DIVISORE, -DIFF_CAP, DIFF_CAP);
  const lc = limita(GOL_BASE + VANTAGGIO_CASA + diff, 0.2, LAMBDA_MAX);
  const lo = limita(GOL_BASE - diff, 0.2, LAMBDA_MAX);
  const fc = 0.82 + rng() * 0.36;
  const fo = 0.82 + rng() * 0.36;
  return { golCasa: golPoisson(lc * fc, rng), golOspite: golPoisson(lo * fo, rng) };
}
function rangoPerReparto(rosa: any[]) {
  const perReparto = new Map<string, any[]>();
  for (const p of rosa) {
    const m = macroRuolo(p.ruolo) || "C";
    if (!perReparto.has(m)) perReparto.set(m, []);
    perReparto.get(m)!.push(p);
  }
  const rango = new Map<any, number>();
  for (const lista of perReparto.values()) {
    lista.sort((a, b) => b.overall - a.overall);
    lista.forEach((p, i) => rango.set(p, i));
  }
  return rango;
}
function peso(mappa: Record<string, number>, bonusRango: number[], p: any, indiceRango: number) {
  const m = macroRuolo(p.ruolo) || "C";
  const base = mappa[m] ?? 0.3;
  const bonus = bonusRango[indiceRango] ?? 1;
  return base * Math.pow(Math.max(p.overall, 40) / 100, ESPONENTE_PESO) * bonus;
}
function scegliPesato(rosa: any[], mappa: Record<string, number>, bonusRango: number[], rango: Map<any, number>, escludi: any, rng: () => number) {
  const pool = escludi ? rosa.filter((p) => p !== escludi) : rosa;
  if (!pool.length) return null;
  const pesi = pool.map((p) => peso(mappa, bonusRango, p, rango.get(p) ?? 99));
  const tot = pesi.reduce((a, b) => a + b, 0);
  if (tot <= 0) return pool[Math.floor(rng() * pool.length)];
  let r = rng() * tot;
  for (let i = 0; i < pool.length; i++) { r -= pesi[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}
function rigaVuota(s: any) { return { ...s, g: 0, v: 0, n: 0, p: 0, gf: 0, gs: 0, punti: 0 }; }
function registra(rc: any, ro: any, gc: number, go: number) {
  rc.g++; ro.g++;
  rc.gf += gc; rc.gs += go; ro.gf += go; ro.gs += gc;
  if (gc > go) { rc.v++; rc.punti += 3; ro.p++; }
  else if (gc < go) { ro.v++; ro.punti += 3; rc.p++; }
  else { rc.n++; ro.n++; rc.punti++; ro.punti++; }
}
function ordinaClassifica(a: any, b: any) {
  if (b.punti !== a.punti) return b.punti - a.punti;
  const da = a.gf - a.gs, db = b.gf - b.gs;
  if (db !== da) return db - da;
  return b.gf - a.gf;
}
function calendario(n: number) {
  const idx = [...Array(n).keys()];
  const giornate: number[][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const g: number[][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = idx[i], b = idx[n - 1 - i];
      let casa = a, ospite = b;
      if (i % 2 !== 0) { casa = b; ospite = a; }
      if (i === 0 && r % 2 === 1) { const tmp = casa; casa = ospite; ospite = tmp; }
      g.push([casa, ospite]);
    }
    giornate.push(g);
    idx.splice(1, 0, idx.pop()!);
  }
  return giornate;
}
function simulaStagione(squadre: any[], rng: () => number) {
  const n = squadre.length;
  const righe: Record<string, any> = {};
  squadre.forEach((s) => { righe[s.id] = rigaVuota(s); });
  const rangoSquadre = new Map(squadre.map((s) => [s.id, rangoPerReparto(s.rosa || [])]));

  function segna(team: any, golFatti: number) {
    if (!golFatti || !team.rosa?.length) return;
    const rango = rangoSquadre.get(team.id)!;
    for (let i = 0; i < golFatti; i++) {
      const marcatore = scegliPesato(team.rosa, PESO_GOL, BONUS_RANGO_GOL, rango, null, rng);
      if (!marcatore) continue;
      const conAssist = rng() < 0.72;
      if (conAssist) scegliPesato(team.rosa, PESO_ASSIST, BONUS_RANGO_ASSIST, rango, marcatore, rng);
    }
  }

  const andata = calendario(n);
  const ritorno = andata.map((g) => g.map(([h, a]) => [a, h]));
  const stagione = [...andata, ...ritorno];
  stagione.forEach((giornata) => {
    for (const [hi, ai] of giornata) {
      const casa = squadre[hi], ospite = squadre[ai];
      const { golCasa, golOspite } = simulaPartita(casa, ospite, rng);
      registra(righe[casa.id], righe[ospite.id], golCasa, golOspite);
      segna(casa, golCasa);
      segna(ospite, golOspite);
    }
  });
  return Object.values(righe).sort(ordinaClassifica);
}

// --- costruzione campionato (mirror di logica/pvp.js) -----------------------
function squadraRiposo(forza: number) {
  const ov = Math.round(forza);
  const ruoli = ["P", "D", "D", "D", "D", "C", "C", "C", "A", "A", "A"];
  return {
    id: "__riposo", nome: "Riposo", squadra: "Riposo", colore: "#8a774f",
    forza, utente: false, storica: true,
    rosa: ruoli.map((r, i) => ({ nome: "Riserva", cognome: String(i + 1), ruolo: r, overall: ov })),
  };
}
function costruisciCampionato(entries: any[]) {
  const squadre = entries.map((e) => {
    const titolari = e.titolari || [];
    return {
      id: `e${e.id}`,
      nome: e.nome_squadra || e.nickname,
      colore: e.colore || "#3f6b3a",
      forza: forzaEntry(titolari, e.allenatore),
      entryId: e.id, userId: e.user_id, nickname: e.nickname, storica: false,
      rosa: titolari.map((g: any) => ({ nome: g.nome, cognome: g.cognome, ruolo: g.ruolo, overall: g.overall })),
    };
  });
  if (squadre.length % 2 === 1) {
    const forze = squadre.map((s) => s.forza).sort((a, b) => a - b);
    const mediana = forze.length ? forze[Math.floor(forze.length / 2)] : 75;
    squadre.push(squadraRiposo(mediana) as any);
  }
  return squadre;
}

// --- handler ----------------------------------------------------------------
Deno.serve(async (req) => {
  try {
    const { tournament_id } = await req.json().catch(() => ({}));
    if (!tournament_id) {
      return json({ error: "tournament_id mancante" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: torneo, error: eT } = await supabase
      .from("pvp_tournaments").select("*").eq("id", tournament_id).maybeSingle();
    if (eT) throw eT;
    if (!torneo) return json({ error: "torneo inesistente" }, 404);
    if (torneo.stato === "concluso") return json({ ok: true, gia_concluso: true });
    if (new Date() < new Date(torneo.rivelazione)) return json({ ok: false, motivo: "non ancora ora" });

    const { data: entries, error: eE } = await supabase
      .from("pvp_entries")
      .select("id, user_id, nickname, nome_squadra, colore, titolari, allenatore")
      .eq("tournament_id", tournament_id)
      .order("id", { ascending: true });
    if (eE) throw eE;

    // Nessun iscritto: chiudi senza campione.
    if (!entries || entries.length === 0) {
      await supabase.rpc("pvp_finalizza", {
        p_torneo: tournament_id, p_campione: null, p_campione_nick: null, p_standings: [],
      });
      return json({ ok: true, iscritti: 0 });
    }

    // Simulazione deterministica (identica al client).
    const rng = creaRng(torneo.seed || torneo.settimana || "dinastia");
    const squadre = costruisciCampionato(entries);
    const classifica = simulaStagione(squadre, rng);

    // Standings + posizione tra i soli iscritti.
    let posIscritti = 0;
    const standings = classifica.map((r: any, i: number) => {
      const isUtente = !r.storica;
      if (isUtente) posIscritti++;
      return {
        posizione: i + 1,
        pos_iscritti: isUtente ? posIscritti : null,
        entry_id: r.entryId ?? null,
        user_id: r.userId ?? null,
        nickname: r.nickname ?? null,
        nome_squadra: r.nome,
        colore: r.colore,
        is_utente: isUtente,
        punti: r.punti, giocate: r.g, vinte: r.v, pareggiate: r.n, perse: r.p, gf: r.gf, gs: r.gs,
      };
    });

    const campione = standings.find((s) => s.is_utente && s.pos_iscritti === 1) || null;

    const { error: eF } = await supabase.rpc("pvp_finalizza", {
      p_torneo: tournament_id,
      p_campione: campione?.user_id ?? null,
      p_campione_nick: campione?.nickname ?? null,
      p_standings: standings,
    });
    if (eF) throw eF;

    return json({ ok: true, iscritti: entries.length, campione: campione?.nickname ?? null });
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json" },
  });
}
