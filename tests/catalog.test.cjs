const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = mkdtempSync(path.join(tmpdir(), 'origen-catalog-'));
const program = ts.createProgram(
  [
    'src/app/core/models/catalog-filter.ts',
    'src/app/core/models/cart.ts',
    'src/app/core/models/whatsapp-checkout.ts',
    'src/app/core/data/products.data.ts',
  ].map((f) => path.join(root, f)),
  {
    outDir: out,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    skipLibCheck: true,
  },
);
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(
  diagnostics.length,
  0,
  diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'),
);
program.emit();
const { filterProducts, parseCategory, parseSort } = require(
  path.join(out, 'models/catalog-filter.js'),
);
const { PRODUCTS } = require(path.join(out, 'data/products.data.js'));
process.on('exit', () => rmSync(out, { recursive: true, force: true }));
const filter = { query: '', category: 'all', sort: 'featured', availableOnly: false };
test('combina búsqueda sin tildes, categoría y disponibilidad', () => {
  assert.deepEqual(
    filterProducts(PRODUCTS, {
      ...filter,
      query: '  TÁZA  ',
      category: 'hogar',
      availableOnly: true,
    }).map((p) => p.slug),
    ['taza-origen'],
  );
  assert.equal(
    filterProducts(PRODUCTS, { ...filter, query: 'cuenco', availableOnly: true }).length,
    0,
  );
  assert.equal(filterProducts(PRODUCTS, { ...filter, query: 'inexistente' }).length, 0);
});
test('ordena por precio sin mutar datos originales', () => {
  const before = PRODUCTS.map((p) => p.id);
  for (const [sort, sign] of [
    ['price-asc', 1],
    ['price-desc', -1],
  ]) {
    const result = filterProducts(PRODUCTS, { ...filter, sort });
    assert.ok(result.every((p, i) => i === 0 || sign * (p.price - result[i - 1].price) >= 0));
  }
  assert.deepEqual(
    PRODUCTS.map((p) => p.id),
    before,
  );
});
test('prioriza destacados y valida parámetros desconocidos', () => {
  const result = filterProducts(PRODUCTS, filter);
  const firstRegular = result.findIndex((p) => !p.featured);
  assert.ok(result.slice(firstRegular).every((p) => !p.featured));
  assert.equal(parseCategory('invalid'), 'all');
  assert.equal(parseSort('invalid'), 'featured');
});
test('catálogo con identificadores únicos, precios válidos e imágenes locales existentes', () => {
  const { existsSync } = require('node:fs');
  for (const key of ['id', 'slug', 'sku'])
    assert.equal(new Set(PRODUCTS.map((p) => p[key])).size, PRODUCTS.length);
  for (const p of PRODUCTS) {
    assert.ok(Number.isFinite(p.price) && p.price >= 0);
    assert.ok(p.images.length > 0);
    for (const image of p.images) assert.ok(existsSync(path.join(root, 'public', image.src)));
  }
});

const { restoreCart, setCartQuantity, cartLines, cartSubtotal } = require(
  path.join(out, 'models/cart.js'),
);
test('carrito restaura solo cantidades válidas y productos disponibles del catálogo', () => {
  const a = PRODUCTS.find((p) => p.available);
  const unavailable = PRODUCTS.find((p) => !p.available);
  const raw = JSON.stringify({
    version: 1,
    items: [
      { productId: a.id, quantity: 2, price: 1 },
      { productId: a.id, quantity: 3 },
      { productId: unavailable.id, quantity: 1 },
      { productId: 'missing', quantity: 1 },
      null,
    ],
  });
  const restored = restoreCart(raw, PRODUCTS);
  assert.deepEqual(restored, [{ productId: a.id, quantity: 2 }]);
  assert.equal(cartSubtotal(cartLines(restored, PRODUCTS)), a.price * 2);
  for (const raw of ['{broken', 'null', '[]', '{"version":2,"items":[]}'])
    assert.deepEqual(restoreCart(raw, PRODUCTS), []);
  for (const quantity of [0, -1, 1.5, 100, '2', null])
    assert.deepEqual(
      restoreCart(JSON.stringify({ version: 1, items: [{ productId: a.id, quantity }] }), PRODUCTS),
      [],
    );
});
test('carrito actualiza sin duplicar, rechaza cantidades inválidas y suma centavos', () => {
  const a = PRODUCTS.find((p) => p.available);
  const first = setCartQuantity([], PRODUCTS, a.id, 1);
  const updated = setCartQuantity(first, PRODUCTS, a.id, 3);
  assert.deepEqual(first, [{ productId: a.id, quantity: 1 }]);
  assert.equal(updated.length, 1);
  assert.equal(updated[0].quantity, 3);
  for (const quantity of [0, -1, NaN, Infinity, 1.5, 100])
    assert.equal(setCartQuantity(updated, PRODUCTS, a.id, quantity), updated);
  assert.equal(setCartQuantity(updated, PRODUCTS, 'missing', 1), updated);
  const products = [
    { ...a, id: 'a', price: 0.1 },
    { ...a, id: 'b', price: 0.2 },
  ];
  assert.equal(
    cartSubtotal(
      cartLines(
        [
          { productId: 'a', quantity: 1 },
          { productId: 'b', quantity: 1 },
        ],
        products,
      ),
    ),
    0.3,
  );
  assert.equal(cartSubtotal([]), 0);
});

const { buildOrderMessage, buildWhatsappUrl, validWhatsappNumber, validCustomer } = require(
  path.join(out, 'models/whatsapp-checkout.js'),
);
const checkoutConfig = {
  name: 'Origen Store',
  locale: 'es-AR',
  currency: 'ARS',
  demoCatalog: true,
  whatsappNumber: '',
};
test('checkout requiere productos y datos válidos', () => {
  assert.equal(buildOrderMessage([], { name: 'Ana', zone: 'Centro' }, checkoutConfig), null);
  assert.equal(validCustomer({ name: '  ', zone: 'Centro' }), false);
  assert.equal(validCustomer({ name: 'Ana', zone: 'x'.repeat(121) }), false);
  const lines = cartLines([{ productId: PRODUCTS[0].id, quantity: 2 }], PRODUCTS);
  assert.equal(buildOrderMessage(lines, { name: 'A', zone: 'Centro' }, checkoutConfig), null);
  assert.equal(
    buildOrderMessage(
      [{ ...lines[0], quantity: 0 }],
      { name: 'Ana', zone: 'Centro' },
      checkoutConfig,
    ),
    null,
  );
});
test('mensaje incluye pedido, importes actuales, demo y datos normalizados', () => {
  const lines = cartLines([{ productId: PRODUCTS[0].id, quantity: 2 }], PRODUCTS);
  const message = buildOrderMessage(
    [{ ...lines[0], total: 1 }],
    { name: ' Ana & José ', zone: 'San\nTelmo #2' },
    checkoutConfig,
  );
  assert.ok(message.includes('Cantidad: 2'));
  assert.ok(message.includes('37.000,00'));
  assert.ok(message.includes('Mi nombre: Ana & José'));
  assert.ok(message.includes('Mi zona: San Telmo #2'));
  assert.ok(message.includes('CONSULTA DE DEMOSTRACIÓN'));
  assert.ok(message.includes('Envío no incluido'));
  const live = buildOrderMessage(
    lines,
    { name: 'Ana', zone: 'Centro' },
    { ...checkoutConfig, demoCatalog: false },
  );
  assert.ok(!live.includes('DEMOSTRACIÓN'));
});
test('WhatsApp rechaza configuración vacía y codifica caracteres especiales', () => {
  for (const number of ['', '+54 9 11', '00012345', 'abc', '5491112345678?x=1'])
    assert.equal(validWhatsappNumber(number), false);
  assert.equal(buildWhatsappUrl('', 'hola'), null);
  assert.equal(buildWhatsappUrl('5491112345678', null), null);
  const message = 'Ana & José\nConsulta #1 + envío 🧉';
  const url = new URL(buildWhatsappUrl('5491112345678', message));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/5491112345678');
  assert.equal(url.searchParams.get('text'), message);
  assert.equal([...url.searchParams.keys()].length, 1);
});
