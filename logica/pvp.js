// ============================================================================
//  DATA LAYER PvP (sfida settimanale online)
// ----------------------------------------------------------------------------
//  Legge/scrive su Supabase (tabelle profiles, pvp_tournaments, pvp_entries,
//  pvp_results — vedi supabase/pvp/*.sql) e costruisce il campionato simulato
//  della domenica. Tutto degrada con grazia: se Supabase non è configurato o
//  le tabelle PvP non esistono ancora, le funzioni tornano stati "non
//  disponibile" invece di rompere l'app.
//
//  Determinismo: la simulazione della domenica gira con un RNG seedato dal
//  torneo (torneo.seed = settimana), così TUTTI gli iscritti vedono la stessa
//  identica classifica. La Edge Function usa lo stesso algoritmo per scrivere
//  la classifica ufficiale (pvp_results) e assegnare lo Scudetto.
// ============================================================================

import { supabase, supabaseAttivo } from "@/lib/supabaseClient";
import { creaRng } from "@/lib/rng";
import {
  simulaStagione,
  bonusAllenatore,
  forzaDaGiocatori,
} from "@/logica/simulazione";

export const pvpAttivo = supabaseAttivo;

// Numero minimo di squadre in campionato: sotto questa soglia si riempie con
// squadre storiche, così anche con pochi iscritti la stagione "sa di Serie A".
const MIN_SQUADRE_CAMPIONATO = 20;
// Bonus forza applicato alle squadre storiche riempitive (come nel singolo
// giocatore: rappresenta l'apporto dell'allenatore/rosa completa).
const BONUS_ALL_STORICHE = 0.8;

// Un errore Supabase che indica "tabelle PvP non ancora create": lo si tratta
// come "PvP non configurato" invece che come guasto.
function tabelleMancanti(error) {
  if (!error) return false;
  const c = error.code || "";
  const m = (error.message || "").toLowerCase();
  return c === "42P01" || c === "PGRST205" || m.includes("does not exist") || m.includes("could not find the table");
}

// --- Profili / nickname -----------------------------------------------------

export async function getProfilo(userId) {
  if (!pvpAttivo || !userId) return { profilo: null, configurato: true };
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, scudetti, partecipazioni, miglior_piazza")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    if (tabelleMancanti(error)) return { profilo: null, configurato: false };
    return { profilo: null, configurato: true, errore: error.message };
  }
  return { profilo: data || null, configurato: true };
}

// Crea/aggiorna il profilo col nickname scelto. Torna { ok } oppure un errore
// leggibile (es. nickname già preso).
export async function salvaNickname(userId, nickname) {
  if (!pvpAttivo || !userId) return { ok: false, errore: "Servizio non disponibile." };
  const pulito = (nickname || "").trim();
  if (pulito.length < 3 || pulito.length > 20) return { ok: false, errore: "Il nickname deve avere da 3 a 20 caratteri." };
  if (!/^[A-Za-z0-9_ ]+$/.test(pulito)) return { ok: false, errore: "Solo lettere, numeri, spazio e underscore." };

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, nickname: pulito }, { onConflict: "id" });
  if (error) {
    if ((error.code || "") === "23505" || (error.message || "").toLowerCase().includes("duplicate"))
      return { ok: false, errore: "Nickname già in uso, scegline un altro." };
    if (tabelleMancanti(error)) return { ok: false, errore: "Il PvP non è ancora configurato lato server." };
    return { ok: false, errore: error.message };
  }
  return { ok: true };
}

// --- Torneo corrente --------------------------------------------------------

export async function getTorneoCorrente() {
  if (!pvpAttivo) return { torneo: null, configurato: true };
  // La funzione SQL crea il torneo della settimana se manca e lo ritorna.
  const { data, error } = await supabase.rpc("pvp_torneo_corrente");
  if (error) {
    if (tabelleMancanti(error) || (error.message || "").toLowerCase().includes("function"))
      return { torneo: null, configurato: false };
    return { torneo: null, configurato: true, errore: error.message };
  }
  // rpc su funzione che ritorna una riga: può arrivare come oggetto o array.
  const torneo = Array.isArray(data) ? data[0] : data;
  return { torneo: torneo || null, configurato: true };
}

// Stato del torneo rispetto ad "adesso": 'aperto' | 'chiuso' | 'concluso'.
// Deriva dai timestamp (non dipende dal cron per l'esperienza in UI).
export function faseTorneo(torneo, adesso = new Date()) {
  if (!torneo) return null;
  const t = adesso.getTime();
  if (t >= new Date(torneo.rivelazione).getTime()) return "concluso";
  if (t >= new Date(torneo.chiusura_iscrizioni).getTime()) return "chiuso";
  return "aperto";
}

// --- Iscrizioni (entries) ---------------------------------------------------

export async function getMiaEntry(tournamentId, userId) {
  if (!pvpAttivo || !tournamentId || !userId) return null;
  const { data, error } = await supabase
    .from("pvp_entries")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error && !tabelleMancanti(error)) console.warn("getMiaEntry:", error.message);
  return data || null;
}

// Forza di una rosa PvP: media overall degli 11 titolari + bonus allenatore.
export function forzaEntry(titolari, allenatore) {
  if (!titolari?.length) return 0;
  const somma = titolari.reduce((t, g) => t + (Number(g.overall) || 0), 0);
  return somma / titolari.length + bonusAllenatore(allenatore || null);
}

// Salva (o aggiorna) l'iscrizione dell'utente al torneo corrente a partire da
// una rosa completata nel draft.
//   dati = { nomeSquadra, colore, modulo, rosa, allenatore, capitano }
// dove `rosa` è la struttura del draft: [{ slot:{x,y}, giocatore:{...} }].
export async function salvaEntry(torneo, userId, nickname, dati) {
  if (!pvpAttivo) return { ok: false, errore: "Servizio non disponibile." };
  if (!torneo) return { ok: false, errore: "Nessun torneo attivo." };
  if (faseTorneo(torneo) !== "aperto") return { ok: false, errore: "Le iscrizioni per questa settimana sono chiuse." };

  const titolari = (dati.rosa || []).map((p) => ({
    nome: p.giocatore.nome,
    cognome: p.giocatore.cognome,
    ruolo: p.giocatore.ruolo,
    overall: p.giocatore.overall,
    x: p.slot?.x ?? null,
    y: p.slot?.y ?? null,
    id: p.giocatore._id ?? null,
  }));
  const allenatore = dati.allenatore
    ? { nome: dati.allenatore.nome, cognome: dati.allenatore.cognome, overall: dati.allenatore.overall }
    : null;

  const riga = {
    tournament_id: torneo.id,
    user_id: userId,
    nickname,
    nome_squadra: (dati.nomeSquadra || "").trim() || nickname,
    colore: dati.colore || "#3f6b3a",
    modulo: dati.modulo?.id || dati.modulo?.nome || null,
    titolari,
    allenatore,
    capitano: dati.capitano || null,
    forza: Math.round(forzaEntry(titolari, allenatore) * 100) / 100,
    aggiornato_il: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("pvp_entries")
    .upsert(riga, { onConflict: "tournament_id,user_id" });
  if (error) {
    if (tabelleMancanti(error)) return { ok: false, errore: "Il PvP non è ancora configurato lato server." };
    return { ok: false, errore: error.message };
  }
  return { ok: true };
}

// Tutte le iscrizioni di un torneo. Prima della chiusura la RLS restituisce
// solo la propria (le altrui restano nascoste per non farsi copiare la rosa).
export async function getEntries(tournamentId) {
  if (!pvpAttivo || !tournamentId) return [];
  const { data, error } = await supabase
    .from("pvp_entries")
    .select("id, user_id, nickname, nome_squadra, colore, modulo, titolari, allenatore, capitano, forza")
    .eq("tournament_id", tournamentId)
    .order("id", { ascending: true });
  if (error) {
    if (!tabelleMancanti(error)) console.warn("getEntries:", error.message);
    return [];
  }
  return data || [];
}

// Classifica ufficiale (scritta dalla Edge Function). Vuota se non ancora
// calcolata: in quel caso la UI ripiega sulla simulazione locale.
export async function getResults(tournamentId) {
  if (!pvpAttivo || !tournamentId) return [];
  const { data, error } = await supabase
    .from("pvp_results")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("posizione", { ascending: true });
  if (error) {
    if (!tabelleMancanti(error)) console.warn("getResults:", error.message);
    return [];
  }
  return data || [];
}

// Classifica generale (albo): utenti per scudetti vinti.
export async function getClassificaGenerale(limite = 100) {
  if (!pvpAttivo) return [];
  const { data, error } = await supabase
    .from("pvp_classifica_generale")
    .select("*")
    .order("posizione", { ascending: true })
    .limit(limite);
  if (error) {
    if (!tabelleMancanti(error)) console.warn("getClassificaGenerale:", error.message);
    return [];
  }
  return data || [];
}

// --- Costruzione + simulazione del campionato (deterministica) --------------

// Mescola in modo deterministico (Fisher–Yates con rng seedato).
function mescolaDet(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Costruisce le squadre del campionato: una per iscritto + eventuali storiche
// riempitive fino a MIN_SQUADRE_CAMPIONATO (e comunque numero pari, richiesto
// dal calendario). `squadreDB` sono le squadre-stagione già caricate dal gioco.
export function costruisciCampionatoPvp(entries, viewerUserId, squadreDB, rng) {
  const squadre = entries.map((e) => {
    const titolari = e.titolari || [];
    return {
      id: `e${e.id}`,
      nome: e.nome_squadra || e.nickname,
      squadra: e.nome_squadra || e.nickname,
      colore: e.colore || "#3f6b3a",
      forza: forzaEntry(titolari, e.allenatore),
      utente: viewerUserId != null && e.user_id === viewerUserId,
      entryId: e.id,
      userId: e.user_id,
      nickname: e.nickname,
      rosa: titolari.map((g) => ({ nome: g.nome, cognome: g.cognome, ruolo: g.ruolo, overall: g.overall })),
    };
  });

  // Dimensione target: almeno MIN_SQUADRE_CAMPIONATO, sempre pari.
  let target = Math.max(MIN_SQUADRE_CAMPIONATO, squadre.length);
  if (target % 2 === 1) target += 1;
  const daRiempire = target - squadre.length;

  if (daRiempire > 0 && Array.isArray(squadreDB) && squadreDB.length) {
    // Una sola squadra-stagione per club, scelta in modo deterministico.
    const perClub = new Map();
    for (const s of squadreDB) {
      if (!perClub.has(s.squadra)) perClub.set(s.squadra, []);
      perClub.get(s.squadra).push(s);
    }
    const club = mescolaDet([...perClub.keys()], rng).slice(0, daRiempire);
    for (const c of club) {
      const opzioni = perClub.get(c);
      const s = opzioni[Math.floor(rng() * opzioni.length)];
      squadre.push({
        id: `s${s.id}`,
        nome: `${s.squadra} ${s.anno}`.trim(),
        squadra: s.squadra,
        colore: s.colore,
        forza: forzaDaGiocatori(s.giocatori) + BONUS_ALL_STORICHE,
        utente: false,
        storica: true,
        rosa: (s.giocatori || []).slice(0, 16).map((g) => ({
          nome: g.nome, cognome: g.cognome,
          ruolo: (g.ruoli && g.ruoli[0]?.ruolo) || g.ruolo || "C",
          overall: g.overall,
        })),
      });
    }
  }

  return squadre;
}

// Simula il campionato del torneo (deterministico). Torna { squadre, ...esito }
// con classifica, marcatori, assist, andamento — pronto per la UI.
export function simulaCampionatoPvp(torneo, entries, viewerUserId, squadreDB) {
  const rng = creaRng(torneo?.seed || torneo?.settimana || "dinastia");
  const squadre = costruisciCampionatoPvp(entries, viewerUserId, squadreDB, rng);
  const esito = simulaStagione(squadre, rng);
  return { squadre, ...esito };
}

// Estrae dalla classifica simulata le sole squadre di iscritti reali, con la
// loro posizione tra gli iscritti (per "sei arrivato Xº su N").
export function classificaIscritti(classifica) {
  const soloUtenti = classifica.filter((r) => !r.storica && String(r.id).startsWith("e"));
  return soloUtenti.map((r, i) => ({ ...r, posIscritti: i + 1 }));
}
