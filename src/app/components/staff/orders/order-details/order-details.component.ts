import { Component } from '@angular/core';
import { AlertService } from '../../../../services/alert/alert.service';
import { OrderService } from '../../../../services/staff/order/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { InputComponent } from '../../../input/input.component';
import { CountryService } from '../../../../services/country/country.service';
import { StateService } from '../../../../services/state/state.service';
import { AddProductModalComponent } from '../add-product-modal/add-product-modal.component';
import { timer } from 'rxjs';
import { UtilsService } from '../../../../services/utils/utils.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputComponent, FormsModule, AddProductModalComponent],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  showAddProductModal = false;

  listCountries: any[] = [];
  listStates: any[] = [];
  listOrderTrack: any[] = [];
  listOrderDetails: any[] = [];
  orderId = 0;

  orderForm!: FormGroup;
  id = new FormControl(0, [Validators.required]);
  userId = new FormControl(0, [Validators.required]);
  userFullName = new FormControl('');
  firstName = new FormControl('', [Validators.required]);
  lastName = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [Validators.required]);
  addressLine1 = new FormControl('', [Validators.required]);
  addressLine2 = new FormControl('');
  city = new FormControl('');
  state = new FormControl('', [Validators.required]);
  country = new FormControl('', [Validators.required]);
  postalCode = new FormControl('', [Validators.required]);
  shippingCost = new FormControl<number>(0, [Validators.required]);
  productCost = new FormControl<number>(0, [Validators.required]);
  subtotal = new FormControl<number>(0, [Validators.required]);
  tax = new FormControl<number>(0, [Validators.required]);
  total = new FormControl<number>(0, [Validators.required]);
  orderTime = new FormControl('', [Validators.required]);
  deliverDays = new FormControl(0, [Validators.required]);
  deliverDate = new FormControl('', [Validators.required]);
  paymentMethod = new FormControl('', [Validators.required]);
  status = new FormControl('', [Validators.required]);
  orderTrack = new FormControl<any>(null);
  orderDetails = new FormControl<any>(null);

  constructor(
    private alertService: AlertService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private countryService: CountryService,
    private stateService: StateService,
    private router: Router,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.orderForm = this.fb.group({
      id: this.id,
      userId: this.userId,
      userFullName: this.userFullName,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
      shippingCost: this.shippingCost,
      productCost: this.productCost,
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      orderTime: this.orderTime,
      deliverDays: this.deliverDays,
      deliverDate: this.deliverDate,
      paymentMethod: this.paymentMethod,
      status: this.status,
      orderTrack: this.orderTrack,
      orderDetails: this.orderDetails
    })

    this.activatedRoute.params.subscribe(p => this.orderId = p['id']);
    if (this.orderId > 0) {
      this.getOrderById();
    }

    this.getAllCountries();
  }

  save() {
    this.listOrderTrack.filter(track => (track.status != null && track.updatedTime != null));
    this.orderForm.patchValue({
      details: this.listOrderTrack,
      orderDetails: this.listOrderDetails,
    });

    this.orderService.saveOrder(this.orderForm.value).subscribe({
      next: (res) => {
        if(res != null) {
          this.alertService.showAlert("The order has been saved successfully.", "green")
  
          timer(3000).subscribe(i => {
            this.alertService.isShowAlert = false;
            this.router.navigateByUrl("/staff/orders");
          })
        } else {
          this.alertService.showAndCloseAlertAfterXSecond("An unexpected error occurred. Please try again later.", "red", 3000);
        }
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    });
  }

  getOrderById() {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (res) => {
        this.orderForm.patchValue(res);
        this.getStateByCountryName();
        this.listOrderTrack = res.orderTrack;
        this.listOrderDetails = res.orderDetails;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  addProductToOrder(productInfo: any) {
    let existing = this.listOrderDetails.some(orderDetail => orderDetail.productId == productInfo.id); 
    
    //Check product exists order details
    if (existing) {
      //If exists
      this.listOrderDetails.forEach(orderDetail => {
        if(orderDetail.productId == productInfo.id) {
          orderDetail.shippingCost += (orderDetail.shippingCost / orderDetail.quantity);
          orderDetail.quantity += 1;
          this.updateQuantity(orderDetail.id);
        }
      })
    } else {
      // If not exists
      let newOrderDetailId = this.listOrderDetails.length == 0 ? 0 : Math.max(...this.listOrderDetails.map(p => p.id)) + 1;

      let orderDetailInfo = {
        id: newOrderDetailId,
        productId: productInfo.id,
        productName: productInfo.name,
        productImagePath: productInfo.mainImagePath,
        quantity: 1,
        productCost: this.utilsService.roundNumber(productInfo.cost),
        productCostTotal: this.utilsService.roundNumber(productInfo.cost),
        shippingCost: 0,
        unitPrice: this.utilsService.roundNumber(productInfo.discountPrice),
        subtotal: this.utilsService.roundNumber(productInfo.discountPrice),
      }
  
      this.listOrderDetails.push(orderDetailInfo);
    }

    this.updateShippingCost();
    this.updateProductCost();
    this.updateSubtotal();
    this.closeModal();
  }

  closeModal() {
    this.showAddProductModal = false;
  }

  removeOrderDetailById(orderDetailId: number) {
    this.listOrderDetails = this.listOrderDetails.filter((orderDetail) => orderDetail.id !== orderDetailId);
    // this.elementRef.nativeElement.querySelector("#order_detail_" + orderDetailId).remove();
    this.updateShippingCost();
    this.updateProductCost();
    this.updateSubtotal();
  }

  addNewTrack() {
    let newTrackId = this.listOrderTrack.length == 0 ? 0 : Math.max(...this.listOrderTrack.map(p => p.id)) + 1;
    
    let track = {
      id: newTrackId,
      updatedTime: this.getFormattedUserLocalDate(),// "yyyy-MM-dd\Thh:mm:ss"
      status: '',
      notes: '',
    }
    this.listOrderTrack.push(track);
  }

  removeTrackById(trackId: number) {
    this.listOrderTrack = this.listOrderTrack.filter((track) => track.id !== trackId);
    // this.elementRef.nativeElement.querySelector("#track_" + trackId).remove();
  }

  updateDeliverDate() {
    if (this.orderTime.value != null) {
      let orderTimeTemp = new Date(Date.parse(this.orderTime.value));
      if (this.deliverDays.value != null) {
        let deliverDateTemp = new Date().setTime(orderTimeTemp.getTime() + this.deliverDays.value*86400000); //86400000=1day
        this.orderForm.patchValue({'deliverDate': deliverDateTemp});
      }
    } 
  }

  updateShippingCost() {
    let totalShippingCost = this.listOrderDetails.reduce((accumulator, current) => accumulator + current.shippingCost, 0);
    this.orderForm.patchValue({'shippingCost': this.utilsService.roundNumber(totalShippingCost)});

    this.updateTotal();
  }

  updateProductCost() {
    let productCostTotal = this.listOrderDetails.reduce((accumulator, current) => accumulator + current.productCostTotal, 0);
    this.orderForm.patchValue({'productCost': Math.round(productCostTotal * 100) / 100});
  }

  updateSubtotal() {
    let subtotal = this.listOrderDetails.reduce((accumulator, current) => accumulator + current.subtotal, 0);
    this.orderForm.patchValue({'subtotal': this.utilsService.roundNumber(subtotal)});

    this.updateTotal();
  }

  updateQuantity(orderDetailId: number) {
    let subtotal = 0;
    let productCost = 0;
    this.listOrderDetails.forEach(orderDetail => {
      if(orderDetail.id == orderDetailId) {
        orderDetail.productCostTotal = this.utilsService.roundNumber(orderDetail.quantity * orderDetail.productCost);
        orderDetail.subtotal = this.utilsService.roundNumber(orderDetail.quantity * orderDetail.unitPrice);
      }
      subtotal += orderDetail.subtotal;
      productCost += orderDetail.productCostTotal;
    })

    this.orderForm.patchValue({
      'subtotal': this.utilsService.roundNumber(subtotal), 
      'productCost': this.utilsService.roundNumber(productCost)
    });
    this.updateTotal();
  }

  updateTotal() {
    let subtotal = this.subtotal.value ? this.subtotal.value : 0;
    let shippingCost = this.shippingCost.value ? this.shippingCost.value : 0;
    let tax = this.tax.value ? this.tax.value : 0;
    this.orderForm.patchValue({"total": this.utilsService.roundNumber(subtotal + shippingCost + tax)});
  }

  getStateByCountryName() {
    if (this.country.value != null && this.country.value != undefined && this.country.value != '') {
      this.stateService.getStateByCountryName(this.country.value).subscribe({
        next: (res) => {
          this.listStates = res;
        },
        error: (err) => {
          this.utilsService.handleError(err);
        }
      })
    }
  }

  getAllCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (res) => {
        this.listCountries = res;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  cancel() {
    this.router.navigateByUrl("/staff/orders");
  }

  getFormattedUserLocalDate(): string {
    const date = new Date();
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
}
