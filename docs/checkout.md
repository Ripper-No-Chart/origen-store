# Fase 4 · Checkout por WhatsApp

## Implementación

Ruta diferida `/checkout`, acceso desde el carrito, resumen de productos y subtotal, nombre y localidad/barrio, vista previa del mensaje y enlace `https://wa.me/NUMERO?text=MENSAJE_CODIFICADO`.

El enlace se habilita únicamente con carrito no vacío, datos válidos y número configurado. Abrir WhatsApp no envía el mensaje automáticamente, no confirma una compra y no vacía el carrito. El nombre y la zona viven en memoria del componente; no se guardan en localStorage ni se transmiten hasta que la persona usa el enlace externo. Recargar o abandonar la pantalla reinicia estos campos.

El generador incluye nombre de producto, SKU, cantidad, precio unitario, importe por línea, subtotal en la moneda configurada, nombre y zona. Recalcula los importes desde el catálogo. Se codifican tildes, saltos de línea, ampersands y otros caracteres. En modo demo incluye un aviso explícito de productos y precios ficticios.

## Número configurado

El propietario proporcionó +5491151403731. `whatsappNumber` en `src/app/core/config/store.config.ts` contiene `5491151403731`, sin +, espacios ni guiones. La validación revisa formato, no acredita que el número esté registrado en WhatsApp.

Con el número real, verificar que el destino mostrado corresponda a la tienda y probar la apertura del chat en móvil y escritorio. No se envió ningún mensaje durante esta fase.

## Validaciones

- Nombre: de 2 a 80 caracteres una vez normalizado.
- Zona: de 2 a 120 caracteres una vez normalizada; sin solicitar dirección exacta.
- Sin productos, sin datos válidos o sin número: sin enlace externo activo.
- Catálogo de demostración sigue señalado tanto en la página como en el mensaje.
- El subtotal no incluye envío ni implica pago electrónico.

`npm test`: carrito vacío, datos inválidos, cantidades inválidas, importes recalculados, normalización y codificación URL, configuración ausente y formato de teléfono.

`npm run build`: compilación de producción correcta.

Revisión en navegador: carrito vacío, acceso desde carrito con producto, vista previa de nombre/zona y diseño móvil a 390 px. El enlace al número proporcionado se verifica sin abrir WhatsApp ni enviar mensajes.

Fuente del formato: https://faq.whatsapp.com/5913398998672934
