import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../storage/storage.service';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/staff/products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  saveProduct(product: any, mainImageFile: File, listExtrasImageFile: File[]): Observable<any> {
    const data = new FormData();
    data.append('product', new Blob([JSON.stringify(product)], {type: 'application/json'}));
    data.append('mainImageFile', mainImageFile);
    
    if (listExtrasImageFile.length > 0) {
      for (let i = 0; i < listExtrasImageFile.length; i++) {
        data.append('listExtrasImageFile', listExtrasImageFile[i]);
      }
    }

    return this.httpClient.post<any>(BASE_URL + '/save', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getProductByID(id: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${id}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getProductByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string, categoryID: number): Observable<any> {
    let parameters = this.utilsService.createPagingAndSortingParams(pageNum, pageSize, sortField, sortDir, keyword);
    parameters = parameters.append("categoryID", categoryID);
    
    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  isNameUnique(productID: number, name: string): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('id', productID);
    parameters = parameters.append('name', name);

    return this.httpClient.get(BASE_URL + '/check-name-unique', {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  deleteProduct(id: number): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/delete/${id}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    });
  }

  exportToCsv(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/csv', {
      headers: this.utilsService.createAuthorizationHeader(),
      responseType: 'blob'
    });
  }

  changeEnabledStatus(id: number, status: boolean): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${id}/enabled/${status}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
