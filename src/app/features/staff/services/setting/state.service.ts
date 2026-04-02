import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';

const BASE_URL = API_URL + '/states';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  saveState(state: any): Observable<any> {
    let data = new FormData();
    data.append('state', new Blob([JSON.stringify(state)] , {type: 'application/json'}));

    return this.httpClient.post(BASE_URL, data);
  }

  deleteStateByID(id: any): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/${id}`);
  }
}
