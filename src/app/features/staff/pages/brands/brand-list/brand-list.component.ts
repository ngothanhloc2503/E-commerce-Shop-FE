import { Component, DestroyRef, inject, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { downloadBlob } from '../../../../../shared/utils/file-download.util';
import { getPaginationSignals } from '../../../../../shared/utils/pagination.utils';
import { BrandService } from '../../../services/brand/brand.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-brand-list',
    imports: [ReactiveFormsModule, FormsModule, RouterModule, PaginationComponent],
    templateUrl: './brand-list.component.html',
    styleUrl: './brand-list.component.css'
})
export class BrandListComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private brandService = inject(BrandService);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);
  private fb = inject(FormBuilder);

  // Signals
  listBrands = signal<any[]>([]);
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
    this.getBrandsByPage();
  }

  // API
  getBrandsByPage() {
    const keyword = this.searchForm.value.keyword || '';

    this.brandService.getBrandByPage(this.pageNum(), this.pageSize(), this.sortField(), this.sortDir(), keyword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;

          this.listBrands.set(data.content);
          this.totalPages.set(data.totalPages);
          this.totalItems.set(data.totalItems);
        },
      })
  }

  deleteBrand(deleteModal: TemplateRef<any>, brandID: number) {
    const title = "Confirm delete brand has ID: " + brandID;
    this.modalService.open(deleteModal, { title: title }).subscribe((res) => {
      if (res == "yes") {
        this.brandService.deleteBrand(brandID).subscribe({
          next: () => {
            this.getBrandsByPage();
            this.alertService.showAlert("The brand ID " + brandID + " has been deleted successfully.", "green");

            this.alertService.closeAlert(3000);
          },
        })
      }
    })
  }

  exportToCsv() {
    this.brandService.exportToCsv()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'text/csv;charset=utf-8' });
          downloadBlob(blob, `brands_${Date.now()}.csv`);
        },
        error: () => {
          this.alertService.showAndCloseAlertAfterXSecond('Error downloading the file', 'red', 5000);
        }
      });
  }

  // Action
  sort(field: string) {
    if (field === this.sortField()) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }

    this.getBrandsByPage();
  }

  search() {
    this.getBrandsByPage();
  }

  changePageSize(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;

    this.pageSize.set(Number(value));
    this.pageNum.set(1);
    this.getBrandsByPage();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    this.pageNum.set(page);
    this.getBrandsByPage();
  }

  clear() {
    this.searchForm.patchValue({ keyword: '' });
    this.getBrandsByPage();
  }
}
