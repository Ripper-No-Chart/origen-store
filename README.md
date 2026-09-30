# Origen Store

Tienda web de Origen Store con catálogo de productos, carrito local y consultas de pedidos por WhatsApp.

**Sitio:** https://ripper-no-chart.github.io/origen-store/

## Funcionalidades

- Home con productos destacados y acceso por categorías.
- Catálogo con búsqueda, filtros y ordenamiento.
- Detalle de producto con galería de imágenes.
- Carrito con cantidades, subtotal y persistencia local.
- Preparación de consultas de pedidos por WhatsApp.
- Página Sobre nosotros.
- Diseño responsive.
- Generación de HTML estático mediante prerender.

La tienda no procesa pagos electrónicos. La disponibilidad, el importe final y las condiciones de entrega y pago se confirman por WhatsApp. Enviar una consulta no confirma una compra.

## Tecnologías

- Angular 21 con componentes standalone.
- TypeScript y plantillas con validación estricta.
- Detección de cambios OnPush.
- SCSS con estilos globales organizados por responsabilidad.
- Prerender e hidratación de Angular.
- GitHub Actions y GitHub Pages para compilación y despliegue.

## Requisitos

- Node.js 24.
- npm.

El archivo `package-lock.json` fija las versiones de las dependencias para instalaciones reproducibles.

## Desarrollo local

```bash
npm ci
npm start
```

Abrir http://localhost:4200/.

## Validación

Ejecutar las pruebas:

```bash
npm test
```

Verificar los tipos:

```bash
npm run typecheck
```

Compilar para producción:

```bash
npm run build
```

Los archivos publicables se generan en:

```text
dist/origen-store/browser/
```

## Estructura del proyecto

```text
src/
  app/
    core/
      config/       Configuración de la tienda
      data/         Catálogo de productos
      models/       Modelos y reglas de negocio
      services/     Servicios compartidos
    features/       Páginas y funcionalidades
    shared/         Componentes y pipes reutilizables
    app.config.server.ts
    app.routes.server.ts
  styles/           Estilos globales, tokens y utilidades
  main.server.ts    Entrada para prerender

public/
  images/products/  Imágenes del catálogo
  ...               Logo, favicons y archivos públicos

scripts/            Herramientas de mantenimiento
.github/workflows/  Automatización del despliegue
```

## Administración del catálogo

Los productos se administran en:

```text
src/app/core/data/products.data.ts
```

Cada producto incluye identificador, slug, SKU, nombre, descripciones, precio, imágenes, categoría, disponibilidad y estado de destacado.

Las categorías se definen en:

```text
src/app/core/models/product.ts
```

Las imágenes se guardan en `public/images/products/`. Sus rutas dentro del catálogo se escriben sin el prefijo `public/`:

```text
images/products/nombre-producto/principal.webp
```

Usar imágenes optimizadas y textos alternativos descriptivos. Mantener identificadores y slugs únicos y estables.

El catálogo es estático: los cambios requieren un nuevo despliegue para actualizar productos, páginas prerenderizadas y sitemap.

## Configuración de la tienda

Archivo principal:

```text
src/app/core/config/store.config.ts
```

Centraliza el nombre de la tienda, la moneda, la configuración regional, el número de WhatsApp, la URL pública y el modo de demostración.

El carrito se guarda en el navegador del visitante. No reserva stock ni registra pedidos en un servidor.

## Prerender e hidratación

La configuración de las rutas prerenderizadas está en:

```text
src/app/app.routes.server.ts
```

Durante la compilación, Angular genera HTML estático para:

- Home.
- Catálogo.
- Sobre nosotros.
- Cada producto del catálogo.
- Carrito.
- Checkout.
- Página de error.

Las rutas de producto se obtienen del catálogo, sin mantener una lista manual duplicada.

El navegador hidrata el HTML para habilitar las interacciones. El carrito se genera inicialmente vacío y recupera su contenido desde `localStorage` después del primer render.

No se incluyen datos de clientes en el HTML generado.

El resultado se publica como archivos estáticos y no requiere un servidor Node.js en producción.

## Despliegue en GitHub Pages

El workflow `.github/workflows/static.yml`:

1. Instala las dependencias.
2. Ejecuta las pruebas.
3. Genera los archivos de indexación.
4. Compila y prerenderiza la aplicación.
5. Prepara la página de error.
6. Publica `dist/origen-store/browser/`.

Se ejecuta al subir cambios a `main` o manualmente desde GitHub Actions.

En el repositorio, configurar:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

Mantener un único workflow de despliegue para GitHub Pages.

La compilación para la dirección actual utiliza:

```bash
npm run build -- --configuration production --base-href /origen-store/
```

Cada ruta prerenderizada tiene su propio directorio con un archivo `index.html`. GitHub Pages puede redirigir las URL sin barra final hacia esos directorios.

El workflow copia la página de error prerenderizada a `404.html`. Las rutas desconocidas devuelven HTTP 404.

Después de publicar, comprobar:

- Acceso directo a una página de producto.
- Carga de imágenes y navegación.
- Persistencia del carrito después de recargar.
- Preparación correcta del enlace de WhatsApp.

## SEO e indexación

Las páginas públicas incluyen títulos, descripciones, URL canónicas, metadatos sociales y datos estructurados en el HTML inicial, según la configuración de la tienda.

Angular también actualiza los metadatos durante la navegación.

Carrito, checkout y página de error utilizan `noindex`.

Para regenerar los archivos de indexación manualmente:

```bash
SITE_URL=https://ripper-no-chart.github.io/origen-store node scripts/generate-indexing.mjs
```

El script genera los archivos públicos de indexación. El workflow lo ejecuta antes de compilar.

Sitemap publicado:

```text
https://ripper-no-chart.github.io/origen-store/sitemap.xml
```

En GitHub Pages, el archivo `robots.txt` de la subcarpeta `/origen-store/` no reemplaza el de la raíz del dominio. El sitemap se puede enviar directamente a Google Search Console.

Cambiar `demoCatalog` a `false` no actualiza automáticamente `robots.txt` ni genera el sitemap.

Al configurar un dominio propio, actualizar:

- `siteUrl` en la configuración de la tienda.
- `SITE_URL` en el workflow.
- `base-href` según la ubicación pública.
- La configuración del dominio en GitHub Pages.

Después, regenerar el sitemap y desplegar nuevamente.

## Documentación de prerender

Las instrucciones de aplicación y comprobación están en:

```text
docs/prerender.md
```
