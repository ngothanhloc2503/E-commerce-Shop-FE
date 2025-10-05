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
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  isClicked: boolean = false;
  address: string = '';
  listItems: any[] = [];
  deliverDays: number = 0;
  deliverDate: number = 0;
  productTotal: number = 0;
  shippingCostTotal: number = 0;
  paymentTotal: number = 0;
  codSupported: boolean = false;
  currencyCode: string = '';

  constructor(
    private alertService: AlertService,
    public settingService: GeneralSettingService,
    private checkoutService: CheckoutService,
    private router: Router,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.getCheckoutInformation();
    this.loadPayPalScript();
  }

  loadPayPalScript() {
    window.paypal.Buttons({
      enableStandardCardFields: true,
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              value: Math.round(this.paymentTotal * 100) / 100,
              currency_code: this.currencyCode,
            }
          }],
          application_context: {
            shipping_preference: "NO_SHIPPING",
          }
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          this.checkoutService.processPaypalOrder(details.id).subscribe({
            next: (res) => {
              this.router.navigateByUrl("/cart");
              this.alertService.showAlert("Your order has been paid successfully.", "green");
              this.alertService.closeAlert(3000);
            }, 
            error: (err) => {
              this.router.navigateByUrl("/checkout");
              this.utilsService.handleError(err);
            },
          });
        });
      },
      onCancel: (data: any) => {
        console.log("Payment cancelled by the buyer");
      },
      onError: (err: any) => {
        this.alertService.showAndCloseAlertAfterXSecond("PayPal checkout error " + err.message, "red", 3000);
      }
    }).render('#paypal-button-container');
  }

  placeOrder(paymentMethod: string) {
    this.isClicked = true;
    this.checkoutService.placeOrder(paymentMethod).subscribe({
      next: (res) => {
        this.isClicked = false;
        this.router.navigateByUrl("/orders");
      },
      error: (err) => {
        this.isClicked = false;
        this.router.navigateByUrl("/cart");
        this.utilsService.handleError(err);
      }
    })
  }

  getCheckoutInformation() {
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
      },
      error: (err: any) => {
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
