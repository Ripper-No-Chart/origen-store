import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `<section class="os-stack">
    <h1>Página no encontrada</h1>
    <p>Volvé al catálogo para seguir explorando.</p>
    <a class="os-button" routerLink="/productos">Ver productos</a>
  </section>`,
  styles: `
    section {
      padding-block: 4rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
