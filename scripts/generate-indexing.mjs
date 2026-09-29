import { readFileSync, writeFileSync } from 'node:fs';
const origin = process.env.SITE_URL?.replace(/\/$/, '');
if (!origin || !/^https:\/\/[^/]+$/.test(origin))
  throw new Error('SITE_URL debe ser una URL HTTPS pública sin ruta.');
const config = readFileSync('src/app/core/config/store.config.ts', 'utf8');
if (!config.includes('demoCatalog: false'))
  throw new Error('No se genera sitemap mientras el catálogo sea de demostración.');
if (!config.includes(`siteUrl: '${origin}'`))
  throw new Error('STORE_CONFIG.siteUrl debe coincidir con SITE_URL.');
const source = readFileSync('src/app/core/data/products.data.ts', 'utf8');
const match = source.match(/export const PRODUCTS = (\[[\s\S]*?\]) as const satisfies/);
if (!match) throw new Error('No se pudo leer el catálogo.');
const products = JSON.parse(match[1]);
if (products.some((p) => p.id.startsWith('demo-') || p.sku.startsWith('DEMO-')))
  throw new Error('Reemplazá los productos de ejemplo antes de indexar.');
const paths = [
  '/',
  '/productos',
  '/identidad',
  ...products.map((p) => `/productos/${encodeURIComponent(p.slug)}`),
];
const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`).join('\n')}\n</urlset>\n`,
);
writeFileSync(
  'public/robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /carrito\nDisallow: /checkout\nSitemap: ${origin}/sitemap.xml\n`,
);
console.log(`Generado sitemap con ${paths.length} URLs.`);
