import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { AuthStateService } from '../../../../core/services/auth-state/auth-state.service';

const BASE_URL = API_URL + '/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart: any = {};
  codSupported: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private alertService: AlertService,
    private authState: AuthStateService,
  ) { }

  removeItem(cartItemId: number) {
    this.httpClient.delete(BASE_URL + `/items/${cartItemId}`).subscribe({
      next: (res: any) => {
        this.cart = res;
      }
    })
  }

  addProductToCart(productId: number, quantity: number, showAlert = true) {
    if (!this.authState.isCustomer()) {
      this.alertService.showAndCloseAlertAfterXSecond("Please login before add product to cart.", "red", 5000);
    } else {
      this.addItem(productId, quantity).subscribe({
        next: (res) => {
          this.cart = res;
          if (showAlert) {
            this.alertService.showAndCloseAlertAfterXSecond("Item has been added to cart.", "green", 5000);
          }
        },
      })
    }
  }

  private addItem(productId: any, quantity: any): Observable<any> {
    let data = new FormData();
    data.append("productId", productId);
    data.append("quantity", quantity);
    
    return this.httpClient.post(BASE_URL + '/items', data)
  }

  getCart() {
    if (this.authState.isCustomer()) {
      this.httpClient.get(BASE_URL).subscribe({
        next: (res: any) => {
          this.cart = res;
          this.codSupported = res.shippingSupported;
        }
      })
    } else {
      this.cart = {};
    }
  }
}
