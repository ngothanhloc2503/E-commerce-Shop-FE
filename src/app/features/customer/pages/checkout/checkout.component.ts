import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';

import { AlertService } from '../../../../core/services/alert/alert.service';
import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CheckoutService } from '../../services/checkout/checkout.service';

declare var paypal: any;

@Component({
    selector: 'app-checkout',
    imports: [DatePipe, RouterModule],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  public settingService = inject(GeneralSettingService);
  private checkoutService = inject(CheckoutService);
  private router = inject(Router);

  // Signals
  isLoading = signal<boolean>(false);
  isClicked = signal<boolean>(false);
  listItems = signal<any[]>([]);

  address = '';
  deliverDays = 0;
  deliverDate = 0;
  productTotal = 0;
  shippingCostTotal = 0;
  paymentTotal = 0;
  codSupported = false;
  currencyCode = '';

  private paypalScriptElement: HTMLScriptElement | null = null;
  private paypalLoaded = false; 

  // Init
  ngOnInit() {
    this.getCheckoutInformation();
  }

  // Destroy
  ngOnDestroy() {
    this.removePayPalScript();
  }

  // API
  getCheckoutInformation() {
    this.isLoading.set(true);
    this.checkoutService.getCheckoutInformation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;
          this.address = data.address;
          this.listItems.set(data.listItems);
          this.deliverDays = data.deliverDays;
          this.deliverDate = data.deliverDate;
          this.productTotal = data.productTotal;
          this.shippingCostTotal = data.shippingCostTotal;
          this.paymentTotal = data.paymentTotal;
          this.codSupported = data.codSupported;
          this.currencyCode = data.currencyCode;

          if (this.listItems().length <= 0) {
            this.router.navigateByUrl("/cart");
          } else {
            this.addPayPalScript().then(() => {
              this.renderPayPalButtons();
            });
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.router.navigateByUrl("/cart");
        }
      });
  }

  renderPayPalButtons() {
    if (paypal && !this.paypalLoaded) {
      this.paypalLoaded = true;

      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: this.paymentTotal.toFixed(2), currency_code: this.currencyCode }
            }],
            application_context: { shipping_preference: "NO_SHIPPING" }
          });
        },
        onApprove: (data: any, actions: any) => {
          this.isLoading.set(true);
          return actions.order.capture().then((details: any) => {
            this.checkoutService.processPaypalOrder(details.id)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.isLoading.set(false);
                  this.router.navigateByUrl("/orders");
                  this.alertService.showAlert("Your order has been paid successfully.", "green");
                  this.alertService.closeAlert(3000);
                },
                error: () => {
                  this.isLoading.set(false);
                  this.router.navigateByUrl("/cart");
                },
              });
          });
        },
        onCancel: () => console.log("Payment cancelled by the buyer"),
        onError: (err: any) => {
          this.isLoading.set(false);
          this.alertService.showAndCloseAlertAfterXSecond("PayPal checkout error " + err.message, "red", 3000);
        }
      }).render('#paypal-button-container');
    }
  }

  placeOrder(paymentMethod: string) {
    this.isClicked.set(true);
    this.isLoading.set(true);

    this.checkoutService.placeOrder(paymentMethod)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isClicked.set(false);
          this.isLoading.set(false);
          this.router.navigateByUrl("/orders");
          this.alertService.showAlert("Your order has been created successfully.", "green");
          this.alertService.closeAlert(3000);
        },
        error: () => {
          this.isClicked.set(false);
          this.isLoading.set(false);
          this.router.navigateByUrl("/cart");
        }
      });
  }

  // Action
  addPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.paypalLoaded) {
        resolve();
        return;
      }

      this.removePayPalScript();

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=ASnP1016V0N54WwTz40Kiw5EiKJrTag8kD9ERI4EXuvoPJdbJTRisC1DoF-W_2ACMQJm_4OZW3RRiqR1&currency=${this.currencyCode}`;

      script.onload = () => resolve();
      script.onerror = (err) => reject(err);

      document.body.appendChild(script);
    });
  }

  // Helper
  getShortName(name: string): string {
    return name.length < 60 ? name : name.substring(0, 60) + "...";
  }

  private removePayPalScript() {
    if (this.paypalScriptElement) {
      this.paypalScriptElement.remove();
      this.paypalScriptElement = null;
    }
  }
}