import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { StorePricePipe } from '../../shared/pipes/store-price.pipe';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, StorePricePipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  protected readonly cart = inject(CartService);
  protected readonly confirmingClear = signal(false);
  protected updateQuantity(id: string, input: HTMLInputElement): void {
    this.cart.setQuantity(id, input.valueAsNumber);
    input.value = String(this.cart.quantity(id));
  }
  protected clear(): void {
    this.cart.clear();
    this.confirmingClear.set(false);
  }
}
