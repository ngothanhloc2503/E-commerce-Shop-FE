import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../environment';

const BASE_URL = API_URL + '/checkout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getCheckoutInformation(): Observable<any> {
    return this.httpClient.get(BASE_URL);
  }

  placeOrder(paymentMethod: string): Observable<any> {
    let data = new FormData();
    data.append("paymentMethod", paymentMethod);
    return this.httpClient.post(BASE_URL, data);
  }

  processPaypalOrder(orderId: string): Observable<any> {
    const body = { orderId };
    return this.httpClient.post(BASE_URL + '/paypal', body);
  }
}
