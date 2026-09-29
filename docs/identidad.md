# Identidad de Origen Store

La fuente es `public/logo.png`, adjunto original recuperado de la conversación. El PNG tiene textura y variaciones: los tonos siguientes son medianas RGB de muestras interiores, no colores oficiales de un manual de marca.

| Token  | HEX     | Muestra (x0,y0,x1,y1) |
| ------ | ------- | --------------------- |
| Marfil | #FEF9F3 | 40,40,200,200         |
| Carbón | #343434 | 565,255,685,295       |
| Oliva  | #73733F | 470,600,530,635       |
| Dorado | #B38F5D | 750,585,790,620       |

Carbón sobre marfil: 11.89:1. Oliva sobre marfil: 4.72:1. Dorado sobre marfil: 2.86:1; reservar para decoración, sin usarlo como texto pequeño ni único indicador de un control.

Los tonos #272726, #BBB3A0, #D8D4C9, #F7F1E8 y #55552E son derivados para interfaz. El borde suave es decorativo; los controles necesitan un borde con mayor contraste.

## Favicon

`public/favicon.svg` es un redibujo manual simplificado del isotipo observado, con colores planos; no es una extracción vectorial exacta. Conserva el arco y las dos hojas, sin el texto. Fondo marfil con esquinas transparentes. Revisar su fidelidad antes de cerrar el manual de marca.

Archivos: SVG, ICO (16/32/48), apple-touch-icon PNG (180), PNG (192/512) y manifiesto. Los PNG e ICO se rasterizan desde el SVG; no se generó un logo alternativo con IA. Los iconos usan purpose `any`, no `maskable`. El manifiesto no implica soporte offline ni una PWA completa.

## Estilos

- `src/styles.scss`: entrada global, orden explícito con `@use`.
- `styles/tokens`: paleta SCSS y variables CSS semánticas con prefijo `--os-`.
- `styles/abstracts`: mixins sin emisión de CSS.
- `styles/base`: reset, tipografía, foco y movimiento reducido.
- `styles/layout`: contenedor y espaciado vertical.
- `styles/components`: botones reutilizables.
- `styles/utilities`: acceso por teclado.
- Cada componente mantiene sus estilos específicos junto a su plantilla.

Los componentes consumen variables CSS; importar únicamente mixins cuando hagan falta. No importar theme desde componentes para evitar duplicar `:root`. Usar `@use`, no el `@import` obsoleto de Sass. Fuentes del sistema: sin dependencias externas ni licencias pendientes.

## Alcance

Esta fase entrega identidad y estructura técnica con una página de muestra. Catálogo, carrito persistente, mensaje de pedido por WhatsApp, número de contacto y anuncios quedan para etapas posteriores. No se simulan compras ni pagos.

Referencias: https://angular.dev/reference/releases y https://angular.dev/reference/configs/workspace-config (consulta 2026-09-28).
