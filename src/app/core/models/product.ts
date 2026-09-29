export const PRODUCT_CATEGORIES = [
  { id: 'mates', name: 'Mates' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'kits', name: 'Kits Materos' },
  { id: 'box', name: 'Box Regalos' },
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['id'];
export interface ProductImage {
  readonly src: string;
  readonly alt: string;
}
export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly sku: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly description: string;
  /** Precio en unidades de la moneda configurada; máximo dos decimales. */
  readonly price: number;
  readonly images: readonly [ProductImage, ...ProductImage[]];
  readonly category: ProductCategory;
  readonly tags: readonly string[];
  readonly available: boolean;
  readonly featured: boolean;
}
