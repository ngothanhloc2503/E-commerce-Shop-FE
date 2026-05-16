import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { API_URL } from '../../../../environment';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { AuthStateService } from '../../../../core/services/auth-state/auth-state.service';

const BASE_URL = API_URL + '/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Signals
  readonly cart = signal<any>({});
  readonly codSupported = signal(false);

  // Computed
  readonly cartItems = computed(() => this.cart()?.items ?? []);
  readonly hasItems = computed(() => this.cartItems().length > 0);
  readonly cartTotal = computed(() => this.cart()?.total ?? 0);
  readonly itemCount = computed(() => this.cartItems().reduce((sum: number, item: any) => sum + item.quantity, 0));

  // Inject
  private httpClient = inject(HttpClient);
  private alertService = inject(AlertService);
  private authState = inject(AuthStateService);

  // API
  removeItem(cartItemId: number) {
    this.httpClient.delete(BASE_URL + `/items/${cartItemId}`).subscribe({
      next: (res: any) => {
        this.cart.set(res.data);
      },
    });
  }

  addProductToCart(productId: number, quantity: number, showAlert = true) {
    if (!this.authState.isCustomer()) {
      this.alertService.showAndCloseAlertAfterXSecond(
        'Please login before add product to cart.', 'red', 5000
      );
      return;
    }

    const data = new FormData();
    data.append('productId', productId.toString());
    data.append('quantity', quantity.toString());

    this.httpClient.post(BASE_URL + '/items', data).subscribe({
      next: (res: any) => {
        this.cart.set(res.data);
        if (showAlert) {
          this.alertService.showAndCloseAlertAfterXSecond(
            'Item has been added to cart.', 'green', 5000
          );
        }
      },
    });
  }

  getCart() {
    if (!this.authState.isCustomer()) {
      this.cart.set({});
      this.codSupported.set(false);
      return;
    }

    this.httpClient.get(BASE_URL).subscribe({
      next: (res: any) => {
        this.cart.set(res.data);
        this.codSupported.set(res.data.shippingSupported ?? false);
      },
    });
  }
}