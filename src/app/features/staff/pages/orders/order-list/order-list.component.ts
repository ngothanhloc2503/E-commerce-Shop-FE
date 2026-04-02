import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { GeneralSettingService } from '../../../../../core/services/general-setting/general-setting.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { OrderService } from '../../../services/order/order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  listOrders: any[] = [];
  pageNum = 1;
  pageSize = 5;
  sortField = 'id';
  sortDir = 'asc';
  totalPages = 0;
  totalItems = 0;
  
  searchForm!: FormGroup;
  keyword = new FormControl('', [
    Validators.required
  ])

  constructor(
    private orderService: OrderService,
    private alertService: AlertService,
    private modalService: ModalService,
    public settingService: GeneralSettingService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      keyword: this.keyword
    })

    this.getOrdersByPage();
  }

  getOrdersByPage() {
    let keyword = this.keyword.value ? this.keyword.value : '';
    this.orderService.getOrdersByPage(this.pageNum, this.pageSize, this.sortField, this.sortDir, keyword).subscribe({
      next: (res: any) => {
        this.listOrders = res.content;
        this.totalItems = res.totalItems;
        this.totalPages = res.totalPages;
      },
    })
  }

  deleteOrder(deleteModal: TemplateRef<any>, orderID: number) {
    const title = "Confirm delete order has ID: " + orderID;
    this.modalService.open(deleteModal, {title: title}).subscribe((res) => {
      if (res == "yes") {
        this.orderService.deleteOrder(orderID).subscribe({
          next: (res) => {
            if (res == null) {
              this.getOrdersByPage();
              this.alertService.showAlert("The order ID " + orderID + " has been deleted successfully.", "green");
            } else {
              this.alertService.showAlert("An unexpected error occurred. Please try again later.", "red");
            }

            this.alertService.closeAlert(3000);
          },
        })
      }
    })
  }

  getDestination(info: any): string {
    let address = "";

    if (info.city != null && info.city.length) {
      address += info.city;
    }

    if (info.state != null && info.state.length) {
      address.length > 0 ? address += ", " + info.state : address += info.state;
    } 

    address += ", " + info.country;

    return address;
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

  clear() {
    this.searchForm.patchValue({keyword: ''});
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
}
