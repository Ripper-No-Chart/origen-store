import { ChangeDetectionStrategy, Component, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import {
  CatalogFilter,
  filterProducts,
  parseCategory,
  parseSort,
} from '../../core/models/catalog-filter';
import { Product, PRODUCT_CATEGORIES } from '../../core/models/product';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly catalog: CatalogService = inject(CatalogService);

  private readonly params: Signal<ParamMap> = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly categories: typeof PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;

  protected readonly filter: Signal<CatalogFilter> = computed((): CatalogFilter => ({
    query: this.params().get('q') ?? '',
    category: parseCategory(this.params().get('categoria')),
    sort: parseSort(this.params().get('orden')),
    availableOnly: this.params().get('disponibles') === '1',
  }));

  protected readonly products: Signal<readonly Product[]> = computed((): readonly Product[] =>
    filterProducts(this.catalog.products, this.filter()),
  );

  protected readonly catalogParams: Signal<Readonly<Record<string, string>>> = computed(
    (): Readonly<Record<string, string>> => ({
      q: this.filter().query,
      categoria: this.filter().category,
      orden: this.filter().sort,
      disponibles: this.filter().availableOnly ? '1' : '0',
    }),
  );

  protected update(key: 'q' | 'categoria' | 'orden' | 'disponibles', value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: key === 'q',
    });
  }

  protected clear(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}
