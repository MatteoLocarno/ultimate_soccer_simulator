/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fissa la root del progetto: evita che Next scelga per errore un
  // lockfile presente in cartelle superiori (es. la home dell'utente).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
