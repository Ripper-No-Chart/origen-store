import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Origen Store | Inicio',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'productos',
    title: 'Productos | Origen Store',
    loadComponent: () => import('./features/products/products').then((m) => m.Products),
  },
  {
    path: 'productos/:slug',
    loadComponent: () =>
      import('./features/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'carrito',
    title: 'Mi carrito | Origen Store',
    loadComponent: () => import('./features/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'checkout',
    title: 'Consultar pedido | Origen Store',
    loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'identidad',
    title: 'Sobre nosotros | Origen Store',
    loadComponent: () => import('./features/brand/brand').then((m) => m.Brand),
  },
  {
    path: '404',
    title: 'Página no encontrada | Origen Store',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    title: 'Página no encontrada | Origen Store',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
