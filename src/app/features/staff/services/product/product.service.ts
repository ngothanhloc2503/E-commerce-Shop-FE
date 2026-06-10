import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpUtilService } from '../../../../core/services/http-util/http-util.service';
import { API_URL } from '../../../../core/constants/app.constants';

const BASE_URL = API_URL + '/products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private httpClient: HttpClient,
    private httpUtil: HttpUtilService,
  ) { }

  saveProduct(product: any, mainImageFile: File, extrasImagesFile: File[]): Observable<any> {
    const data = new FormData();
    data.append('product', new Blob([JSON.stringify(product)], {type: 'application/json'}));
    data.append('mainImageFile', mainImageFile);
    
    if (extrasImagesFile.length > 0) {
      for (let i = 0; i < extrasImagesFile.length; i++) {
        data.append('extrasImagesFile', extrasImagesFile[i]);
      }
    }

    return this.httpClient.post<any>(BASE_URL, data)
  }

  getProductById(id: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${id}`)
  }

  getProductByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string, categoryID: number): Observable<any> {
    let parameters = this.httpUtil.createPagingParams(pageNum, pageSize, sortField, sortDir, keyword);
    parameters = parameters.append("categoryID", categoryID);
    
    return this.httpClient.get(BASE_URL, {
      params: parameters
    })
  }

  isNameUnique(productID: number, name: string): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('id', productID);
    parameters = parameters.append('name', name);

    return this.httpClient.get(BASE_URL + '/name-unique', {
      params: parameters
    })
  }

  deleteProduct(id: number): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/${id}`);
  }

  exportToCsv(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/csv', {
      responseType: 'blob'
    });
  }

  changeEnabledStatus(id: number, status: boolean): Observable<any> {
    return this.httpClient.patch(BASE_URL + `/${id}/enabled`, { status })
  }
}
