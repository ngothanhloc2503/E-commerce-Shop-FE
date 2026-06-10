import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../core/constants/app.constants';

const BASE_URL = API_URL + '/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getOrdersByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('pageNum', pageNum);
    parameters = parameters.append('pageSize', pageSize);
    parameters = parameters.append('sortField', sortField);
    parameters = parameters.append('sortDir', sortDir);

    return this.httpClient.get(BASE_URL + '/my', {
      params: parameters
    });
  }

  sendOrderReturnRequest(id: number, reason: string, note: string): Observable<any> {
    const data = {
      reason: reason,
      note: note
    };
    return this.httpClient.post<any>(BASE_URL + `/${id}/return`, data);
  }
}
