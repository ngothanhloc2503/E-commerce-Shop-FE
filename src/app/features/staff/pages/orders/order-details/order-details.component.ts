import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { CountryService } from '../../../../../core/services/country/country.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { round } from '../../../../../shared/utils/number.util';
import { OrderService } from '../../../services/order/order.service';
import { AddProductModalComponent } from '../add-product-modal/add-product-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-order-details',
    imports: [ReactiveFormsModule, InputComponent, AddProductModalComponent, DatePipe],
    templateUrl: './order-details.component.html',
    styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  // Inject
  private alertService = inject(AlertService);
  private orderService = inject(OrderService);
  private activatedRoute = inject(ActivatedRoute);
  private countryService = inject(CountryService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Signals
  showAddProductModal = signal(false);
  listCountries = signal<any[]>([]);
  listStates = signal<any[]>([]);
  listOrderTrack = signal<any[]>([]);
  listOrderDetails = signal<any[]>([]);
  orderId = signal(0);
  isSubmitting = signal(false);

  // Form
  orderForm = inject(FormBuilder).group({
    id: new FormControl(0, [Validators.required]),
    userId: new FormControl(0, [Validators.required]),
    userFullName: new FormControl(''),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    addressLine1: new FormControl('', [Validators.required]),
    addressLine2: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    postalCode: new FormControl('', [Validators.required]),
    shippingCost: new FormControl<number>(0, [Validators.required]),
    productCost: new FormControl<number>(0, [Validators.required]),
    subtotal: new FormControl<number>(0, [Validators.required]),
    tax: new FormControl<number>(0, [Validators.required]),
    total: new FormControl<number>(0, [Validators.required]),
    orderTime: new FormControl('', [Validators.required]),
    deliverDays: new FormControl(0, [Validators.required]),
    deliverDate: new FormControl('', [Validators.required]),
    paymentMethod: new FormControl('', [Validators.required]),
    status: new FormControl('', [Validators.required]),
    orderTrack: new FormControl<any>(null),
    orderDetails: new FormControl<any>(null)
  });

  // Init
  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p: any) => {
        const id = p['id'];
        this.orderId.set(Number(id) || 0);
        if (this.orderId() > 0) {
          this.getOrderById();
        }
      });

    this.getAllCountries();
  }

  // API
  save() {
    this.isSubmitting.set(true);
    this.orderForm.patchValue({
      orderTrack: this.listOrderTrack(),
      orderDetails: this.listOrderDetails(),
    });

    this.orderService.saveOrder(this.orderForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.alertService.showAlert("The order has been saved successfully.", "green");
          setTimeout(() => {
            this.alertService.closeAlert();
            this.router.navigateByUrl("/staff/orders");
          }, 3000);
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
  }

  getOrderById() {
    this.orderService.getOrderById(this.orderId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;

          this.orderForm.patchValue(data);
          this.getStateByCountryName();
          this.listOrderTrack.set(data.orderTrack || []);
          this.listOrderDetails.set(data.orderDetails || []);
        },
      });
  }

  getStateByCountryName() {
    const countryVal = this.orderForm.get('country')?.value;
    if (countryVal) {
      this.countryService.getStateByCountryName(countryVal)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (res) => this.listStates.set(res.data) });
    } else {
      this.listStates.set([]);
    }
  }

  getAllCountries() {
    this.countryService.getAllCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.listCountries.set(res.data) });
  }

  // Action
  addProductToOrder(productInfo: any) {
    const currentDetails = this.listOrderDetails();
    const existingIdx = currentDetails.findIndex(d => d.productId == productInfo.id); 

    if (existingIdx !== -1) {
      const updatedDetails = currentDetails.map(d => {
        if (d.productId == productInfo.id) {
          return { ...d, shippingCost: d.shippingCost + (d.shippingCost / d.quantity), quantity: d.quantity + 1 };
        }
        return d;
      });
      this.listOrderDetails.set(updatedDetails);
      
      const updatedDetail = updatedDetails.find(d => d.productId == productInfo.id);
      if (updatedDetail) this.updateQuantity(updatedDetail.id);
    } else {
      let newOrderDetailId = currentDetails.length == 0 ? 0 : Math.max(...currentDetails.map(p => p.id)) + 1;
      let orderDetailInfo = {
        id: newOrderDetailId, productId: productInfo.id, productName: productInfo.name,
        productImagePath: productInfo.mainImagePath, quantity: 1, productCost: round(productInfo.cost),
        productCostTotal: round(productInfo.cost), shippingCost: 0, unitPrice: round(productInfo.discountPrice),
        subtotal: round(productInfo.discountPrice),
      }
      this.listOrderDetails.update(details => [...details, orderDetailInfo]);
    }

    this.updateShippingCost();
    this.updateProductCost();
    this.updateSubtotal();
    this.closeModal();
  }

  closeModal() { 
    this.showAddProductModal.set(false); 
  }

  removeOrderDetailById(orderDetailId: number) {
    this.listOrderDetails.update(details => details.filter(d => d.id !== orderDetailId));
    this.updateShippingCost();
    this.updateProductCost();
    this.updateSubtotal();
  }

  addNewTrack() {
    const currentTracks = this.listOrderTrack();

    let newTrackId = currentTracks.length == 0 ? 0 : Math.max(...currentTracks.map(p => p.id)) + 1;
    let track = { 
      id: newTrackId, 
      updatedTime: this.getFormattedUserLocalDate(), 
      status: '', 
      notes: '' };

    this.listOrderTrack.update(tracks => [...tracks, track]);
  }

  removeTrackById(trackId: number) {
    this.listOrderTrack.update(tracks => tracks.filter(t => t.id !== trackId));
  }

  updateDetailField(detailId: number, field: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.listOrderDetails.update(details => 
      details.map(d => d.id === detailId ? { ...d, [field]: value } : d)
    );
  }

  updateTrackField(trackId: number, field: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.listOrderTrack.update(tracks => 
      tracks.map(t => t.id === trackId ? { ...t, [field]: value } : t)
    );
  }

  updateDeliverDate() {
    const orderTimeVal = this.orderForm.get('orderTime')?.value;
    const deliverDaysVal = this.orderForm.get('deliverDays')?.value;
    if (orderTimeVal != null && deliverDaysVal != null) {
      let orderTimeTemp = new Date(Date.parse(orderTimeVal));
      let deliverDateTemp = new Date().setTime(orderTimeTemp.getTime() + deliverDaysVal * 86400000);
      this.orderForm.patchValue({'deliverDate': new Date(deliverDateTemp).toISOString().slice(0, 16)}); 
    } 
  }

  updateShippingCost() {
    const total = this.listOrderDetails().reduce((acc, curr) => acc + Number(curr.shippingCost), 0);
    this.orderForm.patchValue({'shippingCost': round(total)});

    this.updateTotal();
  }

  updateProductCost() {
    const total = this.listOrderDetails().reduce((acc, curr) => acc + Number(curr.productCostTotal), 0);
    this.orderForm.patchValue({'productCost': Math.round(total * 100) / 100});
  }

  updateSubtotal() {
    const total = this.listOrderDetails().reduce((acc, curr) => acc + Number(curr.subtotal), 0);
    this.orderForm.patchValue({'subtotal': round(total)});

    this.updateTotal();
  }

  updateQuantity(orderDetailId: number) {
    const details = this.listOrderDetails();
    let subtotal = 0;
    let productCost = 0;
    
    const updatedDetails = details.map(d => {
      if(d.id == orderDetailId) {
        return { ...d, productCostTotal: round(d.quantity * d.productCost), subtotal: round(d.quantity * d.unitPrice) };
      }
      return d;
    });

    this.listOrderDetails.set(updatedDetails);

    updatedDetails.forEach(d => { subtotal += d.subtotal; productCost += d.productCostTotal; });

    this.orderForm.patchValue({ 'subtotal': round(subtotal), 'productCost': round(productCost) });
    this.updateTotal();
  }

  updateTotal() {
    const subtotal = this.orderForm.get('subtotal')?.value || 0;
    const shippingCost = this.orderForm.get('shippingCost')?.value || 0;
    const tax = this.orderForm.get('tax')?.value || 0;
    this.orderForm.patchValue({"total": round(subtotal + shippingCost + tax)});
  }

  cancel() { 
    this.router.navigateByUrl("/staff/orders");
  }

  getFormattedUserLocalDate(): string {
    const date = new Date();
    const p = (n: number) => n.toString().padStart(2, '0');
    
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
  };
}
