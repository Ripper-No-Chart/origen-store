import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

import { PRODUCTS } from './core/data/products.data';
import { Product } from './core/models/product';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'productos',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'productos/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams(): Promise<{ slug: string }[]> {
      return PRODUCTS.map((product: Product): { slug: string } => ({
        slug: product.slug,
      }));
    },
  },
  {
    path: 'identidad',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'carrito',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '404',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
