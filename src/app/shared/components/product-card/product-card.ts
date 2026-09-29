import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
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
  protected readonly cart = inject(CartService);
  readonly product = input.required<Product>();
  readonly catalogParams = input<Readonly<Record<string, string>>>({});
}
