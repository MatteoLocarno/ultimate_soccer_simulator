// Genera supabase/seed.sql a partire dai dati locali in /dati.
// Uso:  node scripts/genera-seed.cjs
const fs = require("fs");
const path = require("path");

const radice = path.join(__dirname, "..");

// Carica un modulo ESM "semplice" (solo export const) senza bundler.
function caricaExport(fileRelativo, nomeVar) {
  const src = fs
    .readFileSync(path.join(radice, fileRelativo), "utf8")
    .replace(/export const/g, "const");
  const fn = new Function(`${src}\nreturn ${nomeVar};`);
  return fn();
}

const SQUADRE = caricaExport("dati/squadre.js", "SQUADRE");
const ALLENATORI = caricaExport("dati/allenatori.js", "ALLENATORI");

const esc = (v) => String(v).replace(/'/g, "''");

let sql = "-- Seed generato da scripts/genera-seed.cjs — NON modificare a mano.\n";
sql += "-- Esegui dopo schema.sql nell'editor SQL di Supabase.\n\n";

// squadre
sql += "insert into squadre (id, squadra, anno, colore) values\n";
sql += SQUADRE.map(
  (s) => `  ('${esc(s.id)}', '${esc(s.squadra)}', '${esc(s.anno)}', '${esc(s.colore)}')`
).join(",\n");
sql += "\non conflict (id) do nothing;\n\n";

// giocatori
sql += "insert into giocatori (squadra_id, nome, cognome, ruolo, overall) values\n";
const righeG = [];
for (const s of SQUADRE) {
  for (const g of s.giocatori) {
    righeG.push(
      `  ('${esc(s.id)}', '${esc(g.nome)}', '${esc(g.cognome)}', '${esc(g.ruolo)}', ${g.overall})`
    );
  }
}
sql += righeG.join(",\n") + ";\n\n";

// allenatori
sql += "insert into allenatori (nome, cognome, overall) values\n";
sql += ALLENATORI.map(
  (a) => `  ('${esc(a.nome)}', '${esc(a.cognome)}', ${a.overall})`
).join(",\n");
sql += ";\n";

fs.writeFileSync(path.join(radice, "supabase/seed.sql"), sql, "utf8");
console.log(
  `seed.sql generato: ${SQUADRE.length} squadre, ${righeG.length} giocatori, ${ALLENATORI.length} allenatori.`
);
