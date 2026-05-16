import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../environment';

const BASE_URL = API_URL + '/settings/general';

export interface SiteSettings {
  SITE_LOGO: string;
  CURRENCY_SYMBOL: string;
  CURRENCY_SYMBOL_POSITION: 'before' | 'after';
  DECIMAL_DIGITS: number;
  DECIMAL_POINT_TYPE: string;
  THOUSANDS_POINT_TYPE: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeneralSettingService {
  private _settings = signal<SiteSettings | null>(null);

  settings = this._settings.asReadonly();

  siteLogo = computed(() => this._settings()?.SITE_LOGO || '');
  currencySymbol = computed(() => this._settings()?.CURRENCY_SYMBOL || '');

  constructor(private httpClient: HttpClient) {}

  async loadSettings(): Promise<void> {
    const res: any = await firstValueFrom(this.httpClient.get(BASE_URL));
    const data = res.data;

    const s: SiteSettings = {
      SITE_LOGO: data.logoImageBaseURI + data.listSettings.SITE_LOGO,
      CURRENCY_SYMBOL: data.listSettings.CURRENCY_SYMBOL,
      CURRENCY_SYMBOL_POSITION: data.listSettings.CURRENCY_SYMBOL_POSITION === 'before' ? 'before' : 'after',
      DECIMAL_DIGITS: data.listSettings.DECIMAL_DIGITS,
      DECIMAL_POINT_TYPE: data.listSettings.DECIMAL_POINT_TYPE === 'COMMA' ? ',' : '.',
      THOUSANDS_POINT_TYPE: data.listSettings.THOUSANDS_POINT_TYPE === 'COMMA' ? ',' : '.'
    };

    this._settings.set(s);
  }

  formatMoney(num: number): string {
    const config = this._settings();
    if (!config) return num.toFixed(2);

    const {
      CURRENCY_SYMBOL,
      CURRENCY_SYMBOL_POSITION,
      DECIMAL_DIGITS,
      DECIMAL_POINT_TYPE,
      THOUSANDS_POINT_TYPE
    } = config;

    let result = '';

    if (CURRENCY_SYMBOL_POSITION === 'before') {
      result += CURRENCY_SYMBOL;
    }

    let i = parseInt(num.toFixed(DECIMAL_DIGITS)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    result += (j ? i.substring(0, j) + THOUSANDS_POINT_TYPE : '') +
      i.substring(j).replace(/(\d{3})(?=\d)/g, `$1${THOUSANDS_POINT_TYPE}`) +
      (DECIMAL_DIGITS
        ? DECIMAL_POINT_TYPE + Math.abs(num - parseInt(i)).toFixed(DECIMAL_DIGITS).slice(2)
        : '');

    if (CURRENCY_SYMBOL_POSITION === 'after') {
      result += CURRENCY_SYMBOL;
    }

    return result;
  }
}