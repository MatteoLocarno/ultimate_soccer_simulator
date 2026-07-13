// Genera /sitemap.xml con le pagine pubbliche del sito (il gioco è una SPA
// sotto "/", più le due pagine legali).
const BASE = "https://dinastiascudetto.netlify.app";

export default function sitemap() {
  const oggi = new Date();
  return [
    { url: `${BASE}/`, lastModified: oggi, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/privacy`, lastModified: oggi, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookie-policy`, lastModified: oggi, changeFrequency: "yearly", priority: 0.3 },
  ];
}
