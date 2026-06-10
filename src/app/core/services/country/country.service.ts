import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../constants/app.constants';

const BASE_URL = API_URL + '/countries';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private httpClient: HttpClient) { }

  getAllCountries(): Observable<any> {
    return this.httpClient.get(BASE_URL);
  }

  getStateByCountryName(countryName: any): Observable<any> {
    return this.httpClient.get(`${BASE_URL}/${countryName}/states`);
  }
}
