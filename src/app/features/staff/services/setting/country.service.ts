import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../core/constants/app.constants';

const BASE_URL = API_URL + '/countries';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getStateByCountryName(countryName: any): Observable<any> {
    return this.httpClient.get(`${BASE_URL}/${countryName}/states`);
  }

  getAllCountries(): Observable<any> {
    return this.httpClient.get(BASE_URL);
  }

  saveCountry(country: any): Observable<any> {
    let data = new FormData();
    data.append('country', new Blob([JSON.stringify(country)], { type: 'application/json' }));

    return this.httpClient.post(BASE_URL, data);
  }

  deleteCountryByID(id: number): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/${id}`);
  }
}
