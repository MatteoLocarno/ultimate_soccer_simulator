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
  // 3 stelle dorate in alto
  const sy = top + h * 0.26;
  const sr = w * 0.1;
  for (let i = -1; i <= 1; i++) stella(ctx, cx + i * w * 0.24, sy, sr, COL.oro);
}

function stella(ctx, cx, cy, r, colore) {
  ctx.save();
  ctx.fillStyle = colore;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI / 5) * (2 * i) - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a2) * r * 0.46, cy + Math.sin(a2) * r * 0.46);
  }
  ctx.closePath();
  ctx.fill();
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

  // Header: stemma + titolo
  disegnaStemma(ctx, W / 2, 150, 96);
  ctx.fillStyle = COL.testo;
  ctx.font = `700 62px ${FONT}`;
  ctx.fillText("DINASTIA SCUDETTO", W / 2, 268);
  ctx.fillStyle = COL.testoSoft;
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText("LA MIA FORMAZIONE — DRAFT STORICO DI SERIE A", W / 2, 306);

  // Strip modulo + forza
  const stripY = 336;
  ctx.fillStyle = COL.oro;
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText(`MODULO ${modulo?.nome || ""}`.trim(), W / 2 - 150, stripY);
  // pastiglia forza
  const fx = W / 2 + 150;
  ctx.fillStyle = COL.verde;
  roundRect(ctx, fx - 130, stripY - 26, 260, 52, 26);
  ctx.fill();
  ctx.fillStyle = COL.bianco;
  ctx.font = `600 24px ${FONT}`;
  ctx.fillText("FORZA", fx - 58, stripY);
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText(String(forza), fx + 52, stripY);

  // ── Campo ──
  const pX = 70;
  const pY = 372;
  const pW = W - 140;
  const pH = 858;
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

  // Token dei giocatori (posizionati con slot.x / slot.y, come nel gioco)
  const padX = 78;
  const padY = 74;
  for (const p of titolari) {
    const cx = pX + padX + ((pW - padX * 2) * p.slot.x) / 100;
    const cy = pY + padY + ((pH - padY * 2) * p.slot.y) / 100;
    const ovr = p.giocatore.overall;
    const f = fasciaOvr(ovr);
    const r = 40;
    // disco overall
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = f.disco;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = f.bordo;
    ctx.stroke();
    ctx.fillStyle = f.testo;
    ctx.font = `700 36px ${FONT}`;
    ctx.fillText(String(ovr), cx, cy + 2);
    // fascia capitano
    if (capitanoId != null && p.giocatore._id === capitanoId) {
      const bx = cx + r * 0.78;
      const by = cy - r * 0.78;
      ctx.beginPath();
      ctx.arc(bx, by, 15, 0, Math.PI * 2);
      ctx.fillStyle = COL.oro;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#6e4d10";
      ctx.stroke();
      ctx.fillStyle = COL.bianco;
      ctx.font = `700 18px ${FONT}`;
      ctx.fillText("C", bx, by + 1);
    }
    // targhetta col cognome
    const nome = cognomeDi(p).toUpperCase();
    ctx.font = `600 25px ${FONT}`;
    const tw = Math.min(ctx.measureText(nome).width + 20, 190);
    const plY = cy + r + 20;
    ctx.fillStyle = COL.pannello;
    roundRect(ctx, cx - tw / 2, plY - 18, tw, 34, 7);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = COL.bordoScuro;
    ctx.stroke();
    ctx.fillStyle = COL.testo;
    // se troppo lungo, riduci un filo il font
    let fs = 25;
    while (ctx.measureText(nome).width > tw - 14 && fs > 17) {
      fs -= 1;
      ctx.font = `600 ${fs}px ${FONT}`;
    }
    ctx.fillText(nome, cx, plY);
  }

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

  // ── Footer: rimando al sito ──
  const dividerY = H - 118; // ~1382
  ctx.beginPath();
  ctx.moveTo(120, dividerY);
  ctx.lineTo(W - 120, dividerY);
  ctx.strokeStyle = COL.bordo;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = COL.oro;
  ctx.font = `700 42px ${FONT}`;
  ctx.fillText(SITO, W / 2, H - 76);
  ctx.fillStyle = COL.testoSoft;
  ctx.font = `italic 25px ${FONT_SERIF}`;
  ctx.fillText("Il draft delle leggende della Serie A", W / 2, H - 40);

  return canvas;
}

// Genera il PNG e ne avvia il download. Ritorna true se riuscito.
export async function scaricaFormazionePng(dati) {
  const canvas = await generaCanvasFormazione(dati);
  const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dinastia-scudetto-formazione.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
