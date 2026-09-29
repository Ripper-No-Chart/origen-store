# Fase 2 · Catálogo

Implementa la fase 2 del roadmap original: modelo Product, datos locales tipados, listado, tarjeta reutilizable, filtros y detalle.

## Recorridos

- `/productos`: búsqueda por nombre, descripción breve, SKU o tags; categoría, disponibilidad y orden por destacados/precio.
- `/productos/:slug`: descripción, precio, disponibilidad y galería.
- `/identidad`: muestra visual de la fase 1.
- Slug inexistente y ruta desconocida: mensajes de recuperación.

Las rutas usan carga diferida. Los filtros se conservan en los parámetros `q`, `categoria`, `orden` y `disponibles`. El detalle mantiene esos parámetros al volver al listado. Los valores desconocidos de categoría/orden se normalizan a sus valores por defecto. La búsqueda ignora tildes y mayúsculas.

## Cargar productos reales

1. Actualizar `src/app/core/models/product.ts` con las categorías reales si son diferentes.
2. Reemplazar los seis ejemplos de `src/app/core/data/products.data.ts`. Mantener id, slug y SKU únicos. Los slugs deben ser aptos para URL y estables.
3. Colocar fotografías en `public/images/products/` y referenciarlas como `images/products/archivo.webp`, con texto alternativo descriptivo. Cada producto exige al menos una imagen.
4. Confirmar moneda y locale en `src/app/core/config/store.config.ts`. ARS/es-AR son valores de demostración, no una definición comercial confirmada.
5. Cambiar `demoCatalog` a false únicamente tras sustituir los productos, precios e ilustraciones ficticios.
6. Ejecutar `npm test` y `npm run build`.

`price` usa unidades de moneda, no centavos. `available` expresa disponibilidad del catálogo y no representa stock sincronizado. Los datos se consultan a través de CatalogService, separado de las vistas para facilitar una futura integración.

## Validación realizada

Compilación de producción; pruebas de filtrado combinado, búsqueda sin tildes, orden sin mutación, normalización de parámetros, unicidad e imágenes existentes. Revisión en navegador de búsqueda, estado vacío, categoría + disponibilidad + precio, galería, regreso con filtros y producto inexistente. Vista móvil de 390 px sin desbordamiento horizontal y con imágenes cargadas.

El hosting futuro debe redirigir rutas de la SPA a index.html para permitir recargar un detalle. El servidor de desarrollo ya lo permite. Los estados no encontrados son de interfaz; los códigos HTTP y SEO se revisarán en la fase de publicación.

Carrito y checkout por WhatsApp corresponden a las fases 3 y 4. Esta entrega no muestra botones de compra sin funcionalidad.

Referencia técnica consultada: https://angular.dev/guide/routing/read-route-state
