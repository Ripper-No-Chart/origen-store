import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SeoService } from './core/services/seo.service';
import { CartService } from './core/services/cart.service';
import { STORE_CONFIG } from './core/config/store.config';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly cart = inject(CartService);
  protected readonly store = STORE_CONFIG;
  private readonly seo = inject(SeoService);
}
