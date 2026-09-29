import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { STORE_CONFIG } from '../config/store.config';
import { CatalogService } from './catalog.service';
import { Product, PRODUCT_CATEGORIES } from '../models/product';

interface PageMeta {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'product';
  indexable?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document: Document = inject(DOCUMENT);
  private readonly meta: Meta = inject(Meta);
  private readonly title: Title = inject(Title);
  private readonly router: Router = inject(Router);
  private readonly catalog: CatalogService = inject(CatalogService);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.update());
    this.update();
  }

  private update(): void {
    const path: string = this.router.url.split(/[?#]/, 1)[0];
    const slug: string = path.startsWith('/productos/') ? path.slice('/productos/'.length) : '';
    const product: Product | undefined = slug ? this.catalog.findBySlug(slug) : undefined;
    const pages: Record<string, PageMeta> = {
      '/': {
        title: 'Origen Store | Inicio',
        description:
          'Explorá la selección de Origen Store, armá tu carrito y consultá tu pedido por WhatsApp.',
      },
      '/productos': {
        title: 'Productos | Origen Store',
        description:
          'Descubrí productos de Origen Store, filtrá por categoría y prepará tu consulta por WhatsApp.',
      },
      '/identidad': {
        title: 'Sobre nosotros | Origen Store',
        description:
          'Conocé Origen Store, nuestra selección de productos para disfrutar y regalar, y cómo consultar tu pedido por WhatsApp.',
      },
      '/carrito': {
        title: 'Mi carrito | Origen Store',
        description: 'Revisá los productos de tu carrito antes de consultar tu pedido.',
        indexable: false,
      },
      '/checkout': {
        title: 'Consultar pedido | Origen Store',
        description: 'Prepará tu mensaje y consultá los detalles de tu pedido por WhatsApp.',
        indexable: false,
      },
    };
    const page: PageMeta = product
      ? {
          title: `${product.name} | Origen Store`,
          description: product.shortDescription,
          image: product.images[0].src,
          type: 'product',
        }
      : (pages[path] ?? {
          title: 'Página no encontrada | Origen Store',
          description: 'La página solicitada no está disponible.',
          indexable: false,
        });
    const origin: string = STORE_CONFIG.siteUrl.replace(/\/$/, '');
    const indexable: boolean = !STORE_CONFIG.demoCatalog && !!origin && page.indexable !== false;
    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({
      name: 'robots',
      content: indexable ? 'index,follow' : 'noindex,nofollow',
    });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: page.type ?? 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'es_AR' });
    this.meta.updateTag({ property: 'og:site_name', content: STORE_CONFIG.name });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    const imageUrl: string = origin ? new URL(page.image ?? 'logo.png', `${origin}/`).href : '';
    this.setOptionalMeta('property', 'og:image', imageUrl);
    this.setOptionalMeta('name', 'twitter:image', imageUrl);
    const canonicalPath: string =
      path === '/productos' || path === '/' || path === '/identidad' || product ? path : '';
    this.setCanonical(indexable && canonicalPath ? `${origin}${canonicalPath}` : '');
    this.setOptionalMeta(
      'property',
      'og:url',
      indexable && canonicalPath ? `${origin}${canonicalPath}` : '',
    );
    this.setStructuredData(indexable ? this.structuredData(origin, product) : []);
  }

  private setOptionalMeta(key: 'name' | 'property', value: string, content: string): void {
    if (content) this.meta.updateTag({ [key]: value, content });
    else this.meta.removeTag(`${key}="${value}"`);
  }

  private setCanonical(url: string): void {
    this.document.querySelector('link[rel="canonical"]')?.remove();
    if (!url) return;
    const link = this.document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    this.document.head.appendChild(link);
  }

  private structuredData(
    origin: string,
    product: ReturnType<CatalogService['findBySlug']>,
  ): object[] {
    const data: object[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: STORE_CONFIG.name,
        url: origin,
        logo: `${origin}/logo.png`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: STORE_CONFIG.name,
        url: origin,
      },
    ];
    if (product) {
      const url = `${origin}/productos/${encodeURIComponent(product.slug)}`;
      data.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images.map((image) => new URL(image.src, `${origin}/`).href),
        sku: product.sku,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: STORE_CONFIG.currency,
          availability: `https://schema.org/${product.available ? 'InStock' : 'OutOfStock'}`,
          url,
        },
      });
      const category = PRODUCT_CATEGORIES.find((item) => item.id === product.category)?.name;
      data.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
          {
            '@type': 'ListItem',
            position: 2,
            name: category ?? 'Productos',
            item: `${origin}/productos`,
          },
          { '@type': 'ListItem', position: 3, name: product.name, item: url },
        ],
      });
    }
    return data;
  }

  private setStructuredData(data: object[]): void {
    this.document.querySelectorAll('script[data-os-structured]').forEach((node) => node.remove());
    for (const item of data) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-os-structured', '');
      script.textContent = JSON.stringify(item).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
    }
  }
}
