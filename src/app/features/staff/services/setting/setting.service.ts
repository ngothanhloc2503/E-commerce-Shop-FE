import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';

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
    return this.httpClient.put(BASE_URL + '/general-settings', data)
  }

  saveMailTemplatesSettings(data: FormData): Observable<any> {
    return this.httpClient.put(BASE_URL + '/mail-templates-settings', data)
  }

  savePaymentSettings(data: FormData): Observable<any> {
    return this.httpClient.put(BASE_URL + '/payment-settings', data)
  }
}
