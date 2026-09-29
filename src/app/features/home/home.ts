import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { PRODUCT_CATEGORIES } from '../../core/models/product';
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
  private readonly catalog = inject(CatalogService);
  protected readonly featured = this.catalog.products
    .filter((product) => product.featured)
    .slice(0, 3);
  protected readonly categories = PRODUCT_CATEGORIES;
}
