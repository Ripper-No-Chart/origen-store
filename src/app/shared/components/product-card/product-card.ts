import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  Signal,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product';
import { StorePricePipe } from '../../pipes/store-price.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, StorePricePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  protected readonly cart: CartService = inject(CartService);

  readonly product: InputSignal<Product> = input.required<Product>();

  readonly catalogParams: InputSignal<Readonly<Record<string, string>>> = input<
    Readonly<Record<string, string>>
  >({});

  protected readonly imageSrcset: Signal<string | null> = computed((): string | null => {
    const source: string = this.product().images[0].src;

    if (!source.endsWith('/portrait.webp')) {
      return null;
    }

    const base: string = source.slice(0, -'.webp'.length);

    return `${base}-640.webp 640w, ${base}-960.webp 960w`;
  });
}
