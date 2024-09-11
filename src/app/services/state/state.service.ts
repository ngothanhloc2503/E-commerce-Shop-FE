import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../constants';

const BASE_URL = API_URL + '/states';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(private httpClient: HttpClient) { }

  getStateByCountryName(countryName: any): Observable<any> {
    return this.httpClient.get(`${BASE_URL}/list-by-country/${countryName}`);
  }
}
