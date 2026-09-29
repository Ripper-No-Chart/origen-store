import { Injectable } from '@angular/core';
import { PRODUCTS } from '../data/products.data';
import { Product } from '../models/product';
@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly products: readonly Product[] = PRODUCTS;
  findBySlug(slug: string): Product | undefined {
    return this.products.find((product) => product.slug === slug);
  }
}
