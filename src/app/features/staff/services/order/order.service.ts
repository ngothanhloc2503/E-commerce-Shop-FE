import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpUtilService } from '../../../../core/services/http-util/http-util.service';
import { API_URL } from '../../../../core/constants/app.constants';

const BASE_URL = API_URL + '/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private httpClient: HttpClient,
    private httpUtil: HttpUtilService
  ) { }

  getOrdersByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string): Observable<any> {
    let parameters = this.httpUtil.createPagingParams(pageNum, pageSize, sortField, sortDir, keyword);
    
    return this.httpClient.get(BASE_URL, {
      params: parameters
    })
  }

  getOrderById(orderId: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${orderId}`)
  }

  saveOrder(orderData: any): Observable<any> {
    return this.httpClient.post(BASE_URL, orderData)
  }

  deleteOrder(orderID: number): Observable<any> {
    return this.httpClient.delete(BASE_URL +`/${orderID}`)
  }
}
