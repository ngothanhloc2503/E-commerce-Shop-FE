import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../environment';
import { HttpUtilService } from '../../../../core/services/http-util/http-util.service';

const BASE_URL = API_URL + '/categories';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private httpClient: HttpClient,
    private httpUtil: HttpUtilService
  ) { }

  getCategoriesByPage(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string): Observable<any> {
    let parameters = this.httpUtil.createPagingParams(pageNum, pageSize, sortField, sortDir, keyword);
    
    return this.httpClient.get(BASE_URL, { 
      params: parameters
    })
  }

  getCategoryById(id: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${id}`)
  }

  exportToCsv(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/csv', {
      responseType: 'blob'
    });
  }

  isNameUnique(id: number, name: string): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('id', id);
    parameters = parameters.append('name', name);
    return this.httpClient.get(BASE_URL + '/name-unique', {
      params: parameters
    })
  }

  saveCategory(category: any, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('category', new Blob([JSON.stringify(category)] , {type: 'application/json'}));
    formData.append('image', image);
    return this.httpClient.post(BASE_URL, formData);
  }

  getAllCategories(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/all');
  }

  deleteCategory(categoryID: number): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/${categoryID}`);
  }

  changeEnabledStatus(categoryID: number, status: boolean): Observable<any> {
    return this.httpClient.patch(BASE_URL + `/${categoryID}/enabled`, { status });
  }
}
