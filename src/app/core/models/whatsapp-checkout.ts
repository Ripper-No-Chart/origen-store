import { CartLine, cartSubtotal, validQuantity } from './cart';

export interface CheckoutCustomer {
  readonly name: string;
  readonly zone: string;
}

export interface CheckoutConfig {
  readonly name: string;
  readonly locale: string;
  readonly currency: string;
  readonly demoCatalog: boolean;
  readonly whatsappNumber: string;
}

export function cleanField(value: string): string {
  return value.replace(/[\s\u0000-\u001f\u007f]+/g, ' ').trim();
}

export function validCustomer(customer: CheckoutCustomer): boolean {
  const name: string = cleanField(customer.name);
  const zone: string = cleanField(customer.zone);

  return name.length >= 2 && name.length <= 80 && zone.length >= 2 && zone.length <= 120;
}

export function validWhatsappNumber(value: string): boolean {
  return /^[1-9][0-9]{7,14}$/.test(value);
}

export function buildOrderMessage(
  lines: readonly CartLine[],
  customer: CheckoutCustomer,
  config: CheckoutConfig,
): string | null {
  if (
    !lines.length ||
    !validCustomer(customer) ||
    lines.some(
      (line: CartLine): boolean =>
        !line.product.available ||
        !validQuantity(line.quantity) ||
        !Number.isFinite(line.product.price) ||
        line.product.price < 0,
    )
  ) {
    return null;
  }

  const money: Intl.NumberFormat = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  });

  // Recalcular importes desde precio vigente y cantidad.
  const priced: readonly CartLine[] = lines.map((line: CartLine): CartLine => ({
    ...line,
    total: (Math.round(line.product.price * 100) * line.quantity) / 100,
  }));

  return [
    `Hola, quiero consultar por estos productos de ${config.name}:`,
    '',
    ...priced.map(
      (line: CartLine, i: number): string =>
        `${i + 1}) ${cleanField(line.product.name)} (SKU: ${cleanField(line.product.sku)}) — Cantidad: ${line.quantity} — Precio unitario: ${money.format(line.product.price)} — Importe: ${money.format(line.total)}`,
    ),
    '',
    `Subtotal (${config.currency}): ${money.format(cartSubtotal(priced))}`,
    'Envío no incluido. A confirmar disponibilidad, importe final y entrega.',
    '',
    `Mi nombre: ${cleanField(customer.name)}`,
    `Mi zona: ${cleanField(customer.zone)}`,
  ].join('\n');
}

export function buildWhatsappUrl(number: string, message: string | null): string | null {
  if (!validWhatsappNumber(number) || !message) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
