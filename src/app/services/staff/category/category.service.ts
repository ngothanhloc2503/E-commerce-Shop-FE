import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/staff/categories';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getCategoriesByPage(pageNum: number, pageSize: number, keyword: string, sortField: string, sortDir: string): Observable<any> {
    let parameters = this.utilsService.createPagingAndSortingParams(pageNum, pageSize, sortField, sortDir, keyword);
    
    return this.httpClient.get(BASE_URL, { 
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  getCategoryById(id: number): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${id}`, { 
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  exportToCsv(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/csv', {
      headers: this.utilsService.createAuthorizationHeader(),
      responseType: 'blob'
    });
  }

  isNameUnique(id: number, name: string): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('id', id);
    parameters = parameters.append('name', name);
    return this.httpClient.get(BASE_URL + '/check-name-unique', {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  saveCategory(category: any, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('category', new Blob([JSON.stringify(category)] , {type: 'application/json'}));
    formData.append('image', image)
    return this.httpClient.post(BASE_URL + '/save', formData, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getAllCategories(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/all', { 
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  deleteCategory(categoryID: number): Observable<any> {
    return this.httpClient.delete(BASE_URL + '/delete/' + categoryID, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  changeEnabledStatus(categoryID: number, status: boolean): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${categoryID}/enabled/${status}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
