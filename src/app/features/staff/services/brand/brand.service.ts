import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';
import { HttpUtilService } from '../../../../core/services/http-util/http-util.service';

const BASE_URL = API_URL + '/brands';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(
    private httpClient: HttpClient,
    private httpUtil: HttpUtilService
  ) { }

  saveBrand(brand: any, logo: File): Observable<any> {
    let data = new FormData();
    data.append('brand', new Blob([JSON.stringify(brand)] , {type: 'application/json'}));
    data.append("logo", logo);
    return this.httpClient.post(BASE_URL, data)
  }

  getBrandByCategory(categoryID: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/category/${categoryID}`)
  }

  getBrandByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string): Observable<any> {
    let parameters = this.httpUtil.createPagingParams(pageNum, pageSize, sortField, sortDir, keyword);

    return this.httpClient.get(BASE_URL, {
      params: parameters
    })
  }

  getBrandByID(brandID: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${brandID}`)
  }

  deleteBrand(brandID: number): Observable<any> {
    return this.httpClient.delete(BASE_URL +`/${brandID}`)
  }

  exportToCsv(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/csv', {
      responseType: 'blob'
    });
  }

  isNameUnique(brandID: number, name: string): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('id', brandID);
    parameters = parameters.append('name', name);

    return this.httpClient.get(BASE_URL + '/name-unique', {
      params: parameters
    })
  }
}
