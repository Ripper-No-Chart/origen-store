import { Product, ProductCategory, PRODUCT_CATEGORIES } from './product';

type CategoryDefinition = (typeof PRODUCT_CATEGORIES)[number];

export type ProductSort = 'featured' | 'price-asc' | 'price-desc';

export interface CatalogFilter {
  readonly query: string;
  readonly category: ProductCategory | 'all';
  readonly sort: ProductSort;
  readonly availableOnly: boolean;
}

export function parseCategory(value: string | null): CatalogFilter['category'] {
  return (
    PRODUCT_CATEGORIES.find((category: CategoryDefinition): boolean => category.id === value)?.id ??
    'all'
  );
}

export function parseSort(value: string | null): ProductSort {
  return value === 'price-asc' || value === 'price-desc' ? value : 'featured';
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

export function filterProducts(
  products: readonly Product[],
  filter: CatalogFilter,
): readonly Product[] {
  const terms: readonly string[] = normalize(filter.query).split(/\s+/).filter(Boolean);

  return products
    .filter((product: Product): boolean => {
      const text: string = normalize(
        [product.name, product.shortDescription, product.sku, ...product.tags].join(' '),
      );

      return (
        (filter.category === 'all' || product.category === filter.category) &&
        (!filter.availableOnly || product.available) &&
        terms.every((term: string): boolean => text.includes(term))
      );
    })
    .sort((a: Product, b: Product): number => {
      if (filter.sort === 'price-asc') {
        return a.price - b.price;
      }

      if (filter.sort === 'price-desc') {
        return b.price - a.price;
      }

      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'es');
    });
}
