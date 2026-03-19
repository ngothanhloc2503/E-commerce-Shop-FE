import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';

const BASE_URL = API_URL + '/search';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  searchProduct(keyword: string, pageNum: number, sortField: string, rating: number, brandIDs: number[]): Observable<any> {
    let parameters = new HttpParams;
    parameters = parameters.append("keyword", keyword);
    parameters = parameters.append("pageNum", pageNum);
    parameters = parameters.append("sortField", sortField);
    parameters = parameters.append("rating", rating);
    if (brandIDs.length > 0) {
      for (let i = 0; i < brandIDs.length; i++) {
        parameters = parameters.append('brandIDs', brandIDs[i]);
      }
    }
    return this.httpClient.get(BASE_URL + '/products', {
      params: parameters
    })
  }

  getRecommendedBrands(keyword: string): Observable<any> {
    let parameters = new HttpParams;
    parameters = parameters.append("keyword", keyword);
    
    return this.httpClient.get(BASE_URL + '/recommended-brands', {
      params: parameters
    })
  }
}
