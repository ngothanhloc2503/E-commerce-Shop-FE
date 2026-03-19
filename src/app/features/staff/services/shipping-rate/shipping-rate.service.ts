import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../../../core/services/storage/storage.service';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';
import { UtilsService } from '../../../../shared/utils/utils.service';

const BASE_URL = API_URL + '/staff/shipping-rates';

@Injectable({
  providedIn: 'root'
})
export class ShippingRateService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getShippingRatesByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string): Observable<any> {
    let parameters = this.utilsService.createPagingAndSortingParams(pageNum, pageSize, sortField, sortDir, keyword);

    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  getShippingRateById(id: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${id}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveShippingRate(data: any): Observable<any> {
    return this.httpClient.post(BASE_URL + '/save', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  changeCodSupportedStatus(id: number, supported: boolean): Observable<any> {
    return this.httpClient.get(BASE_URL + `/cod/${id}/enabled/${supported}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  deleteShippingRate(shippingRateId: number): Observable<any> {
    return this.httpClient.delete(BASE_URL +`/delete/${shippingRateId}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
