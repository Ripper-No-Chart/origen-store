import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product, PRODUCT_CATEGORIES } from '../../core/models/product';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly catalog: CatalogService = inject(CatalogService);

  protected readonly featured: readonly Product[] = this.catalog.products
    .filter((product: Product): boolean => product.featured)
    .slice(0, 3);

  protected readonly categories: typeof PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;
}
