import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../constants';

const BASE_URL = API_URL + '/customer/settings';

@Injectable({
  providedIn: 'root'
})
export class GeneralSettingService {
  public SITE_LOGO: string = '';
  public CURRENCY_SYMBOL: string = '';
  public CURRENCY_SYMBOL_POSITION: string = '';
  public DECIMAL_DIGITS: number = 2;
  public DECIMAL_POINT_TYPE: string = '';
  public THOUSANDS_POINT_TYPE: string = '';

  constructor(
    private httpClient: HttpClient
  ) { }

  getSiteSettings() {
    return this.httpClient.get(BASE_URL).subscribe(
      (res: any) => {
        this.SITE_LOGO = res.logoImageBaseURI + res.listSettings.SITE_LOGO;
        this.CURRENCY_SYMBOL = res.listSettings.CURRENCY_SYMBOL;
        this.CURRENCY_SYMBOL_POSITION = res.listSettings.CURRENCY_SYMBOL_POSITION;
        this.DECIMAL_DIGITS = res.listSettings.DECIMAL_DIGITS;
        this.DECIMAL_POINT_TYPE = (res.listSettings.DECIMAL_POINT_TYPE === 'COMMA' ? ',' : '.');
        this.THOUSANDS_POINT_TYPE = (res.listSettings.THOUSANDS_POINT_TYPE === 'COMMA' ? ',' : '.');
      }
    )
  }

  getFormatMoney(num: number): string {
    let result = '';
    if (this.CURRENCY_SYMBOL_POSITION === "before") {
      result += this.CURRENCY_SYMBOL;
    }

    let i = parseInt(num.toFixed(this.DECIMAL_DIGITS)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    result += (j ? i.substring(0, j) + this.THOUSANDS_POINT_TYPE : '') +
      i.substring(j).replace(/(\d{3})(?=\d)/g, "$1" + this.THOUSANDS_POINT_TYPE) +
      (this.DECIMAL_DIGITS ? this.DECIMAL_POINT_TYPE + Math.abs(num - parseInt(i)).toFixed(this.DECIMAL_DIGITS).slice(2) : "");
      
    if (this.CURRENCY_SYMBOL_POSITION === "after") {
      result += this.CURRENCY_SYMBOL;
    }
      
    return result;
  }
}
