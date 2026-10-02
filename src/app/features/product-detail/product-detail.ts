import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  WritableSignal,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';

import { Product, ProductImage, PRODUCT_CATEGORIES } from '../../core/models/product';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { StorePricePipe } from '../../shared/pipes/store-price.pipe';

type CategoryDefinition = (typeof PRODUCT_CATEGORIES)[number];

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, StorePricePipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  protected readonly cart: CartService = inject(CartService);

  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly catalog: CatalogService = inject(CatalogService);

  private readonly params: Signal<ParamMap> = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly product: Signal<Product | undefined> = computed((): Product | undefined =>
    this.catalog.findBySlug(this.params().get('slug') ?? ''),
  );

  protected readonly selectedImage: WritableSignal<ProductImage | undefined> = linkedSignal(
    (): ProductImage | undefined => this.product()?.images[0],
  );

  protected readonly category: Signal<CategoryDefinition['name'] | undefined> = computed(
    (): CategoryDefinition['name'] | undefined =>
      PRODUCT_CATEGORIES.find(
        (category: CategoryDefinition): boolean => category.id === this.product()?.category,
      )?.name,
  );
}
