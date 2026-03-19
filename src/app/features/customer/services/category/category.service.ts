import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';

const BASE_URL = API_URL + '/categories';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getCategoryByName(name: string): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${name}`);
  }

  getAllCategories(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/all');
  }
}
