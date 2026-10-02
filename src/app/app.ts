import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { STORE_CONFIG } from './core/config/store.config';
import { CartService } from './core/services/cart.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly cart: CartService = inject(CartService);

  protected readonly store: typeof STORE_CONFIG = STORE_CONFIG;

  private readonly seo: SeoService = inject(SeoService);
}
