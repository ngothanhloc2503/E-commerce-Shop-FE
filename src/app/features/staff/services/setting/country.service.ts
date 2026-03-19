import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';
import { UtilsService } from '../../../../shared/utils/utils.service';

const BASE_URL = API_URL + '/staff/countries';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getAllCountries(): Observable<any> {
    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveCountry(country: any): Observable<any> {
    let data = new FormData();
    data.append('country', new Blob([JSON.stringify(country)] , {type: 'application/json'}));

    return this.httpClient.post(BASE_URL + '/save', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  deleteCountryByID(id: number): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/delete/${id}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
