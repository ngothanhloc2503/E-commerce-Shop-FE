import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';
import { UtilsService } from '../../../../shared/utils/utils.service';

const BASE_URL = API_URL + '/checkout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getCheckoutInformation(): Observable<any> {
    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
    });
  }

  placeOrder(paymentMethod: string): Observable<any> {
    let data = new FormData();
    data.append("paymentMethod", paymentMethod);
    return this.httpClient.post(BASE_URL + '/place-order', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    });
  }

  processPaypalOrder(orderId: string): Observable<any> {
    const body = { orderId };
    return this.httpClient.post(BASE_URL + '/process-paypal-order?', body, {
      headers: this.utilsService.createAuthorizationHeader(),
    });
  }
}
