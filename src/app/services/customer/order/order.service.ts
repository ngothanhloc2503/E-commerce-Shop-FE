import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/customer/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getOrdersByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('pageNum', pageNum);
    parameters = parameters.append('pageSize', pageSize);
    parameters = parameters.append('sortField', sortField);
    parameters = parameters.append('sortDir', sortDir);

    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    });
  }

  sendOrderReturnRequest(id: number, reason: string, note: string): Observable<any> {
    let data = new FormData();
    data.append('id', id.toString());
    data.append('reason', reason);
    data.append('note', note);
    return this.httpClient.post<any>(BASE_URL + "/return", data, {
      headers: this.utilsService.createAuthorizationHeader(),
    });
  }
}
