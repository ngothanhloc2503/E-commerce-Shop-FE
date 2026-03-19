import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';
import { UtilsService } from '../../../../shared/utils/utils.service';

const BASE_URL = API_URL + '/address-book';

@Injectable({
  providedIn: 'root'
})
export class AddressBookService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getAddressBook(): Observable<any> {
    return this.httpClient.get(BASE_URL, { 
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getDefaultAddress(): Observable<any> {
    return this.httpClient.get(BASE_URL + `/default`, {
      headers: this.utilsService.createAuthorizationHeader(),
    });
  }
  
  getAddressById(addressId: any): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${addressId}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    });
  }

  setDefault(addressId: any) {
    return this.httpClient.get(BASE_URL + `/default/${addressId}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveAddressBook(address: any): Observable<any> {
    return this.httpClient.post(BASE_URL + '/save', address, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
