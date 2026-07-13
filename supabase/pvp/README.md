# 🌐 Sfida settimanale PvP — Setup

Questo modulo aggiunge la modalità **online** a Dinastia Scudetto: gli utenti si
registrano, iscrivono una rosa draftata durante la settimana e la **domenica**
si gioca un campionato simulato tra tutte le squadre iscritte. Il migliore vince
lo **Scudetto** ed entra nell'albo d'oro.

## Ciclo settimanale (orari Europe/Rome)

| Quando | Cosa succede |
|---|---|
| Lunedì 00:00 | Si apre il torneo della settimana, iscrizioni aperte |
| Sabato 12:00 | **Iscrizioni chiuse** (nessun nuovo draft, le rose diventano visibili) |
| Domenica 12:00 | **Rivelazione**: campionato simulato, Scudetto al migliore |

Il gioco resta **giocabile subito**: se il backend PvP non è ancora configurato,
la sezione mostra "in arrivo" e il resto dell'app funziona normalmente. Anche la
rivelazione della domenica funziona lato client (simulazione deterministica); la
Edge Function serve a **registrare ufficialmente** classifica e scudetti.

---

## 1) Applicare lo schema

Nel progetto Supabase → **SQL Editor**, esegui i file **in ordine**:

1. `01_schema.sql` — tabelle (`profiles`, `pvp_tournaments`, `pvp_entries`, `pvp_results`) + vista albo
2. `02_rls.sql` — Row Level Security (fra cui la regola **anti-copia**: le rose altrui sono visibili solo dopo sabato 12:00)
3. `03_lifecycle_pgcron.sql` — funzioni del ciclo di vita + schedulazione `pg_cron` (rollover ogni 10 min)
4. `04_finalizza.sql` — funzione di finalizzazione (classifica ufficiale + scudetti, idempotente)

> In alternativa, in una sessione **interattiva** con l'MCP Supabase autenticato,
> si possono applicare come migrazioni (`apply_migration`).

### Estensioni richieste
`03_lifecycle_pgcron.sql` fa `create extension pg_cron` e `pg_net`. Su Supabase
si abilitano da **Database → Extensions** (o vengono create dallo script se il
ruolo ha i permessi). `pg_cron` gira nel database `postgres`.

---

## 2) Deploy della Edge Function

La funzione `pvp-simula` esegue la simulazione ufficiale della domenica.

```bash
# dalla root del progetto, con la Supabase CLI installata e loggata
supabase functions deploy pvp-simula --project-ref <PROJECT_REF>
```

Usa in automatico `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` dell'ambiente
della funzione: non serve configurarle a mano.

---

## 3) Collegare il cron alla Edge Function

`pvp_rollover()` (schedulato ogni 10 minuti) chiama la Edge Function alla
rivelazione. Deve sapere URL e chiave: inseriscili in `pvp_config` (esegui in SQL
Editor coi valori veri — **non committare la service key**):

```sql
insert into pvp_config (chiave, valore) values
  ('edge_url',    'https://<PROJECT_REF>.functions.supabase.co/pvp-simula'),
  ('service_key', '<SERVICE_ROLE_KEY>')
on conflict (chiave) do update set valore = excluded.valore;
```

Verifica che lo scheduler sia attivo:

```sql
select jobname, schedule, active from cron.job where jobname = 'pvp_rollover';
```

---

## 4) Variabili d'ambiente dell'app

Servono quelle già usate dal gioco (vedi README principale):

```
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Su **Netlify** vanno aggiunte tra le Environment variables. L'autenticazione
(email + Google) è già configurata in Supabase Auth.

---

## Test rapido

1. Applica i 4 SQL. In SQL Editor: `select * from pvp_torneo_corrente();` → deve
   creare/ritornare il torneo di questa settimana.
2. Avvia l'app, vai su **Sfida settimanale**, accedi, scegli il nickname e crea
   una squadra: comparirà in `pvp_entries`.
3. Per provare la rivelazione senza aspettare domenica, sposta a mano le date del
   torneo nel passato e invoca la funzione:
   ```sql
   update pvp_tournaments
     set chiusura_iscrizioni = now() - interval '1 hour',
         rivelazione        = now() - interval '1 minute'
   where settimana = to_char(date_trunc('week', now() at time zone 'Europe/Rome'), 'IYYY"-W"IW');
   ```
   poi chiama la Edge Function (o `select pvp_rollover();`). La sezione mostrerà
   la classifica simulata e l'albo d'oro si aggiornerà.

---

## Come funziona il determinismo

La classifica che vede l'utente e quella scritta dalla Edge Function sono
**identiche**: entrambe simulano **solo le squadre iscritte** (nessun dato
storico) con lo **stesso RNG seedato dal torneo** (`lib/rng.js`). Stesse rose +
stesso seme ⇒ stessa stagione. Se gli iscritti sono in numero dispari si aggiunge
una squadra neutra "Riposo" (forza mediana), esclusa dalla classifica degli
iscritti.

## Note / anti-cheat

- Le rose altrui restano **nascoste** finché le iscrizioni non chiudono (RLS).
- Le statistiche del profilo (`scudetti`, `partecipazioni`, `miglior_piazza`)
  sono **blindate**: le modifica solo il backend (service_role), mai il client
  (trigger `profiles_blinda_stats`).
- Gli `overall` inviati dal client sono presi per buoni (il draft li nasconde ma
  un client manomesso potrebbe alterarli): per una v2 si può ricalcolarli
  server-side confrontandoli con i valori reali del giocatore in `pvp-simula`.
