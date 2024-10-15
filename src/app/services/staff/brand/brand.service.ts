import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/staff/brands';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  saveBrand(brand: any, logo: File): Observable<any> {
    let data = new FormData();
    data.append('brand', new Blob([JSON.stringify(brand)] , {type: 'application/json'}));
    data.append("logo", logo);
    return this.httpClient.post(BASE_URL + '/save', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getBrandByCategory(categoryID: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/category/${categoryID}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getBrandByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string): Observable<any> {
    let parameters = this.utilsService.createPagingAndSortingParams(pageNum, pageSize, sortField, sortDir, keyword);

    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  getBrandByID(brandID: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${brandID}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  deleteBrand(brandID: number): Observable<any> {
    return this.httpClient.delete(BASE_URL +`/delete/${brandID}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  exportToCsv(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/csv', {
      headers: this.utilsService.createAuthorizationHeader(),
      responseType: 'blob'
    });
  }

  isNameUnique(brandID: number, name: string): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('id', brandID);
    parameters = parameters.append('name', name);

    return this.httpClient.get(BASE_URL + '/check-name-unique', {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }
}
