# Fase 3 · Carrito

## Funcionalidad

- Agregar desde tarjetas y detalle; repetir suma unidades sin duplicar filas.
- Ruta `/carrito`, contador global, cantidades editables, botones +/−, quitar y vaciar con confirmación en la interfaz.
- Subtotal calculado en centavos para evitar errores de suma decimal; no incluye envío.
- Estado reactivo con signals y computed, componentes standalone y OnPush.
- Persistencia en localStorage bajo `origen-store.cart.v1`, con esquema versionado.

## Reglas

Se guardan exclusivamente `productId` y `quantity`. Nombres, imágenes y precios se consultan en el catálogo vigente. La restauración descarta registros inválidos, IDs desconocidos, duplicados y productos sin disponibilidad. Un JSON corrupto o una versión desconocida se recupera como carrito vacío.

Cantidad entera entre 1 y 99 por producto. El máximo es una decisión de interfaz configurable en `MAX_CART_QUANTITY`; no indica stock. Los productos sin disponibilidad no se pueden agregar. Para llevar una cantidad a cero se usa Quitar.

Si localStorage falla, la sesión sigue operativa y se muestra un aviso de que no se pudo guardar. No se guardan datos personales ni hay llamadas a servicios externos. La persistencia es local al navegador y origen; puertos/dominios distintos no comparten carrito. No hay sincronización en tiempo real entre pestañas; la última escritura prevalece.

## Archivos

- `core/models/cart.ts`: contratos, validación, restauración y cálculo.
- `core/services/cart.service.ts`: estado reactivo y almacenamiento.
- `features/cart/`: vista del carrito.
- Tarjetas, detalle y cabecera consumen el mismo servicio.

## Validación

`npm test`: restauración segura, precios actuales, cantidades inválidas, orden y filtro del catálogo, cálculo decimal sin mutar datos.

`npm run build`: compilación de producción y chequeo estricto de plantillas.

Navegador: acumulación de unidades, subtotal, persistencia después de recarga, cantidades manuales válidas/inválidas, disminución y límite inferior, vaciado persistido y estado vacío. Revisión visual del carrito a 390 px.

La fase 4 agregará el checkout por WhatsApp. El catálogo sigue usando productos, precios e ilustraciones de demostración.
