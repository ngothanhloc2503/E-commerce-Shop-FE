import { Component, DestroyRef, inject, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { getPaginationSignals } from '../../../../../shared/utils/pagination.utils';
import { ShippingRateService } from '../../../services/shipping-rate/shipping-rate.service';

@Component({
    selector: 'app-shipping-rate-list',
    imports: [ReactiveFormsModule, RouterModule, PaginationComponent],
    templateUrl: './shipping-rate-list.component.html',
    styleUrl: './shipping-rate-list.component.css'
})
export class ShippingRateListComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private shippingRateService = inject(ShippingRateService);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);
  private fb = inject(FormBuilder);

  // Signals
  listShippingRates = signal<any[]>([]);
  pageNum = signal(1);
  pageSize = signal(5);
  sortField = signal('id');
  sortDir = signal<'asc' | 'desc'>('asc');
  totalPages = signal(0);
  totalItems = signal(0);

  // Form
  searchForm = this.fb.group({
    keyword: new FormControl('', [Validators.required])
  });

  // Computed 
  pagination = getPaginationSignals(this.pageNum, this.pageSize, this.totalItems, this.totalPages);

  // Init
  ngOnInit() {
    this.getShippingRatesByPage();
  }

  // API
  getShippingRatesByPage() {
    let keyword = this.searchForm.get('keyword')?.value || '';

    this.shippingRateService.getShippingRatesByPage(this.pageNum(), this.pageSize(), this.sortField(), this.sortDir(), keyword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;

          this.listShippingRates.set(data.content);
          this.totalPages.set(data.totalPages);
          this.totalItems.set(data.totalItems);
        },
      });
  }

  changeCodSupportedStatus(id: number, supported: boolean) {
    this.shippingRateService.changeCodSupportedStatus(id, !supported)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.getShippingRatesByPage();
          this.alertService.showAndCloseAlertAfterXSecond("The shipping rate ID " + id + " has been " + (supported ? "disabled" : "enabled"), "green", 3000);
        },
      });
  }


  deleteShippingRate(deleteModal: TemplateRef<any>, shippingRateId: number) {
    const title = "Confirm delete shipping rate has ID: " + shippingRateId;
    this.modalService.open(deleteModal, { title: title }).subscribe((res) => {
      if (res == "yes") {
        this.shippingRateService.deleteShippingRate(shippingRateId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.getShippingRatesByPage();
              this.alertService.showAndCloseAlertAfterXSecond("The shipping rate ID " + shippingRateId + " has been deleted successfully.", "green", 3000);
            },
          });
      }
    });
  }

  // Action
  sort(field: string) {
    if (field.toLowerCase() === this.sortField().toLowerCase()) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.getShippingRatesByPage();
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.pageSize.set(Number(target.value));
      this.pageNum.set(1);
    }
    this.getShippingRatesByPage();
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber) || pageNumber > this.totalPages() || pageNumber < 1) return;
    this.pageNum.set(pageNumber);
    this.getShippingRatesByPage();
  }

  search() {
    this.pageNum.set(1);
    this.getShippingRatesByPage();
  }

  clear() {
    this.searchForm.patchValue({keyword: ''});
    this.pageNum.set(1);
    this.getShippingRatesByPage();
  }
}
