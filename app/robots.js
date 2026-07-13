// Genera /robots.txt: consente la scansione a tutti i crawler e indica la
// sitemap. Le pagine legali restano indicizzabili (nessun contenuto privato).
const BASE = "https://dinastiascudetto.netlify.app";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
