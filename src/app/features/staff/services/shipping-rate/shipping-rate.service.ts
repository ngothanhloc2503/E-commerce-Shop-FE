import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpUtilService } from '../../../../core/services/http-util/http-util.service';
import { API_URL } from '../../../../core/constants/app.constants';

const BASE_URL = API_URL + '/shipping-rates';

@Injectable({
  providedIn: 'root'
})
export class ShippingRateService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: HttpUtilService,
  ) { }

  getShippingRatesByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string): Observable<any> {
    let parameters = this.utilsService.createPagingParams(pageNum, pageSize, sortField, sortDir, keyword);

    return this.httpClient.get(BASE_URL, {
      params: parameters
    })
  }

  getShippingRateById(id: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${id}`)
  }

  saveShippingRate(data: any): Observable<any> {
    return this.httpClient.post(BASE_URL, data)
  }

  changeCodSupportedStatus(id: number, supported: boolean): Observable<any> {
    return this.httpClient.patch(BASE_URL + `/${id}/cod`, { supported })
  }

  deleteShippingRate(shippingRateId: number): Observable<any> {
    return this.httpClient.delete(BASE_URL +`/${shippingRateId}`)
  }
}
