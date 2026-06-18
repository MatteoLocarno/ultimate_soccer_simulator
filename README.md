# 🛡️ Dinastia Scudetto — Draft Storico di Serie A

Gioco manageriale calcistico **casual** per web/mobile, in stile vintage.
Costruisci la tua squadra pescando i campioni della storia della Serie A —
**senza vedere i loro overall** — e prova a vincere lo Scudetto contro 19
squadre leggendarie.

🌐 Online: https://dinastiascudetto.netlify.app/

Conta solo la tua conoscenza calcistica: sai se Del Piero nel 1994-95 era già
un fuoriclasse o una giovane promessa?

---

## 🎮 Come si gioca (MVP / v0)

1. **Crea la squadra** — Scegli nome, **modulo** (4-3-3, 4-4-2, 3-5-2, 3-4-3,
   5-3-2, 4-2-3-1) e **colore**.
2. **Draft** — Per ogni slot della formazione (11 titolari + 7 panchina) viene
   estratta una squadra storica a caso: scegli un giocatore **a overall
   nascosto** (candidati in ordine alfabetico, niente doppioni). Poi peschi
   l'**allenatore** e nomini il **capitano**.
3. **Reveal** — A rosa completata scopri gli overall, la formazione sul campo e
   la forza della squadra (11 titolari + allenatore).
4. **Stagione** — Campionato a 20 squadre (calendario di andata e ritorno, 38
   giornate). Le 19 avversarie sono squadre-stagione storiche senza duplicati.
   A fine stagione: classifica, formazione, statistiche e **grafico
   dell'andamento** per giornata. Punta allo Scudetto.

Nessun login: si gioca subito.

---

## 🛠️ Stack

- **Next.js 16** (App Router) + **React 19**
- Tutto **lato client** (nessun backend in v0) → ottimo per Netlify
- JavaScript, interfaccia e codice in italiano

## 📁 Struttura

```
app/                 layout, pagina e stili globali
componenti/          Gioco (state machine) + 4 schermate
  Gioco.jsx          home → draft → rosa → stagione
  SchermataHome.jsx
  SchermataDraft.jsx
  SchermataRosa.jsx
  SchermataStagione.jsx
dati/
  squadre.js         DATABASE storico (20 squadre-stagione) ← qui si amplia
logica/
  formazione.js      struttura rosa e slot del draft
  draft.js           estrazione squadre/giocatori
  simulazione.js     forza squadre + simulazione campionato (Poisson)
```

## 🚀 Sviluppo locale

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build di produzione
```

## ☁️ Deploy su Netlify

1. Pusha il progetto su un repository GitHub.
2. Su Netlify: **Add new site → Import an existing project** e seleziona il repo.
3. Netlify rileva Next.js da solo (vedi `netlify.toml`): comando `npm run build`.
4. Ad ogni `git push` il sito viene ribuildato e pubblicato automaticamente.

---

## 🗄️ Ampliare il database

Tutto il "core" del gioco è in [`dati/squadre.js`](dati/squadre.js). Per
aggiungere una squadra basta accodare un oggetto:

```js
{
  id: "squadra-anno",      // identificativo univoco
  squadra: "Nome",
  anno: "AAAA-AA",
  colore: "#rrggbb",        // accento UI
  giocatori: [
    { nome: "...", cognome: "...", ruolo: "P|D|C|A", overall: 70-97 },
    // servono almeno ~2 P, 4 D, 4 C, 3 A per un buon draft
  ],
}
```

Gli **overall** vanno calibrati sul valore del giocatore *in quella stagione*
(una promessa vale meno del suo picco). È questo che rende il gioco
interessante.

---

## 🔭 Roadmap (post-MVP)

- [ ] Modalità Carriera con login e salvataggi multi-stagione
- [ ] Calciomercato e budget a fine campionato
- [ ] Competizioni internazionali (obiettivo "Triplete")
- [ ] Crescita/decrescita storica degli overall stagione su stagione
- [ ] Altri campionati / Serie B
- [ ] Monetizzazione (pubblicità)
