// Genera /sitemap.xml con le pagine pubbliche del sito (il gioco è una SPA
// sotto "/", più le due pagine legali).
const BASE = "https://dinastiascudetto.netlify.app";

export default function sitemap() {
  const oggi = new Date();
  const contenuti = [
    "/come-si-gioca",
    "/guida",
    "/guida/moduli-e-formazioni",
    "/guida/leggende-serie-a",
    "/guida/consigli-scudetto",
    "/faq",
  ];
  return [
    { url: `${BASE}/`, lastModified: oggi, changeFrequency: "weekly", priority: 1 },
    ...contenuti.map((p) => ({
      url: `${BASE}${p}`,
      lastModified: oggi,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    { url: `${BASE}/privacy`, lastModified: oggi, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookie-policy`, lastModified: oggi, changeFrequency: "yearly", priority: 0.3 },
  ];
}
