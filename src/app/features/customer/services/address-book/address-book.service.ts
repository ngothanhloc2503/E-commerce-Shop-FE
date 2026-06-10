import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../core/constants/app.constants';

const BASE_URL = API_URL + '/address-book';

@Injectable({
  providedIn: 'root'
})
export class AddressBookService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getAddressBook(): Observable<any> {
    return this.httpClient.get(BASE_URL,)
  }

  getDefaultAddress(): Observable<any> {
    return this.httpClient.get(BASE_URL + `/default`);
  }
  
  getAddressById(addressId: any): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${addressId}`);
  }

  setDefault(addressId: any) {
    return this.httpClient.put(BASE_URL + `/default/${addressId}`, {});
  }

  deleteAddress(addressId: any) {
    return this.httpClient.delete(BASE_URL + `/${addressId}`);
  }

  saveAddressBook(address: any): Observable<any> {
    return this.httpClient.post(BASE_URL, address);
  }
}
