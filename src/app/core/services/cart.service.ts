import {
  DOCUMENT,
  Injectable,
  Signal,
  WritableSignal,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CatalogService } from './catalog.service';
import {
  CART_STORAGE_KEY,
  CartEntry,
  CartLine,
  MAX_CART_QUANTITY,
  cartLines,
  cartSubtotal,
  restoreCart,
  setCartQuantity,
  validQuantity,
} from '../models/cart';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly document: Document = inject(DOCUMENT);
  private readonly catalog: CatalogService = inject(CatalogService);

  private readonly entries: WritableSignal<readonly CartEntry[]> = signal<readonly CartEntry[]>([]);

  readonly message: WritableSignal<string> = signal('');
  readonly storageWarning: WritableSignal<string> = signal('');
  readonly maxQuantity: 99 = MAX_CART_QUANTITY;

  readonly lines: Signal<readonly CartLine[]> = computed(() =>
    cartLines(this.entries(), this.catalog.products),
  );

  readonly count: Signal<number> = computed(() =>
    this.lines().reduce((sum, line) => sum + line.quantity, 0),
  );

  readonly subtotal: Signal<number> = computed(() => cartSubtotal(this.lines()));

  constructor() {
    afterNextRender(() => this.restore());
  }

  quantity(id: string): number {
    return this.entries().find((entry: CartEntry) => entry.productId === id)?.quantity ?? 0;
  }

  add(id: string, quantity: number = 1): void {
    const product: Product | undefined = this.catalog.products.find(
      (item: Product) => item.id === id && item.available,
    );

    if (!product || !validQuantity(quantity)) {
      this.message.set('No se pudo agregar el producto. Revisá la disponibilidad y la cantidad.');
      return;
    }

    const next: number = this.quantity(id) + quantity;

    if (next > MAX_CART_QUANTITY) {
      this.message.set(`Podés agregar hasta ${MAX_CART_QUANTITY} unidades por producto.`);
      return;
    }

    this.entries.set(setCartQuantity(this.entries(), this.catalog.products, id, next));
    this.save();

    this.message.set(
      `${product.name}: ${next} ${next === 1 ? 'unidad' : 'unidades'} en tu carrito.`,
    );
  }

  setQuantity(id: string, quantity: number): void {
    if (!this.quantity(id)) {
      return;
    }

    if (!validQuantity(quantity)) {
      this.message.set(`Ingresá una cantidad entera entre 1 y ${MAX_CART_QUANTITY}.`);
      return;
    }

    this.entries.set(setCartQuantity(this.entries(), this.catalog.products, id, quantity));
    this.save();
    this.message.set('Cantidad actualizada.');
  }

  remove(id: string): void {
    this.entries.update((entries: readonly CartEntry[]) =>
      entries.filter((entry: CartEntry) => entry.productId !== id),
    );
    this.save();
    this.message.set('Producto quitado del carrito.');
  }

  clear(): void {
    this.entries.set([]);
    this.save();
    this.message.set('Vaciaste el carrito.');
  }

  private restore(): void {
    try {
      this.entries.set(
        restoreCart(
          this.document.defaultView?.localStorage.getItem(CART_STORAGE_KEY) ?? null,
          this.catalog.products,
        ),
      );
    } catch {
      this.storageWarning.set(
        'Tu navegador no permite guardar el carrito. Podés usarlo durante esta visita.',
      );
    }
  }

  private save(): void {
    try {
      const storage: Storage | undefined = this.document.defaultView?.localStorage;

      if (!storage) {
        throw new Error('Storage unavailable');
      }

      storage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          items: this.entries(),
        }),
      );

      this.storageWarning.set('');
    } catch {
      this.storageWarning.set(
        'No pudimos guardar los cambios en este navegador. El carrito se mantiene durante esta visita.',
      );
    }
  }
}
