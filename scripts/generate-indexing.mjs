import ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';
const inputUrl = process.env.SITE_URL?.trim();

if (!inputUrl) {
  throw new Error('Falta definir SITE_URL.');
}

const siteUrl = new URL(inputUrl);

if (
  siteUrl.protocol !== 'https:' ||
  siteUrl.username ||
  siteUrl.password ||
  siteUrl.search ||
  siteUrl.hash
) {
  throw new Error('SITE_URL debe ser HTTPS, sin credenciales, parámetros ni fragmentos.');
}

const origin = siteUrl.href.replace(/\/+$/, '');
const config = readFileSync('src/app/core/config/store.config.ts', 'utf8');
if (!config.includes('demoCatalog: false'))
  throw new Error('No se genera sitemap mientras el catálogo sea de demostración.');
if (!config.includes(`siteUrl: '${origin}'`))
  throw new Error('STORE_CONFIG.siteUrl debe coincidir con SITE_URL.');
const source = readFileSync('src/app/core/data/products.data.ts', 'utf8');

const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});

const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
const { PRODUCTS: products } = await import(moduleUrl);

if (!Array.isArray(products) || products.length === 0) {
  throw new Error('El catálogo no contiene productos válidos.');
}
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
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Generado sitemap con ${paths.length} URLs.`);
