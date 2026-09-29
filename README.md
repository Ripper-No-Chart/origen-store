# Origen Store · Fases 1 a 4

Base ejecutable Angular 21 LTS, standalone, zoneless, TypeScript y plantillas estrictas, SCSS modular y detección OnPush. Catálogo adaptable a móvil con filtros y galería; identidad visual conservada.

## Ejecutar

Requiere Node 24 compatible (validado con 24.16.0).

```sh
npm ci
npm start
```

Abrir http://localhost:4200. Para compilar: `npm run build`. El resultado se guarda en `dist/origen-store/browser`.

## Entregables

- `src/styles/`: tokens, base, layout, componentes y utilidades.
- `public/`: logo original, favicons y manifiesto.
- `docs/identidad.md`: colores, procedencia, contraste y decisiones de uso.
- `docs/catalogo.md`: arquitectura, validación y carga de productos reales.
- `package-lock.json`: dependencias fijadas para instalación reproducible.

El favicon es un redibujo simplificado del isotipo; el logo original queda intacto. El catálogo incluye seis productos de demostración identificados. El carrito ya está disponible con persistencia local. El checkout WhatsApp está implementado; número receptor configurado.

Pruebas de catálogo, carrito y checkout: `npm test`.

Documentación del carrito: `docs/carrito.md`.

Checkout: `docs/checkout.md`. Número receptor configurado en `src/app/core/config/store.config.ts`.

## Fase 5 · UX comercial

La portada incluye propuesta de valor, destacados, categorías, pasos de compra, información de confianza y acceso al catálogo. Navegación, tarjetas y carrito se adaptaron para móvil. Los destacados y categorías provienen del mismo catálogo de demostración: antes de publicar, reemplazar productos, fotos, precios y disponibilidad por datos verificados. El checkout prepara el mensaje; el usuario decide cuándo enviarlo en WhatsApp. No hay pago electrónico.

## Fase 6 · SEO e indexación

Los títulos, descripciones, Open Graph, Twitter Card y robots meta se actualizan por ruta. El detalle incorpora metadatos de producto; el carrito y el checkout no se indexan. Las imágenes secundarias usan carga diferida y decodificación asíncrona. Los datos estructurados de Organization, WebSite, Product y BreadcrumbList, las URL absolutas y la canonical se habilitan únicamente con catálogo real y dominio HTTPS configurado.

El catálogo actual es de demostración: `public/robots.txt` bloquea rastreadores y las páginas llevan `noindex`. **No publiques la tienda comercial sin reemplazar productos, imágenes, precios y disponibilidad.** Para habilitar indexación, reemplazá todos los datos ficticios, establecé `demoCatalog: false` y `siteUrl: 'https://tu-dominio'` en `src/app/core/config/store.config.ts`, y ejecutá `SITE_URL=https://tu-dominio node scripts/generate-indexing.mjs` antes de `npm run build`. El script rechaza los productos `DEMO-` y dominios inconsistentes. Serví la aplicación con fallback a `index.html` para rutas Angular. Para que los metadatos sean visibles a crawlers que no ejecutan JavaScript, configurá SSR o prerender antes del lanzamiento.
