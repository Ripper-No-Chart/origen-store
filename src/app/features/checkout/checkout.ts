import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { STORE_CONFIG } from '../../core/config/store.config';
import {
  buildOrderMessage,
  buildWhatsappUrl,
  cleanField,
  validWhatsappNumber,
} from '../../core/models/whatsapp-checkout';
import { CartService } from '../../core/services/cart.service';
import { StorePricePipe } from '../../shared/pipes/store-price.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, StorePricePipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkout {
  protected readonly cart: CartService = inject(CartService);

  protected readonly name: WritableSignal<string> = signal<string>('');
  protected readonly zone: WritableSignal<string> = signal<string>('');

  protected readonly nameTouched: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly zoneTouched: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly configured: boolean = validWhatsappNumber(STORE_CONFIG.whatsappNumber);

  protected readonly number: string = STORE_CONFIG.whatsappNumber;

  protected readonly nameInvalid: Signal<boolean> = computed(
    (): boolean => cleanField(this.name()).length < 2 || cleanField(this.name()).length > 80,
  );

  protected readonly zoneInvalid: Signal<boolean> = computed(
    (): boolean => cleanField(this.zone()).length < 2 || cleanField(this.zone()).length > 120,
  );

  protected readonly message: Signal<string | null> = computed((): string | null =>
    buildOrderMessage(
      this.cart.lines(),
      {
        name: this.name(),
        zone: this.zone(),
      },
      STORE_CONFIG,
    ),
  );

  protected readonly url: Signal<string | null> = computed((): string | null =>
    buildWhatsappUrl(STORE_CONFIG.whatsappNumber, this.message()),
  );
}
