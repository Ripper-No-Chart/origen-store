// @ts-check

/** @typedef {import('../src/app/core/models/product').Product} Product */
/** @typedef {import('../src/app/core/models/product').ProductImage} ProductImage */
/** @typedef {import('../src/app/core/models/catalog-filter').CatalogFilter} CatalogFilter */
/** @typedef {import('../src/app/core/models/catalog-filter').ProductSort} ProductSort */
/** @typedef {import('../src/app/core/models/cart').CartEntry} CartEntry */
/** @typedef {import('../src/app/core/models/cart').CartLine} CartLine */

/** @type {typeof import('node:test')} */
const { test } = require('node:test');

/** @type {typeof import('node:assert/strict')} */
const assert = require('node:assert/strict');

/** @type {typeof import('typescript')} */
const ts = require('typescript');

/** @type {typeof import('node:fs')} */
const { mkdtempSync, rmSync, existsSync } = require('node:fs');

/** @type {typeof import('node:os')} */
const { tmpdir } = require('node:os');

/** @type {typeof import('node:path')} */
const path = require('node:path');

/** @type {string} */
const root = path.resolve(__dirname, '..');

/** @type {string} */
const out = mkdtempSync(path.join(tmpdir(), 'origen-catalog-'));

process.on(
  'exit',
  /** @returns {void} */
  () => {
    rmSync(out, { recursive: true, force: true });
  },
);

/** @type {import('typescript').Program} */
const program = ts.createProgram(
  [
    'src/app/core/models/catalog-filter.ts',
    'src/app/core/models/cart.ts',
    'src/app/core/models/whatsapp-checkout.ts',
    'src/app/core/data/products.data.ts',
  ].map(
    /** @param {string} file @returns {string} */
    (file) => path.join(root, file),
  ),
  {
    outDir: out,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    skipLibCheck: true,
  },
);

/** @type {readonly import('typescript').Diagnostic[]} */
const diagnostics = ts.getPreEmitDiagnostics(program);

assert.equal(
  diagnostics.length,
  0,
  diagnostics
    .map(
      /** @param {import('typescript').Diagnostic} diagnostic @returns {string} */
      (diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    )
    .join('\n'),
);

program.emit();

/** @type {typeof import('../src/app/core/models/catalog-filter')} */
const { filterProducts, parseCategory, parseSort } = require(
  path.join(out, 'models/catalog-filter.js'),
);

/** @type {typeof import('../src/app/core/data/products.data')} */
const { PRODUCTS } = require(path.join(out, 'data/products.data.js'));

/** @type {typeof import('../src/app/core/models/cart')} */
const { restoreCart, setCartQuantity, cartLines, cartSubtotal } = require(
  path.join(out, 'models/cart.js'),
);

/** @type {typeof import('../src/app/core/models/whatsapp-checkout')} */
const { buildOrderMessage, buildWhatsappUrl, validWhatsappNumber, validCustomer } = require(
  path.join(out, 'models/whatsapp-checkout.js'),
);

/** @type {CatalogFilter} */
const filter = {
  query: '',
  category: 'all',
  sort: 'featured',
  availableOnly: false,
};

/** @type {import('../src/app/core/models/whatsapp-checkout').CheckoutConfig} */
const checkoutConfig = {
  name: 'Origen Store',
  locale: 'es-AR',
  currency: 'ARS',
  demoCatalog: false,
  whatsappNumber: '',
};

test('combina búsqueda sin tildes, categoría y disponibilidad' /** @returns {void} */, () => {
  /** @type {readonly Product[]} */
  const fixtures = [
    {
      ...PRODUCTS[0],
      id: 'fixture-taza',
      slug: 'taza-origen',
      name: 'Taza',
      shortDescription: '',
      tags: [],
      category: 'hogar',
      available: true,
    },
    {
      ...PRODUCTS[0],
      id: 'fixture-cuenco',
      slug: 'cuenco',
      name: 'Cuenco',
      shortDescription: '',
      tags: [],
      category: 'hogar',
      available: false,
    },
  ];

  assert.deepEqual(
    filterProducts(fixtures, {
      ...filter,
      query: '  TÁZA  ',
      category: 'hogar',
      availableOnly: true,
    }).map(
      /** @param {Product} product @returns {string} */
      (product) => product.slug,
    ),
    ['taza-origen'],
  );

  assert.equal(
    filterProducts(fixtures, {
      ...filter,
      query: 'cuenco',
      availableOnly: true,
    }).length,
    0,
  );

  assert.equal(
    filterProducts(fixtures, {
      ...filter,
      query: 'inexistente',
    }).length,
    0,
  );
});

test('ordena por precio sin mutar datos originales' /** @returns {void} */, () => {
  /** @type {string[]} */
  const before = PRODUCTS.map(
    /** @param {Product} product @returns {string} */
    (product) => product.id,
  );

  /** @type {readonly (readonly [ProductSort, number])[]} */
  const cases = [
    ['price-asc', 1],
    ['price-desc', -1],
  ];

  cases.forEach(
    /** @param {readonly [ProductSort, number]} sortCase @returns {void} */
    (sortCase) => {
      /** @type {ProductSort} */
      const sort = sortCase[0];

      /** @type {number} */
      const sign = sortCase[1];

      /** @type {readonly Product[]} */
      const result = filterProducts(PRODUCTS, { ...filter, sort });

      assert.ok(
        result.every(
          /** @param {Product} product @param {number} index @returns {boolean} */
          (product, index) => index === 0 || sign * (product.price - result[index - 1].price) >= 0,
        ),
      );
    },
  );

  assert.deepEqual(
    PRODUCTS.map(
      /** @param {Product} product @returns {string} */
      (product) => product.id,
    ),
    before,
  );
});

test('prioriza destacados y valida parámetros desconocidos' /** @returns {void} */, () => {
  /** @type {readonly Product[]} */
  const result = filterProducts(PRODUCTS, filter);

  /** @type {number} */
  const firstRegular = result.findIndex(
    /** @param {Product} product @returns {boolean} */
    (product) => !product.featured,
  );

  assert.ok(
    result.slice(firstRegular === -1 ? result.length : firstRegular).every(
      /** @param {Product} product @returns {boolean} */
      (product) => !product.featured,
    ),
  );

  assert.equal(parseCategory('invalid'), 'all');
  assert.equal(parseSort('invalid'), 'featured');
});

test('catálogo con identificadores únicos, precios válidos e imágenes locales existentes' /** @returns {void} */, () => {
  /** @type {readonly ('id' | 'slug' | 'sku')[]} */
  const keys = ['id', 'slug', 'sku'];

  keys.forEach(
    /** @param {'id' | 'slug' | 'sku'} key @returns {void} */
    (key) => {
      assert.equal(
        new Set(
          PRODUCTS.map(
            /** @param {Product} product @returns {string} */
            (product) => product[key],
          ),
        ).size,
        PRODUCTS.length,
      );
    },
  );

  PRODUCTS.forEach(
    /** @param {Product} product @returns {void} */
    (product) => {
      assert.ok(Number.isFinite(product.price) && product.price >= 0);
      assert.ok(product.images.length > 0);

      product.images.forEach(
        /** @param {ProductImage} image @returns {void} */
        (image) => {
          assert.ok(existsSync(path.join(root, 'public', image.src)));
        },
      );
    },
  );
});

test('carrito restaura solo cantidades válidas y productos disponibles del catálogo' /** @returns {void} */, () => {
  /** @type {Product | undefined} */
  const available = PRODUCTS.find(
    /** @param {Product} product @returns {boolean} */
    (product) => product.available,
  );

  assert.ok(available);

  /** @type {Product} */
  const unavailable = {
    ...available,
    id: 'fixture-unavailable',
    available: false,
  };

  /** @type {readonly Product[]} */
  const catalog = [...PRODUCTS, unavailable];

  /** @type {string} */
  const raw = JSON.stringify({
    version: 1,
    items: [
      { productId: available.id, quantity: 2, price: 1 },
      { productId: available.id, quantity: 3 },
      { productId: unavailable.id, quantity: 1 },
      { productId: 'missing', quantity: 1 },
      null,
    ],
  });

  /** @type {readonly CartEntry[]} */
  const restored = restoreCart(raw, catalog);

  assert.deepEqual(restored, [{ productId: available.id, quantity: 2 }]);

  assert.equal(cartSubtotal(cartLines(restored, PRODUCTS)), available.price * 2);

  /** @type {readonly string[]} */
  const invalidPayloads = ['{broken', 'null', '[]', '{"version":2,"items":[]}'];

  invalidPayloads.forEach(
    /** @param {string} payload @returns {void} */
    (payload) => {
      assert.deepEqual(restoreCart(payload, PRODUCTS), []);
    },
  );

  /** @type {readonly (number | string | null)[]} */
  const invalidQuantities = [0, -1, 1.5, 100, '2', null];

  invalidQuantities.forEach(
    /** @param {number | string | null} quantity @returns {void} */
    (quantity) => {
      assert.deepEqual(
        restoreCart(
          JSON.stringify({
            version: 1,
            items: [{ productId: available.id, quantity }],
          }),
          PRODUCTS,
        ),
        [],
      );
    },
  );
});

test('carrito actualiza sin duplicar, rechaza cantidades inválidas y suma centavos' /** @returns {void} */, () => {
  /** @type {Product | undefined} */
  const available = PRODUCTS.find(
    /** @param {Product} product @returns {boolean} */
    (product) => product.available,
  );

  assert.ok(available);

  /** @type {readonly CartEntry[]} */
  const first = setCartQuantity([], PRODUCTS, available.id, 1);

  /** @type {readonly CartEntry[]} */
  const updated = setCartQuantity(first, PRODUCTS, available.id, 3);

  assert.deepEqual(first, [{ productId: available.id, quantity: 1 }]);
  assert.equal(updated.length, 1);
  assert.equal(updated[0].quantity, 3);

  /** @type {readonly number[]} */
  const invalidQuantities = [0, -1, NaN, Infinity, 1.5, 100];

  invalidQuantities.forEach(
    /** @param {number} quantity @returns {void} */
    (quantity) => {
      assert.equal(setCartQuantity(updated, PRODUCTS, available.id, quantity), updated);
    },
  );

  assert.equal(setCartQuantity(updated, PRODUCTS, 'missing', 1), updated);

  /** @type {readonly Product[]} */
  const products = [
    { ...available, id: 'a', price: 0.1 },
    { ...available, id: 'b', price: 0.2 },
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

test('checkout requiere productos y datos válidos' /** @returns {void} */, () => {
  assert.equal(buildOrderMessage([], { name: 'Ana', zone: 'Centro' }, checkoutConfig), null);

  assert.equal(validCustomer({ name: '  ', zone: 'Centro' }), false);

  assert.equal(validCustomer({ name: 'Ana', zone: 'x'.repeat(121) }), false);

  /** @type {readonly CartLine[]} */
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

test('mensaje incluye pedido, importes actuales y datos normalizados' /** @returns {void} */, () => {
  /** @type {readonly CartLine[]} */
  const lines = cartLines([{ productId: PRODUCTS[0].id, quantity: 2 }], PRODUCTS);

  /** @type {string | null} */
  const message = buildOrderMessage(
    [{ ...lines[0], total: 1 }],
    { name: ' Ana & José ', zone: 'San\nTelmo #2' },
    checkoutConfig,
  );

  assert.ok(message);
  assert.ok(message.includes('Cantidad: 2'));

  /** @type {string} */
  const expectedSubtotal = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(PRODUCTS[0].price * 2);

  assert.ok(message.includes(expectedSubtotal));
  assert.ok(message.includes('Mi nombre: Ana & José'));
  assert.ok(message.includes('Mi zona: San Telmo #2'));
  assert.ok(message.includes(PRODUCTS[0].name));
  assert.ok(message.includes('Envío no incluido'));

  /** @type {string | null} */
  const live = buildOrderMessage(
    lines,
    { name: 'Ana', zone: 'Centro' },
    { ...checkoutConfig, demoCatalog: false },
  );

  assert.ok(live);
  assert.ok(!live.includes('DEMOSTRACIÓN'));
});

test('WhatsApp rechaza configuración vacía y codifica caracteres especiales' /** @returns {void} */, () => {
  /** @type {readonly string[]} */
  const invalidNumbers = ['', '+54 9 11', '00012345', 'abc', '5491112345678?x=1'];

  invalidNumbers.forEach(
    /** @param {string} number @returns {void} */
    (number) => {
      assert.equal(validWhatsappNumber(number), false);
    },
  );

  assert.equal(buildWhatsappUrl('', 'hola'), null);
  assert.equal(buildWhatsappUrl('5491112345678', null), null);

  /** @type {string} */
  const message = 'Ana & José\nConsulta #1 + envío 🧉';

  /** @type {string | null} */
  const href = buildWhatsappUrl('5491112345678', message);

  assert.ok(href);

  /** @type {URL} */
  const url = new URL(href);

  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/5491112345678');
  assert.equal(url.searchParams.get('text'), message);
  assert.equal([...url.searchParams.keys()].length, 1);
});
