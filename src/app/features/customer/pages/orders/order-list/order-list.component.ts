import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { GeneralSettingService } from '../../../../../core/services/general-setting/general-setting.service';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { OrderService } from '../../../services/order/order.service';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { ReturnOrderRequestComponent } from '../return-order-request/return-order-request.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, OrderDetailsComponent, ReturnOrderRequestComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  showOrderDetailsModal = false;
  showReturnOrderRequestModal = false;
  orderSelected: any = {};

  listOrders: any[] = [];
  pageNum = 1;
  pageSize = 5;
  sortField = 'orderTime';
  sortDir = 'desc';
  totalPages = 0;
  totalItems = 0;

  constructor(
    private orderService: OrderService,
    private alertService: AlertService,
    public settingService: GeneralSettingService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.getOrdersByPage();
  }

  getOrdersByPage() {
    this.orderService.getOrdersByPage(this.pageNum, this.pageSize, this.sortField, this.sortDir).subscribe({
      next: (res: any) => {
        this.listOrders = res.content;
        this.totalItems = res.totalItems;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  openOrderDetailsModal(order: any) {
    this.orderSelected = order;
    this.showOrderDetailsModal = true;
  }

  openReturnOrderRequestModal(order: any) {
    this.orderSelected = order;
    this.showReturnOrderRequestModal = true;
  }
  
  returnRequestSuccessful() {
    this.showOrderDetailsModal = false;
    this.showReturnOrderRequestModal = false;

    this.getOrdersByPage();

    this.alertService.showAndCloseAlertAfterXSecond("The order return request has been submitted", "green", 3000);
  }

  closeModal() {
    this.showOrderDetailsModal = false;
    this.showReturnOrderRequestModal = false;
  }

  isReturnable(orderTrack: any): boolean {
    if (!this.hasTrack(orderTrack, "RETURNED") && !this.hasTrack(orderTrack, "RETURN_REQUESTED") && this.hasTrack(orderTrack, "DELIVERED")) {
      return true;
    }

    return false;
  }

  hasTrack(orderTrack: any, status: string): boolean {
    for (let track of orderTrack) {
      if (track.status === status) {
        return true;
      }
    }
    return false;
  }

  sort(field: string) {
    if (field.toLocaleLowerCase() === this.sortField.toLocaleLowerCase()) {
      if (this.sortDir.toLocaleLowerCase() === 'asc') {
        this.sortDir = 'desc';
      } else {
        this.sortDir = 'asc';
      }
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }

    this.getOrdersByPage();
  }

  search() {
    this.getOrdersByPage();
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.pageSize = Number(target.value);
    } else {
      return;
    }
    this.getOrdersByPage();
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber)) {
      return
    } else if (pageNumber > this.totalPages || pageNumber < 1) {
      return;
    }
    this.pageNum = pageNumber;
    this.getOrdersByPage();
  }

  get startCount(): number {
    if (this.totalItems == 0) return 0;
    return (this.pageNum - 1) * this.pageSize + 1;
  }

  get endCount(): number {
    if (this.pageSize < 1) {
      return this.totalItems;
    }
    return (this.pageNum * this.pageSize > this.totalItems) ? this.totalItems : this.pageNum * this.pageSize;
  }

  getShortName(name: string): string {
    if (name.length < 70) return name;
    else return name.substring(0, 70) + "...";
  }
}
