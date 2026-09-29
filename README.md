# Origen Store

Tienda web de Origen Store con catálogo de productos, carrito local y consultas de pedidos por WhatsApp.

**Sitio:** https://ripper-no-chart.github.io/origen-store/

## Funcionalidades

- Home con productos destacados y acceso por categorías.
- Catálogo con búsqueda, filtros y ordenamiento.
- Detalle de producto con galería de imágenes.
- Carrito con cantidades, subtotal y persistencia local.
- Preparación de pedidos para consultar por WhatsApp.
- Página Sobre nosotros.
- Diseño responsive.

La tienda no procesa pagos electrónicos. La disponibilidad, el importe final y las condiciones de entrega y pago se confirman por WhatsApp. Enviar una consulta no confirma una compra.

## Tecnologías

- Angular 21 con componentes standalone.
- TypeScript y plantillas con validación estricta.
- Detección de cambios OnPush.
- SCSS con estilos globales organizados por responsabilidad.
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

Compilar para producción:

```bash
npm run build
```

Los archivos compilados se generan en:

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
  styles/           Estilos globales, tokens y utilidades

public/
  images/products/  Imágenes del catálogo
  ...               Logo, favicons y archivos públicos

docs/               Documentación funcional y técnica
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

El catálogo es estático: los cambios requieren un nuevo despliegue.

## Configuración de la tienda

Archivo principal:

```text
src/app/core/config/store.config.ts
```

Centraliza el nombre de la tienda, la moneda, la configuración regional, el número de WhatsApp, la URL pública y el modo de demostración.

El carrito se guarda en el navegador del visitante. No reserva stock ni registra pedidos en un servidor.

## Despliegue en GitHub Pages

El workflow `.github/workflows/static.yml` instala las dependencias, compila Angular y publica el contenido de `dist/origen-store/browser/`.

Se ejecuta al subir cambios a `main` o manualmente desde GitHub Actions.

En el repositorio, configurar:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

La compilación para la dirección actual utiliza:

```bash
npm run build -- --configuration production --base-href /origen-store/
```

El workflow copia `index.html` como `404.html` para permitir que Angular cargue al acceder directamente a rutas internas. En esos accesos GitHub Pages puede responder con estado HTTP 404, aunque la aplicación se muestre.

## SEO

La aplicación actualiza títulos, descripciones y metadatos sociales durante la navegación. Los datos estructurados y las URL canónicas dependen de la configuración de la tienda.

El carrito y el checkout están excluidos de la indexación mediante metadatos.

Consideraciones pendientes para completar el SEO:

- Verificar `robots.txt` y generar un sitemap con las URL públicas definitivas.
- Adaptar el generador de indexación a la subruta `/origen-store/` antes de utilizarlo en GitHub Pages.
- Revisar las URL absolutas de imágenes y metadatos bajo esa subruta.
- Implementar prerender o SSR para entregar metadatos en el HTML inicial.
- Resolver la respuesta HTTP 404 de las rutas internas antes de depender de ellas para posicionamiento.

Cambiar `demoCatalog` a `false` no actualiza automáticamente `robots.txt` ni genera el sitemap.

## Documentación

- `docs/catalogo.md`: estructura y mantenimiento del catálogo.
- `docs/carrito.md`: funcionamiento y persistencia del carrito.
- `docs/checkout.md`: preparación de consultas por WhatsApp.
- `docs/identidad.md`: referencias de identidad visual.
