import { Pipe, PipeTransform } from '@angular/core';

import { STORE_CONFIG } from '../../core/config/store.config';

@Pipe({
  name: 'storePrice',
  standalone: true,
})
export class StorePricePipe implements PipeTransform {
  private readonly formatter: Intl.NumberFormat = new Intl.NumberFormat(STORE_CONFIG.locale, {
    style: 'currency',
    currency: STORE_CONFIG.currency,
    maximumFractionDigits: 2,
  });

  transform(value: number): string {
    return this.formatter.format(value);
  }
}
