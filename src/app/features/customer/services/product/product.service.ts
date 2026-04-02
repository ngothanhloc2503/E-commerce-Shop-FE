import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';

const BASE_URL = API_URL + '/products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getProductByCategoryName(categoryName: string, pageNum: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/category/${categoryName}`, { 
      params: { pageNum }
    })
  }

  getProductByAlias(alias: string): Observable<any> {
    return this.httpClient.get(BASE_URL + `/alias/${alias}`);
  }

  getTopFifteenRatedProduct(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/home');
  }
}
