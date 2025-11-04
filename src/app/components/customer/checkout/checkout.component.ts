import { Component } from '@angular/core';
import { AlertService } from '../../../services/alert/alert.service';
import { GeneralSettingService } from '../../../services/general-setting/general-setting.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../../../services/customer/checkout/checkout.service';
import { UtilsService } from '../../../services/utils/utils.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  isClicked: boolean = false;
  isLoading: boolean = false;
  address: string = '';
  listItems: any[] = [];
  deliverDays: number = 0;
  deliverDate: number = 0;
  productTotal: number = 0;
  shippingCostTotal: number = 0;
  paymentTotal: number = 0;
  codSupported: boolean = false;
  currencyCode: string = '';
  paypalLoaded: boolean = false;

  constructor(
    private alertService: AlertService,
    public settingService: GeneralSettingService,
    private checkoutService: CheckoutService,
    private router: Router,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.getCheckoutInformation();
  }

  ngOnDestroy() {
    this.isLoading = false;
    const paypalScript = document.querySelector('script[src^="https://www.paypal.com/sdk/js"]');
    if (paypalScript) {
      paypalScript.remove();
      this.paypalLoaded = false;
    }
  }

  getCheckoutInformation() {
    this.isLoading = true;
    this.checkoutService.getCheckoutInformation().subscribe({
      next: (res: any) => {
        this.address = res.address;
        this.listItems = res.listItems;
        this.deliverDays = res.deliverDays;
        this.deliverDate = res.deliverDate;
        this.productTotal = res.productTotal;
        this.shippingCostTotal = res.shippingCostTotal;
        this.paymentTotal = res.paymentTotal;
        this.codSupported = res.codSupported;
        this.currencyCode = res.currencyCode;

        if (this.listItems.length <= 0) {
          this.router.navigateByUrl("/cart");
        } else {
          this.addPayPalScript().then(() => {
            this.renderPayPalButtons();
          });
        }

        this.isLoading = false;
      },
      error: (err: any) => {
        this.router.navigateByUrl("/cart");
        this.utilsService.handleError(err);
      }
    })
  }

  addPayPalScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).paypal) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=ASnP1016V0N54WwTz40Kiw5EiKJrTag8kD9ERI4EXuvoPJdbJTRisC1DoF-W_2ACMQJm_4OZW3RRiqR1&currency=${this.currencyCode}`;
      script.onload = () => {
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  renderPayPalButtons() {
    if ((window as any).paypal && !this.paypalLoaded) {
      this.paypalLoaded = true;

      (window as any).paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: this.paymentTotal.toFixed(2),
                currency_code: this.currencyCode
              }
            }],
            application_context: {
              shipping_preference: "NO_SHIPPING",
            }
          });
        },
        onApprove: (data: any, actions: any) => {
          this.isLoading = true;
          return actions.order.capture().then((details: any) => {
            this.checkoutService.processPaypalOrder(details.id).subscribe({
              next: () => {
                this.isLoading = false;
                this.router.navigateByUrl("/orders");
                this.alertService.showAlert("Your order has been paid successfully.", "green");
                this.alertService.closeAlert(3000);
              },
              error: (err) => {
                this.isLoading = false;
                this.router.navigateByUrl("/checkout");
                this.utilsService.handleError(err);
              },
            });
          });
        },
        onCancel: () => {
          console.log("Payment cancelled by the buyer");
        },
        onError: (err: any) => {
          this.isLoading = false;
          this.alertService.showAndCloseAlertAfterXSecond("PayPal checkout error " + err.message, "red", 3000);
        }
      }).render('#paypal-button-container');
    }
  }

  placeOrder(paymentMethod: string) {
    this.isClicked = true;
    this.isLoading = true;
    this.checkoutService.placeOrder(paymentMethod).subscribe({
      next: (res) => {
        this.isClicked = false;
        this.isLoading = false;
        this.router.navigateByUrl("/orders");
        this.alertService.showAlert("Your order has been created successfully.", "green");
        this.alertService.closeAlert(3000);
      },
      error: (err) => {
        this.isClicked = false;
        this.isLoading = false;
        this.router.navigateByUrl("/cart");
        this.utilsService.handleError(err);
      }
    })
  }

  getShortName(name: string): string {
    if (name.length < 60) return name;
    else return name.substring(0, 60) + "...";
  }
}
