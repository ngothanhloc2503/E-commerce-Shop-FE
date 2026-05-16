import { Component, DestroyRef, inject, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { getPaginationSignals } from '../../../../../shared/utils/pagination.utils';
import { OrderService } from '../../../services/order/order.service';
import { GeneralSettingService } from '../../../../../core/services/general-setting/general-setting.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [PaginationComponent, ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private orderService = inject(OrderService);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);
  private fb = inject(FormBuilder);

  public settingService = inject(GeneralSettingService);

  // Signals
  listOrders = signal<any[]>([]);
  pageNum = signal(1);
  pageSize = signal(5);
  sortField = signal('id');
  sortDir = signal<'asc' | 'desc'>('asc');
  totalPages = signal(0);
  totalItems = signal(0);

  // Form
  searchForm: FormGroup = this.fb.group({
    keyword: ['', Validators.required]
  })

  // Computed
  pagination = getPaginationSignals(this.pageNum, this.pageSize, this.totalItems, this.totalPages);

  ngOnInit() {
    this.getOrdersByPage();
  }

  // API
  getOrdersByPage() {
    const keyword = this.searchForm.value.keyword || '';

    this.orderService.getOrdersByPage(this.pageNum(), this.pageSize(), this.sortField(), this.sortDir(), keyword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;

          this.listOrders.set(data.content);
          this.totalItems.set(data.totalItems);
          this.totalPages.set(data.totalPages);
        },
      })
  }

  deleteOrder(deleteModal: TemplateRef<any>, orderID: number) {
    const title = "Confirm delete order has ID: " + orderID;
    this.modalService.open(deleteModal, { title: title }).subscribe((res) => {
      if (res == "yes") {
        this.orderService.deleteOrder(orderID).subscribe({
          next: () => {
            this.getOrdersByPage();
            this.alertService.showAlert("The order ID " + orderID + " has been deleted successfully.", "green");

            this.alertService.closeAlert(3000);
          },
        })
      }
    })
  }

  // Action
  sort(field: string) {
    if (field === this.sortField()) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }

    this.getOrdersByPage();
  }

  search() {
    this.getOrdersByPage();
  }

  changePageSize(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;

    this.pageSize.set(Number(value));
    this.pageNum.set(1);
    this.getOrdersByPage();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    this.pageNum.set(page);
    this.getOrdersByPage();
  }

  clear() {
    this.searchForm.patchValue({ keyword: '' });
    this.getOrdersByPage();
  }

  // Helper
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
}
