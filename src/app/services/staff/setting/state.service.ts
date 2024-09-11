import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/staff/states';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getListStatesByCountryID(countryID: any): Observable<any> {
    return this.httpClient.get(BASE_URL + `/list-by-country/${countryID}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveState(state: any): Observable<any> {
    let data = new FormData();
    data.append('state', new Blob([JSON.stringify(state)] , {type: 'application/json'}));

    return this.httpClient.post(BASE_URL + '/save', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  deleteStateByID(id: any): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/delete/${id}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
