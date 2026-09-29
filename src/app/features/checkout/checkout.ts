import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { STORE_CONFIG } from '../../core/config/store.config';
import {
  buildOrderMessage,
  buildWhatsappUrl,
  cleanField,
  validWhatsappNumber,
} from '../../core/models/whatsapp-checkout';
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
  protected readonly cart = inject(CartService);
  protected readonly name = signal('');
  protected readonly zone = signal('');
  protected readonly nameTouched = signal(false);
  protected readonly zoneTouched = signal(false);
  protected readonly configured = validWhatsappNumber(STORE_CONFIG.whatsappNumber);
  protected readonly number = STORE_CONFIG.whatsappNumber;
  protected readonly nameInvalid = computed(
    () => cleanField(this.name()).length < 2 || cleanField(this.name()).length > 80,
  );
  protected readonly zoneInvalid = computed(
    () => cleanField(this.zone()).length < 2 || cleanField(this.zone()).length > 120,
  );
  protected readonly message = computed(() =>
    buildOrderMessage(this.cart.lines(), { name: this.name(), zone: this.zone() }, STORE_CONFIG),
  );
  protected readonly url = computed(() =>
    buildWhatsappUrl(STORE_CONFIG.whatsappNumber, this.message()),
  );
}
