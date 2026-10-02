import type { Routes } from '@angular/router';

type HomeModule = typeof import('./features/home/home');
type ProductsModule = typeof import('./features/products/products');
type ProductDetailModule = typeof import('./features/product-detail/product-detail');
type CartModule = typeof import('./features/cart/cart');
type CheckoutModule = typeof import('./features/checkout/checkout');
type BrandModule = typeof import('./features/brand/brand');
type NotFoundModule = typeof import('./features/not-found/not-found');

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Origen Store | Inicio',
    loadComponent: (): Promise<HomeModule['Home']> =>
      import('./features/home/home').then((module: HomeModule): HomeModule['Home'] => module.Home),
  },
  {
    path: 'productos',
    title: 'Productos | Origen Store',
    loadComponent: (): Promise<ProductsModule['Products']> =>
      import('./features/products/products').then(
        (module: ProductsModule): ProductsModule['Products'] => module.Products,
      ),
  },
  {
    path: 'productos/:slug',
    loadComponent: (): Promise<ProductDetailModule['ProductDetail']> =>
      import('./features/product-detail/product-detail').then(
        (module: ProductDetailModule): ProductDetailModule['ProductDetail'] => module.ProductDetail,
      ),
  },
  {
    path: 'carrito',
    title: 'Mi carrito | Origen Store',
    loadComponent: (): Promise<CartModule['Cart']> =>
      import('./features/cart/cart').then((module: CartModule): CartModule['Cart'] => module.Cart),
  },
  {
    path: 'checkout',
    title: 'Consultar pedido | Origen Store',
    loadComponent: (): Promise<CheckoutModule['Checkout']> =>
      import('./features/checkout/checkout').then(
        (module: CheckoutModule): CheckoutModule['Checkout'] => module.Checkout,
      ),
  },
  {
    path: 'identidad',
    title: 'Sobre nosotros | Origen Store',
    loadComponent: (): Promise<BrandModule['Brand']> =>
      import('./features/brand/brand').then(
        (module: BrandModule): BrandModule['Brand'] => module.Brand,
      ),
  },
  {
    path: '404',
    title: 'Página no encontrada | Origen Store',
    loadComponent: (): Promise<NotFoundModule['NotFound']> =>
      import('./features/not-found/not-found').then(
        (module: NotFoundModule): NotFoundModule['NotFound'] => module.NotFound,
      ),
  },
  {
    path: '**',
    title: 'Página no encontrada | Origen Store',
    loadComponent: (): Promise<NotFoundModule['NotFound']> =>
      import('./features/not-found/not-found').then(
        (module: NotFoundModule): NotFoundModule['NotFound'] => module.NotFound,
      ),
  },
];
