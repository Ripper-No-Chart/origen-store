import { Product } from './product';

export const CART_STORAGE_KEY: 'origen-store.cart.v1' = 'origen-store.cart.v1';

/** Límite de interfaz, no representa stock disponible. */
export const MAX_CART_QUANTITY: 99 = 99;

export interface CartEntry {
  readonly productId: string;
  readonly quantity: number;
}

export interface CartLine extends CartEntry {
  readonly product: Product;
  readonly total: number;
}

export function validQuantity(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= MAX_CART_QUANTITY;
}

export function setCartQuantity(
  entries: readonly CartEntry[],
  products: readonly Product[],
  id: string,
  quantity: number,
): readonly CartEntry[] {
  if (
    !validQuantity(quantity) ||
    !products.some((product: Product): boolean => product.id === id && product.available)
  ) {
    return entries;
  }

  return entries.some((entry: CartEntry): boolean => entry.productId === id)
    ? entries.map((entry: CartEntry): CartEntry =>
        entry.productId === id ? { productId: id, quantity } : entry,
      )
    : [...entries, { productId: id, quantity }];
}

export function cartLines(
  entries: readonly CartEntry[],
  products: readonly Product[],
): readonly CartLine[] {
  return entries.flatMap((entry: CartEntry): CartLine[] => {
    const product: Product | undefined = products.find(
      (item: Product): boolean => item.id === entry.productId && item.available,
    );

    return product
      ? [
          {
            ...entry,
            product,
            total: (Math.round(product.price * 100) * entry.quantity) / 100,
          },
        ]
      : [];
  });
}

export function cartSubtotal(lines: readonly CartLine[]): number {
  return (
    lines.reduce((sum: number, line: CartLine): number => sum + Math.round(line.total * 100), 0) /
    100
  );
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function restoreCart(
  raw: string | null,
  products: readonly Product[],
): readonly CartEntry[] {
  if (!raw) {
    return [];
  }

  try {
    const data: unknown = JSON.parse(raw);

    if (!record(data) || data['version'] !== 1 || !Array.isArray(data['items'])) {
      return [];
    }

    const items: readonly unknown[] = data['items'];
    const entries: CartEntry[] = [];

    items.forEach((item: unknown): void => {
      if (
        !record(item) ||
        typeof item['productId'] !== 'string' ||
        typeof item['quantity'] !== 'number'
      ) {
        return;
      }

      const id: string = item['productId'];
      const quantity: number = item['quantity'];

      if (
        validQuantity(quantity) &&
        products.some((product: Product): boolean => product.id === id && product.available) &&
        !entries.some((entry: CartEntry): boolean => entry.productId === id)
      ) {
        entries.push({ productId: id, quantity });
      }
    });

    return entries;
  } catch {
    return [];
  }
}
