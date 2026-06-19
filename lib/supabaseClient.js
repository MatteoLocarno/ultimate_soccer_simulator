// ============================================================================
//  CLIENT SUPABASE
// ----------------------------------------------------------------------------
//  Crea il client solo se le variabili d'ambiente sono presenti. Se mancano
//  (o Supabase non risponde), l'app continua a funzionare con i dati locali
//  in /dati (vedi caricaDati.js).
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supporta sia la nuova "publishable key" sia la vecchia "anon key".
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseAttivo = Boolean(url && key);

export const supabase = supabaseAttivo ? createClient(url, key) : null;
