import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/staff/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getOrdersByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string): Observable<any> {
    let parameters = this.utilsService.createPagingAndSortingParams(pageNum, pageSize, sortField, sortDir, keyword);
    
    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  getOrderById(orderId: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${orderId}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveOrder(orderData: any): Observable<any> {
    return this.httpClient.post(BASE_URL + `/save`, orderData, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  deleteOrder(orderID: number): Observable<any> {
    return this.httpClient.delete(BASE_URL +`/delete/${orderID}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
