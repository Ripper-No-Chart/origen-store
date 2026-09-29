import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { PRODUCT_CATEGORIES } from '../../core/models/product';
import { StorePricePipe } from '../../shared/pipes/store-price.pipe';
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, StorePricePipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  protected readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  protected readonly product = computed(() =>
    this.catalog.findBySlug(this.params().get('slug') ?? ''),
  );
  protected readonly selectedImage = linkedSignal(() => this.product()?.images[0]);
  protected readonly category = computed(
    () => PRODUCT_CATEGORIES.find((category) => category.id === this.product()?.category)?.name,
  );
}
