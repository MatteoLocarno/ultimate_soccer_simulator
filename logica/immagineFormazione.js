// ============================================================================
//  IMMAGINE CONDIVISIBILE DELLA FORMAZIONE (PNG)
// ----------------------------------------------------------------------------
//  Disegna su <canvas> una card verticale "curata" con la formazione finale
//  (stemma, titolo, campo con gli 11 titolari + overall, capitano, allenatore,
//  forza squadra) e il rimando al sito, pensata per essere condivisa con gli
//  amici. Tutto in Canvas 2D: nessuna dipendenza esterna, resa identica su
//  qualsiasi dispositivo (indipendente dalla dimensione dello schermo).
// ============================================================================

const SITO = "dinastiascudetto.netlify.app";

// Palette allineata al tema vintage del sito (globals.css).
const COL = {
  sfondo: "#e7d9b4",
  pannello: "#f1e7ca",
  bordo: "#b5a274",
  bordoScuro: "#8a774f",
  testo: "#2d2417",
  testoSoft: "#7c6a4d",
  verde: "#44663a",
  verdeScuro: "#2f4a28",
  oro: "#a8761a",
  rosso: "#8f2f24",
  bianco: "#f3ecd2",
};

// Font condensato del sito (Oswald, auto-hostato). Fallback robusti se, per
// qualche motivo, non è ancora disponibile al momento del disegno.
const FONT = '"Oswald", "Arial Narrow", Impact, sans-serif';
const FONT_SERIF = 'Georgia, "Times New Roman", serif';

// Colore del disco overall in base alla fascia (come classeOvr nel reveal).
function fasciaOvr(ovr) {
  if (ovr >= 88) return { disco: COL.oro, testo: COL.bianco, bordo: "#6e4d10" };
  if (ovr >= 82) return { disco: COL.verde, testo: COL.bianco, bordo: COL.verdeScuro };
  return { disco: COL.pannello, testo: COL.testo, bordo: COL.bordoScuro };
}

const cognomeDi = (p) => p.giocatore.cognome || p.giocatore.nome;

// Assicura che il font Oswald sia caricato prima di disegnare (altrimenti la
// prima generazione userebbe il fallback e apparirebbe diversa dal sito).
async function pronto() {
  try {
    if (document.fonts) {
      await Promise.all([
        document.fonts.load('700 40px "Oswald"'),
        document.fonts.load('600 30px "Oswald"'),
        document.fonts.load('500 24px "Oswald"'),
      ]);
      await document.fonts.ready;
    }
  } catch {
    // Font API non disponibile: si prosegue con i fallback.
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Carica il logo VERO del sito (public/logo.svg) come immagine, così lo stemma
// nel PNG è identico a quello del gioco (stelle sopra, scudo tricolore sotto).
// Si rimuove lo sfondo quadrato dell'SVG per farlo fondere col pannello.
let _logoPromise = null;
function ottieniLogo() {
  if (!_logoPromise) {
    _logoPromise = (async () => {
      try {
        const res = await fetch("/logo.svg");
        let txt = await res.text();
        txt = txt.replace(/<rect[^>]*rx="96"[^>]*\/>/, ""); // via lo sfondo quadrato
        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(txt);
        const img = new Image();
        await new Promise((ok, no) => { img.onload = () => ok(); img.onerror = no; img.src = url; });
        return img;
      } catch {
        return null;
      }
    })();
  }
  return _logoPromise;
}

// Disegna il logo centrato in (cx, cy) con l'altezza indicata (l'emblema
// stelle+scudo nell'SVG occupa y≈72..446 → ~374 unità, centro verticale ~259).
function mettiLogo(ctx, logo, cx, cy, altezza) {
  if (logo) {
    const sc = altezza / 374;
    ctx.drawImage(logo, cx - 256 * sc, cy - 259 * sc, 512 * sc, 512 * sc);
  } else {
    disegnaStemma(ctx, cx, cy, altezza * 0.53);
  }
}

// Stemma: scudo tricolore con 3 stelline dorate (versione essenziale del logo).
function disegnaStemma(ctx, cx, cy, w) {
  const h = w * 1.16;
  const top = cy - h / 2;
  const left = cx - w / 2;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + w, top);
  ctx.lineTo(left + w, top + h * 0.52);
  ctx.quadraticCurveTo(left + w, top + h * 0.9, cx, top + h);
  ctx.quadraticCurveTo(left, top + h * 0.9, left, top + h * 0.52);
  ctx.closePath();
  ctx.clip();
  const terzo = w / 3;
  ctx.fillStyle = COL.verde;
  ctx.fillRect(left, top, terzo, h);
  ctx.fillStyle = COL.bianco;
  ctx.fillRect(left + terzo, top, terzo, h);
  ctx.fillStyle = COL.rosso;
  ctx.fillRect(left + 2 * terzo, top, terzo, h);
  ctx.restore();
  // Bordo scudo
  ctx.save();
  ctx.lineWidth = w * 0.05;
  ctx.strokeStyle = COL.bordoScuro;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + w, top);
  ctx.lineTo(left + w, top + h * 0.52);
  ctx.quadraticCurveTo(left + w, top + h * 0.9, cx, top + h);
  ctx.quadraticCurveTo(left, top + h * 0.9, left, top + h * 0.52);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  // 3 stelle dorate allineate nella parte alta dello scudo
  const sy = top + h * 0.3;
  const sr = w * 0.115;
  for (let i = -1; i <= 1; i++) stella(ctx, cx + i * w * 0.26, sy, sr, COL.oro);
}

function stella(ctx, cx, cy, r, colore) {
  ctx.save();
  ctx.fillStyle = colore;
  // contorno scuro sottile per staccare la stella dalla banda bianca
  ctx.strokeStyle = "rgba(45,36,23,0.55)";
  ctx.lineWidth = r * 0.12;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const aOut = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const aIn = aOut + Math.PI / 5;
    if (i === 0) ctx.moveTo(cx + Math.cos(aOut) * r, cy + Math.sin(aOut) * r);
    else ctx.lineTo(cx + Math.cos(aOut) * r, cy + Math.sin(aOut) * r);
    ctx.lineTo(cx + Math.cos(aIn) * r * 0.5, cy + Math.sin(aIn) * r * 0.5);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Testo centrato eventualmente spezzato su 2 righe se troppo lungo.
function testoCampo(ctx, testo, cx, y, maxW, lineH) {
  const parole = String(testo).split(" ");
  const righe = [];
  let corrente = "";
  for (const parola of parole) {
    const prova = corrente ? corrente + " " + parola : parola;
    if (ctx.measureText(prova).width > maxW && corrente) {
      righe.push(corrente);
      corrente = parola;
    } else {
      corrente = prova;
    }
  }
  if (corrente) righe.push(corrente);
  const uso = righe.slice(0, 2);
  uso.forEach((r, i) => ctx.fillText(r, cx, y + i * lineH));
  return uso.length;
}

// ── Disegno principale ──────────────────────────────────────────────────────
export async function generaCanvasFormazione({ titolari, capitanoId, allenatore, modulo, forza }) {
  await pronto();
  const logo = await ottieniLogo();

  const W = 1080;
  const H = 1500;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Sfondo + cornice doppia (stile card del sito)
  ctx.fillStyle = COL.sfondo;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = COL.pannello;
  roundRect(ctx, 26, 26, W - 52, H - 52, 22);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COL.bordo;
  roundRect(ctx, 40, 40, W - 80, H - 80, 16);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = COL.bordoScuro;
  roundRect(ctx, 48, 48, W - 96, H - 96, 12);
  ctx.stroke();

  // Header: stemma (logo vero) + titolo
  mettiLogo(ctx, logo, W / 2, 150, 150);
  ctx.fillStyle = COL.testo;
  ctx.font = `700 58px ${FONT}`;
  ctx.fillText("DINASTIA SCUDETTO", W / 2, 262);
  ctx.fillStyle = COL.testoSoft;
  ctx.font = `500 22px ${FONT}`;
  ctx.fillText("LA MIA FORMAZIONE — DRAFT STORICO DI SERIE A", W / 2, 300);

  // Strip modulo + forza (ben staccata dal sottotitolo)
  const stripY = 350;
  ctx.fillStyle = COL.oro;
  ctx.font = `600 32px ${FONT}`;
  ctx.fillText(`MODULO ${modulo?.nome || ""}`.trim(), W / 2 - 155, stripY);
  // pastiglia forza
  const fx = W / 2 + 150;
  ctx.fillStyle = COL.verde;
  roundRect(ctx, fx - 130, stripY - 24, 260, 48, 24);
  ctx.fill();
  ctx.fillStyle = COL.bianco;
  ctx.font = `600 23px ${FONT}`;
  ctx.fillText("FORZA", fx - 58, stripY);
  ctx.font = `700 32px ${FONT}`;
  ctx.fillText(String(forza), fx + 52, stripY);

  // ── Campo ──
  const pX = 70;
  const pY = 386;
  const pW = W - 140;
  const pH = 830;
  // manto erboso a strisce
  const grad = ctx.createLinearGradient(0, pY, 0, pY + pH);
  grad.addColorStop(0, "#4e7040");
  grad.addColorStop(1, "#3c5a32");
  ctx.fillStyle = grad;
  roundRect(ctx, pX, pY, pW, pH, 16);
  ctx.fill();
  ctx.save();
  roundRect(ctx, pX, pY, pW, pH, 16);
  ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  const strisce = 8;
  for (let i = 0; i < strisce; i += 2) {
    ctx.fillRect(pX, pY + (pH / strisce) * i, pW, pH / strisce);
  }
  ctx.restore();
  // linee campo
  ctx.strokeStyle = "rgba(243,236,210,0.55)";
  ctx.lineWidth = 3;
  roundRect(ctx, pX + 14, pY + 14, pW - 28, pH - 28, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pX + 14, pY + pH / 2);
  ctx.lineTo(pX + pW - 14, pY + pH / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(pX + pW / 2, pY + pH / 2, 70, 0, Math.PI * 2);
  ctx.stroke();
  // aree di rigore (alto = attacco avversario, basso = propria porta)
  const areaW = pW * 0.44;
  const areaH = pH * 0.14;
  ctx.strokeRect(pX + (pW - areaW) / 2, pY + 14, areaW, areaH);
  ctx.strokeRect(pX + (pW - areaW) / 2, pY + pH - 14 - areaH, areaW, areaH);

  // Token dei giocatori. Le coordinate delle formazioni non coprono sempre
  // tutta l'altezza (attacco ~24, porta ~86 su 0-100): normalizzo la y dei
  // titolari sull'altezza utile del campo, così la squadra riempie il campo
  // invece di ammassarsi in basso lasciando un vuoto in alto.
  const padX = 82;
  const ys = titolari.map((p) => p.slot.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanY = maxY - minY || 1;
  const yTop = pY + 62; // attaccanti appena sotto la linea alta
  const yBot = pY + pH - 96; // portiere, con spazio sotto per la targhetta
  const r = 38;

  // Posizioni sullo schermo di ogni titolare (per calcolare le distanze).
  const punti = titolari.map((p) => ({
    p,
    cx: pX + padX + ((pW - padX * 2) * p.slot.x) / 100,
    cy: yTop + ((p.slot.y - minY) / spanY) * (yBot - yTop),
  }));

  // Larghezza massima della targhetta per ciascun giocatore: mai oltre lo
  // spazio disponibile fino al vicino di FILA (stessa altezza), così due nomi
  // affiancati non si sovrappongono mai (es. i 5 di centrocampo del 3-5-2).
  function larghezzaMax(i) {
    let gap = Infinity;
    for (let j = 0; j < punti.length; j++) {
      if (j === i) continue;
      if (Math.abs(punti[i].cy - punti[j].cy) < 58) {
        gap = Math.min(gap, Math.abs(punti[i].cx - punti[j].cx));
      }
    }
    if (!Number.isFinite(gap)) return 156;
    return Math.max(58, Math.min(156, gap - 10));
  }

  // 1) dischi + overall + fascia capitano
  punti.forEach(({ p, cx, cy }) => {
    const ovr = p.giocatore.overall;
    const f = fasciaOvr(ovr);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = f.disco;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = f.bordo;
    ctx.stroke();
    ctx.fillStyle = f.testo;
    ctx.font = `700 34px ${FONT}`;
    ctx.fillText(String(ovr), cx, cy + 2);
    if (capitanoId != null && p.giocatore._id === capitanoId) {
      const bx = cx + r * 0.8;
      const by = cy - r * 0.8;
      ctx.beginPath();
      ctx.arc(bx, by, 14, 0, Math.PI * 2);
      ctx.fillStyle = COL.oro;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#6e4d10";
      ctx.stroke();
      ctx.fillStyle = COL.bianco;
      ctx.font = `700 17px ${FONT}`;
      ctx.fillText("C", bx, by + 1);
    }
  });

  // 2) targhette col cognome (dopo i dischi, così stanno sempre sopra)
  punti.forEach(({ p, cx, cy }, i) => {
    const nome = cognomeDi(p).toUpperCase();
    const maxW = larghezzaMax(i);
    let fs = 24;
    ctx.font = `600 ${fs}px ${FONT}`;
    while (ctx.measureText(nome).width + 16 > maxW && fs > 13) {
      fs -= 1;
      ctx.font = `600 ${fs}px ${FONT}`;
    }
    const tw = Math.min(maxW, ctx.measureText(nome).width + 16);
    const plY = cy + r + 18;
    ctx.fillStyle = COL.pannello;
    roundRect(ctx, cx - tw / 2, plY - 17, tw, 33, 7);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = COL.bordoScuro;
    ctx.stroke();
    ctx.fillStyle = COL.testo;
    ctx.fillText(nome, cx, plY);
  });

  // ── Allenatore ──
  if (allenatore) {
    const aY = pY + pH + 50; // ~1272
    ctx.fillStyle = COL.testoSoft;
    ctx.font = `500 23px ${FONT}`;
    ctx.fillText("ALLENATORE", W / 2, aY - 22);
    ctx.fillStyle = COL.testo;
    ctx.font = `700 38px ${FONT}`;
    ctx.fillText(
      `${allenatore.nome ? allenatore.nome + " " : ""}${allenatore.cognome || ""}`.toUpperCase(),
      W / 2,
      aY + 14
    );
  }

  disegnaFooter(ctx, W, H);
  return canvas;
}

// Sfondo + cornice doppia + testata (stemma, titolo, sottotitolo). Condivisa
// tra le card (formazione e bilancio).
function disegnaCorniceETesta(ctx, W, H, sottotitolo, logo) {
  ctx.fillStyle = COL.sfondo;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = COL.pannello;
  roundRect(ctx, 26, 26, W - 52, H - 52, 22);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COL.bordo;
  roundRect(ctx, 40, 40, W - 80, H - 80, 16);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = COL.bordoScuro;
  roundRect(ctx, 48, 48, W - 96, H - 96, 12);
  ctx.stroke();

  mettiLogo(ctx, logo, W / 2, 150, 150);
  ctx.textAlign = "center";
  ctx.fillStyle = COL.testo;
  ctx.font = `700 58px ${FONT}`;
  ctx.fillText("DINASTIA SCUDETTO", W / 2, 262);
  ctx.fillStyle = COL.testoSoft;
  ctx.font = `500 22px ${FONT}`;
  ctx.fillText(sottotitolo, W / 2, 300);
}

function disegnaFooter(ctx, W, H) {
  const dividerY = H - 138;
  ctx.beginPath();
  ctx.moveTo(120, dividerY);
  ctx.lineTo(W - 120, dividerY);
  ctx.strokeStyle = COL.bordo;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = COL.oro;
  ctx.font = `700 42px ${FONT}`;
  ctx.fillText(SITO, W / 2, H - 92);
  ctx.fillStyle = COL.testoSoft;
  ctx.font = `italic 25px ${FONT_SERIF}`;
  ctx.fillText("Il draft delle leggende della Serie A", W / 2, H - 56);
}

async function avviaDownload(canvas, nomeFile) {
  const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

// Genera il PNG e ne avvia il download. Ritorna true se riuscito.
export async function scaricaFormazionePng(dati) {
  const canvas = await generaCanvasFormazione(dati);
  return avviaDownload(canvas, "dinastia-scudetto-formazione.png");
}

// ── Card del bilancio della dinastia ────────────────────────────────────────
function boxStat(ctx, x, y, w, h, valore, etichetta) {
  ctx.fillStyle = "rgba(168,118,26,0.10)";
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = COL.bordo;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = COL.testo;
  ctx.font = `700 46px ${FONT}`;
  ctx.fillText(String(valore), x + w / 2, y + h * 0.42);
  ctx.fillStyle = COL.testoSoft;
  ctx.font = `500 18px ${FONT}`;
  ctx.fillText(etichetta.toUpperCase(), x + w / 2, y + h * 0.76);
}

function boxMvp(ctx, x, y, w, h, etichetta, nome, valore) {
  ctx.fillStyle = COL.pannello;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = COL.verdeScuro;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = COL.verde;
  ctx.font = `600 20px ${FONT}`;
  ctx.fillText(etichetta.toUpperCase(), x + w / 2, y + 30);
  ctx.fillStyle = COL.testo;
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText(nome, x + w / 2, y + 68);
  ctx.fillStyle = COL.oro;
  ctx.font = `600 24px ${FONT}`;
  ctx.fillText(valore, x + w / 2, y + h - 22);
}

export async function generaCanvasDinastia(d) {
  await pronto();
  const logo = await ottieniLogo();
  const W = 1080;
  const H = 1500;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "middle";

  disegnaCorniceETesta(ctx, W, H, "IL BILANCIO DELLA DINASTIA", logo);

  // Verdetto + nome squadra
  const scudetti = d.scudetti || 0;
  ctx.textAlign = "center";
  ctx.fillStyle = COL.oro;
  ctx.font = `700 40px ${FONT}`;
  ctx.fillText(
    (scudetti >= 3 ? "DINASTIA LEGGENDARIA" : scudetti >= 1 ? (scudetti === 1 ? "CAMPIONI D'ITALIA" : `${scudetti} VOLTE CAMPIONI`) : "LA DINASTIA CONTINUA"),
    W / 2, 348
  );
  ctx.fillStyle = COL.testoSoft;
  ctx.font = `500 24px ${FONT}`;
  ctx.fillText(`${(d.nomeSquadra || "").toUpperCase()} · ${d.stagioni} STAGIONI`, W / 2, 388);

  // Scudetti (scudi dorati)
  if (scudetti > 0) {
    const mostra = Math.min(scudetti, 6);
    const passo = 78;
    const startX = W / 2 - ((mostra - 1) * passo) / 2;
    for (let i = 0; i < mostra; i++) mettiLogo(ctx, logo, startX + i * passo, 452, 92);
    if (scudetti > 6) {
      ctx.fillStyle = COL.testo;
      ctx.font = `700 30px ${FONT}`;
      ctx.fillText(`×${scudetti}`, W / 2 + (mostra * passo) / 2 + 10, 452);
    }
  } else {
    ctx.fillStyle = COL.testoSoft;
    ctx.font = `italic 24px ${FONT_SERIF}`;
    ctx.fillText("Nessuno scudetto, ma la storia è appena iniziata.", W / 2, 452);
  }

  // Stat 4 box
  const gy = 512;
  const gh = 116;
  const gap = 18;
  const gw = (W - 120 - gap * 3) / 4;
  const stats = [
    [d.stagioni, "Stagioni"],
    [scudetti, "Scudetti"],
    [Number.isFinite(d.migliorPiazz) ? `${d.migliorPiazz}°` : "—", "Miglior pos."],
    [d.puntiTotali, "Punti"],
  ];
  stats.forEach(([v, l], i) => boxStat(ctx, 60 + i * (gw + gap), gy, gw, gh, v, l));

  // MVP: capocannoniere + assistman
  const my = 664;
  const mh = 128;
  const mw = (W - 120 - gap) / 2;
  boxMvp(ctx, 60, my, mw, mh, "⚽ Capocannoniere",
    d.bomber ? `${d.bomber.nome} ${d.bomber.cognome}`.trim() : "—",
    d.bomber ? `${d.bomber.valore} gol` : "");
  boxMvp(ctx, 60 + mw + gap, my, mw, mh, "🎯 Assistman",
    d.assistman ? `${d.assistman.nome} ${d.assistman.cognome}`.trim() : "—",
    d.assistman ? `${d.assistman.valore} assist` : "");

  // Stagione per stagione
  let ry = 840;
  ctx.textAlign = "left";
  ctx.fillStyle = COL.testo;
  ctx.font = `600 24px ${FONT}`;
  ctx.fillText("STAGIONE PER STAGIONE", 60, ry);
  ry += 30;
  ctx.font = `500 24px ${FONT}`;
  for (const s of d.perStagione.slice(0, 5)) {
    ctx.fillStyle = s.scudetto ? "rgba(168,118,26,0.14)" : "rgba(0,0,0,0.03)";
    roundRect(ctx, 60, ry, W - 120, 46, 8);
    ctx.fill();
    ctx.fillStyle = COL.testo;
    ctx.textAlign = "left";
    ctx.font = `600 23px ${FONT}`;
    ctx.fillText(`Stagione ${s.stagione}`, 78, ry + 23);
    ctx.textAlign = "center";
    ctx.fillText(`${s.posizione}°`, W / 2 - 40, ry + 23);
    ctx.fillText(`${s.punti} pt`, W / 2 + 90, ry + 23);
    ctx.textAlign = "right";
    ctx.fillStyle = s.scudetto ? COL.oro : COL.testoSoft;
    ctx.font = `600 22px ${FONT}`;
    ctx.fillText(s.scudetto ? "🏆 Scudetto" : s.posizione <= 4 ? "Champions" : s.posizione <= 6 ? "Europa" : "—", W - 78, ry + 23);
    ry += 54;
  }

  disegnaFooter(ctx, W, H);
  return canvas;
}

export async function scaricaDinastiaPng(dati) {
  const canvas = await generaCanvasDinastia(dati);
  return avviaDownload(canvas, "dinastia-scudetto-bilancio.png");
}
