import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogService } from '../../core/services/catalog.service';
import { PRODUCT_CATEGORIES } from '../../core/models/product';
import { filterProducts, parseCategory, parseSort } from '../../core/models/catalog-filter';
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly filter = computed(() => ({
    query: this.params().get('q') ?? '',
    category: parseCategory(this.params().get('categoria')),
    sort: parseSort(this.params().get('orden')),
    availableOnly: this.params().get('disponibles') === '1',
  }));
  protected readonly products = computed(() =>
    filterProducts(this.catalog.products, this.filter()),
  );
  protected readonly catalogParams = computed(() => ({
    q: this.filter().query,
    categoria: this.filter().category,
    orden: this.filter().sort,
    disponibles: this.filter().availableOnly ? '1' : '0',
  }));
  protected update(key: 'q' | 'categoria' | 'orden' | 'disponibles', value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: key === 'q',
    });
  }
  protected clear(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
