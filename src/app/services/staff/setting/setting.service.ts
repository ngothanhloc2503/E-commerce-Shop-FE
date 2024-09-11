import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/staff/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getAllSettings(): Observable<any> {
    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getAllCurrencies(): Observable<any> {
    return this.httpClient.get(API_URL + '/staff/currencies', {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveGeneralSettings(data: FormData): Observable<any> {
    return this.httpClient.post(BASE_URL + '/save-general-settings', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveMailServerSettings(data: FormData): Observable<any> {
    return this.httpClient.post(BASE_URL + '/save-mail-server-settings', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveMailTemplatesSettings(data: FormData): Observable<any> {
    return this.httpClient.post(BASE_URL + '/save-mail-templates-settings', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  savePaymentSettings(data: FormData): Observable<any> {
    return this.httpClient.post(BASE_URL + '/save-payment-settings', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
