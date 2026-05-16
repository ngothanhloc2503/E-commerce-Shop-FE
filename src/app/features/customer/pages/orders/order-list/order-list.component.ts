import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { GeneralSettingService } from '../../../../../core/services/general-setting/general-setting.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { getPaginationSignals } from '../../../../../shared/utils/pagination.utils';
import { OrderService } from '../../../services/order/order.service';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { ReturnOrderRequestComponent } from '../return-order-request/return-order-request.component';

@Component({
    selector: 'app-order-list',
    imports: [ReactiveFormsModule, DatePipe, OrderDetailsComponent, ReturnOrderRequestComponent, PaginationComponent],
    templateUrl: './order-list.component.html',
    styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  // Inject
  private orderService = inject(OrderService);
  private alertService = inject(AlertService);
  public settingService = inject(GeneralSettingService);
  private destroyRef = inject(DestroyRef);

  // State
  readonly showOrderDetailsModal = signal(false);
  readonly showReturnOrderRequestModal = signal(false);
  readonly orderSelected = signal<any>({});
  readonly listOrders = signal<any[]>([]);

  // Pagination
  readonly pageNum = signal(1);
  readonly pageSize = signal(5);
  readonly sortField = signal('orderTime');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly totalItems = signal(0);
  readonly totalPages = signal(0);
  pagination = getPaginationSignals(this.pageNum, this.pageSize, this.totalItems, this.totalPages);

  // Lifecycle
  ngOnInit() {
    this.loadOrders();
  }

  // API
  loadOrders() {
    this.orderService
      .getOrdersByPage(this.pageNum(), this.pageSize(), this.sortField(), this.sortDir())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        const data = res.data;
        this.listOrders.set(data.content);
        this.totalItems.set(data.totalItems);
        this.totalPages.set(data.totalPages);
      });
  }

  // Sorting
  sort(field: string) {
    if (field.toLowerCase() === this.sortField().toLowerCase()) {
      this.sortDir.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.pageNum.set(1);
    this.loadOrders();
  }

  sortIcon(field: string): string {
    if (this.sortField().toLowerCase() !== field.toLowerCase()) return '';
    return this.sortDir() === 'desc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
  }

  // Pagination
  goToPage(page: number) {
    if (isNaN(page) || page < 1 || page > this.totalPages()) return;
    this.pageNum.set(page);
    this.loadOrders();
  }

  changePageSize(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const size = Number(value);
    if (isNaN(size)) return;

    this.pageSize.set(size);
    this.pageNum.set(1);
    this.loadOrders();
  }

  // Modals
  openOrderDetailsModal(order: any) {
    this.orderSelected.set(order);
    this.showOrderDetailsModal.set(true);
  }

  openReturnOrderRequestModal(order: any) {
    this.orderSelected.set(order);
    this.showReturnOrderRequestModal.set(true);
  }

  closeModal() {
    this.showOrderDetailsModal.set(false);
    this.showReturnOrderRequestModal.set(false);
  }

  returnRequestSuccessful() {
    this.showOrderDetailsModal.set(false);
    this.showReturnOrderRequestModal.set(false);
    this.loadOrders();
    this.alertService.showAndCloseAlertAfterXSecond(
      'The order return request has been submitted', 'green', 3000
    );
  }

  // Helpers
  isReturnable(orderTrack: any[]): boolean {
    return (
      !this.hasStatus(orderTrack, 'RETURNED') &&
      !this.hasStatus(orderTrack, 'RETURN_REQUESTED') &&
      this.hasStatus(orderTrack, 'DELIVERED')
    );
  }

  hasStatus(tracks: any[], status: string): boolean {
    return tracks?.some(t => t.status === status) ?? false;
  }

  getShortName(name: string, maxLen = 70): string {
    return name.length <= maxLen ? name : name.substring(0, maxLen) + '…';
  }
}