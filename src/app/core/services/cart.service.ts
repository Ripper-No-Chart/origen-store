import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { CatalogService } from './catalog.service';
import {
  CART_STORAGE_KEY,
  CartEntry,
  MAX_CART_QUANTITY,
  cartLines,
  cartSubtotal,
  restoreCart,
  setCartQuantity,
  validQuantity,
} from '../models/cart';
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly document = inject(DOCUMENT);
  private readonly catalog = inject(CatalogService);
  private readonly entries = signal<readonly CartEntry[]>([]);
  readonly message = signal('');
  readonly storageWarning = signal('');
  readonly maxQuantity = MAX_CART_QUANTITY;
  readonly lines = computed(() => cartLines(this.entries(), this.catalog.products));
  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.quantity, 0));
  readonly subtotal = computed(() => cartSubtotal(this.lines()));
  constructor() {
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
  quantity(id: string): number {
    return this.entries().find((entry) => entry.productId === id)?.quantity ?? 0;
  }
  add(id: string, quantity = 1): void {
    const product = this.catalog.products.find((p) => p.id === id && p.available);
    if (!product || !validQuantity(quantity)) {
      this.message.set('No se pudo agregar el producto. Revisá la disponibilidad y la cantidad.');
      return;
    }
    const next = this.quantity(id) + quantity;
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
    if (!this.quantity(id)) return;
    if (!validQuantity(quantity)) {
      this.message.set(`Ingresá una cantidad entera entre 1 y ${MAX_CART_QUANTITY}.`);
      return;
    }
    this.entries.set(setCartQuantity(this.entries(), this.catalog.products, id, quantity));
    this.save();
    this.message.set('Cantidad actualizada.');
  }
  remove(id: string): void {
    this.entries.update((entries) => entries.filter((entry) => entry.productId !== id));
    this.save();
    this.message.set('Producto quitado del carrito.');
  }
  clear(): void {
    this.entries.set([]);
    this.save();
    this.message.set('Vaciaste el carrito.');
  }
  private save(): void {
    try {
      const storage = this.document.defaultView?.localStorage;
      if (!storage) throw new Error('Storage unavailable');
      storage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: this.entries() }));
      this.storageWarning.set('');
    } catch {
      this.storageWarning.set(
        'No pudimos guardar los cambios en este navegador. El carrito se mantiene durante esta visita.',
      );
    }
  }
}
