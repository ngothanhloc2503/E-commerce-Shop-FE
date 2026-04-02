import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants';

const BASE_URL = API_URL + '/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  updateAccountDetails(accountDetails: any, photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('accountDetails', new Blob([JSON.stringify(accountDetails)] , {type: 'application/json'}));
    formData.append('photo', photo)
    return this.httpClient.post(BASE_URL, formData)
  }

  getAccountDetails(): Observable<any> {
    return this.httpClient.get(BASE_URL);
  }
}
