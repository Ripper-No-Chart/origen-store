# Prerender para GitHub Pages

Origen Store genera HTML estático durante la compilación mediante el prerender de Angular. No requiere un servidor Node.js en producción.

## Archivos principales

- `src/main.server.ts`: entrada utilizada para generar el HTML.
- `src/app/app.config.server.ts`: configuración de renderizado.
- `src/app/app.routes.server.ts`: rutas que se prerenderizan.
- `src/app/app.config.ts`: hidratación e interacciones del navegador.
- `.github/workflows/static.yml`: compilación y publicación.

## Rutas generadas

- Home.
- Catálogo.
- Sobre nosotros.
- Detalle de cada producto.
- Carrito.
- Checkout.
- Página de error.

Los slugs de productos se obtienen directamente del catálogo. No es necesario mantener una segunda lista de productos.

Cada ruta prerenderizada tiene su directorio y archivo `index.html` dentro de:

```text
dist/origen-store/browser/
```

## Hidratación y carrito

Angular reutiliza el HTML generado y activa las interacciones en el navegador.

El carrito se genera inicialmente vacío. Su contenido se recupera desde `localStorage` después del primer render para mantener compatible el estado inicial con el HTML prerenderizado.

No se incluyen datos de clientes en los archivos generados.

## Instalación y validación

Después de aplicar todos los archivos y actualizar las dependencias:

```bash
npm install
npm test
npm run typecheck
```

Conservar y subir `package-lock.json`. GitHub Actions utiliza `npm ci` para instalar las versiones fijadas en ese archivo.

Para verificar también los tipos de las pruebas JavaScript:

```bash
npx tsc --allowJs --checkJs --strict --noEmit --skipLibCheck --target ES2022 --module commonjs --types node tests/catalog.test.cjs
```

Esta comprobación requiere `@types/node` como dependencia de desarrollo.

## Compilación para GitHub Pages

Generar los archivos de indexación:

```bash
SITE_URL=https://ripper-no-chart.github.io/origen-store node scripts/generate-indexing.mjs
```

Compilar y prerenderizar:

```bash
npm run build -- --configuration production --base-href /origen-store/
```

Para una vista previa local, servir el contenido de `dist/origen-store/browser/` bajo la ruta `/origen-store/`.

## Despliegue

Mantener un único workflow de GitHub Pages:

```text
.github/workflows/static.yml
```

En GitHub, configurar:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

Al subir cambios a `main`, el workflow instala las dependencias, ejecuta las pruebas, genera el sitemap, compila y publica.

El workflow copia:

```text
dist/origen-store/browser/404/index.html
```

a:

```text
dist/origen-store/browser/404.html
```

También crea `.nojekyll` en el directorio publicado.

GitHub Pages puede redirigir las rutas sin barra final hacia sus directorios. Las rutas desconocidas utilizan la página de error y devuelven HTTP 404.

## SEO

Las páginas públicas contienen su contenido y metadatos en el HTML inicial, según la configuración de la tienda.

Carrito, checkout y página de error conservan `noindex`.

El sitemap publicado está en:

```text
https://ripper-no-chart.github.io/origen-store/sitemap.xml
```

El archivo `robots.txt` de la subcarpeta `/origen-store/` no reemplaza al de la raíz del dominio.

Los cambios de productos requieren un nuevo despliegue para actualizar el HTML y el sitemap.

## Comprobación después del deploy

1. Abrir directamente una URL de producto.
2. Verificar imágenes, título y contenido.
3. Agregar un producto al carrito.
4. Recargar y comprobar que se conserve la cantidad.
5. Abrir el checkout y completar los datos.
6. Verificar el mensaje preparado para WhatsApp.
7. Abrir una ruta inexistente y comprobar la página de error.

La prueba automatizada de navegador no se pudo completar durante la preparación porque falló la descarga de Chromium. La persistencia del carrito y el flujo de WhatsApp requieren esta comprobación después del despliegue.
