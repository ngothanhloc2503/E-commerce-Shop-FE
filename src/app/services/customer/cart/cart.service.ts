import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { Observable } from 'rxjs';
import { AlertService } from '../../alert/alert.service';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/customer/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart: any = {};
  codSupported: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private alertService: AlertService,
    private utilsService: UtilsService,
  ) { }

  removeItem(cartItemId: number) {
    this.httpClient.delete(BASE_URL + `/items/${cartItemId}`, { 
      headers: this.utilsService.createAuthorizationHeader(),
    }).subscribe({
      next: (res: any) => {
        this.cart = res;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  addProductToCart(productId: number, quantity: number, showAlert = true) {
    if (!StorageService.isCustomerLoggedIn()) {
      this.alertService.showAndCloseAlertAfterXSecond("Please login before add product to cart.", "red", 5000);
    } else {
      this.addItem(productId, quantity).subscribe({
        next: (res) => {
          this.cart = res;
          if (showAlert) {
            this.alertService.showAndCloseAlertAfterXSecond("Item has been added to cart.", "green", 5000);
          }
        },
        error: (err) => {
          this.utilsService.handleError(err);
        }
      })
    }
  }

  private addItem(productId: any, quantity: any): Observable<any> {
    let data = new FormData();
    data.append("productId", productId);
    data.append("quantity", quantity);
    
    return this.httpClient.post(BASE_URL + '/add-item', data, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getCart() {
    if (StorageService.isCustomerLoggedIn()) {
      this.getObservableCart().subscribe({
        next: (res) => {
          this.cart = res;
          this.codSupported = res.shippingSupported;
        },
        error: (err) => {
          this.cart = null;
          this.utilsService.handleError(err);
        }
      })
    } else {
      this.cart = {};
    }
  }

  private getObservableCart(): Observable<any> {
    return this.httpClient.get(BASE_URL, { 
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
