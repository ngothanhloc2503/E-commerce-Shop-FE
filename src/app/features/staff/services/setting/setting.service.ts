import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../environment';

const BASE_URL = API_URL + '/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getAllSettings(): Observable<any> {
    return this.httpClient.get(BASE_URL)
  }

  getAllCurrencies(): Observable<any> {
    return this.httpClient.get(API_URL + '/currencies')
  }

  saveGeneralSettings(data: FormData): Observable<any> {
    return this.httpClient.put(BASE_URL + '/general', data)
  }

  saveMailTemplatesSettings(data: any): Observable<any> {
    return this.httpClient.put(BASE_URL + '/mail-templates', data)
  }

  savePaymentSettings(data: any): Observable<any> {
    return this.httpClient.put(BASE_URL + '/payment', data)
  }
}
