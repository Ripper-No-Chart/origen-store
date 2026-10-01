// @ts-check

import ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * @typedef {{
 *   id: string,
 *   sku: string,
 *   slug: string
 * }} IndexableProduct
 */

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @returns {value is IndexableProduct}
 */
function isIndexableProduct(value) {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.sku === 'string' &&
    value.sku.trim().length > 0 &&
    typeof value.slug === 'string' &&
    value.slug.trim().length > 0 &&
    value.slug === value.slug.trim() &&
    !/[/?#]/.test(value.slug) &&
    value.slug !== '.' &&
    value.slug !== '..'
  );
}

/**
 * @param {unknown} value
 * @returns {value is IndexableProduct[]}
 */
function isProductList(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  return value.every(
    /** @param {unknown} product @returns {boolean} */
    (product) => isIndexableProduct(product),
  );
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** @type {string | undefined} */
const inputUrl = process.env.SITE_URL?.trim();

if (!inputUrl) {
  throw new Error('Falta definir SITE_URL.');
}

/** @type {URL} */
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

/** @type {string} */
const origin = siteUrl.href.replace(/\/+$/, '');

/** @type {string} */
const config = readFileSync('src/app/core/config/store.config.ts', 'utf8');

if (!config.includes('demoCatalog: false')) {
  throw new Error('No se genera sitemap mientras el catálogo sea de demostración.');
}

if (!config.includes(`siteUrl: '${origin}'`)) {
  throw new Error('STORE_CONFIG.siteUrl debe coincidir con SITE_URL, sin barra final.');
}

/** @type {string} */
const source = readFileSync('src/app/core/data/products.data.ts', 'utf8');

/** @type {import('typescript').TranspileOutput} */
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});

/** @type {string} */
const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString('base64')}`;

/** @type {unknown} */
const catalogModule = await import(moduleUrl);

if (!isRecord(catalogModule)) {
  throw new Error('No se pudo cargar el módulo del catálogo.');
}

/** @type {unknown} */
const products = catalogModule.PRODUCTS;

if (!isProductList(products)) {
  throw new Error('El catálogo debe contener productos con id, sku y slug válidos.');
}

if (
  products.some(
    /** @param {IndexableProduct} product @returns {boolean} */
    (product) => /^demo-/i.test(product.id) || /^demo-/i.test(product.sku),
  )
) {
  throw new Error('Reemplazá los productos de ejemplo antes de indexar.');
}

/** @type {string[]} */
const slugs = products.map(
  /** @param {IndexableProduct} product @returns {string} */
  (product) => product.slug,
);

if (new Set(slugs).size !== slugs.length) {
  throw new Error('El catálogo contiene slugs duplicados.');
}

/** @type {readonly string[]} */
const paths = [
  '/',
  '/productos/',
  '/identidad/',
  ...slugs.map(
    /** @param {string} slug @returns {string} */
    (slug) => `/productos/${encodeURIComponent(slug)}/`,
  ),
];

/** @type {string} */
const entries = paths
  .map(
    /** @param {string} path @returns {string} */
    (path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`,
  )
  .join('\n');

/** @type {string} */
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${entries}\n` +
  `</urlset>\n`;

/** @type {string} */
const robots = `User-agent: *\n` + `Allow: /\n` + `Sitemap: ${origin}/sitemap.xml\n`;

writeFileSync('public/sitemap.xml', sitemap, 'utf8');
writeFileSync('public/robots.txt', robots, 'utf8');

console.log(`Generado sitemap con ${paths.length} URLs.`);
