import { Component, DestroyRef, inject, signal, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { CategoryService } from '../../../services/category/category.service';
import { ProductService } from '../../../services/product/product.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { getPaginationSignals } from '../../../../../shared/utils/pagination.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { downloadBlob } from '../../../../../shared/utils/file-download.util';

@Component({
    selector: 'app-product-list',
    imports: [RouterModule, ReactiveFormsModule, PaginationComponent],
    templateUrl: './product-list.component.html',
    styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);
  private fb = inject(FormBuilder);

  // Signals
  listProducts = signal<any[]>([]);
  listCategories = signal<any[]>([]);
  pageNum = signal(1);
  pageSize = signal(5);
  sortField = signal('id');
  sortDir = signal<'asc' | 'desc'>('asc');
  totalPages = signal(0);
  totalItems = signal(0);

  // Form
  searchForm = this.fb.group({
    keyword: new FormControl('', [Validators.required]),
    categoryID: new FormControl(0)
  });

  // Computed
  pagination = getPaginationSignals(this.pageNum, this.pageSize, this.totalItems, this.totalPages);

  ngOnInit() {
    this.getProductByPage();
    this.getAllCategories();
  }

  // API
  getProductByPage() {
    const keyword = this.searchForm.get('keyword')?.value || '';
    const categoryID = this.searchForm.get('categoryID')?.value || 0;

    this.productService.getProductByPage(this.pageNum(), this.pageSize(), this.sortField(), this.sortDir(), keyword, categoryID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;

          this.listProducts.set(data.content);
          this.totalPages.set(data.totalPages);
          this.totalItems.set(data.totalItems);
        },
      });
  }

  getAllCategories() {
    this.categoryService.getAllCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => this.listCategories.set(res.data)
      });
  }

  changeEnabledStatus(id: number, status: boolean) {
    this.productService.changeEnabledStatus(id, !status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.getProductByPage();
          this.alertService.showAlert("The product ID " + id + " has been " + (status ? "disabled" : "enabled"), "green");

          this.alertService.closeAlert(3000);
        },
      });
  }

  deleteProduct(modalTemplate: TemplateRef<any>, id: number) {
    const title = "Confirm delete product has ID: " + id;
    this.modalService.open(modalTemplate, { title: title }).subscribe((res) => {
      if (res == "yes") {
        this.productService.deleteProduct(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.getProductByPage();
              this.alertService.showAlert("The product ID " + id + " has been deleted successfully.", "green");

              this.alertService.closeAlert(3000);
            },
          });
      }
    });
  }
  
  exportToCsv() {
    this.productService.exportToCsv()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'text/csv;charset=utf-8' });
          downloadBlob(blob, `products_${Date.now()}.csv`);
        },
        error: () => {
          this.alertService.showAndCloseAlertAfterXSecond('Error downloading the file', 'red', 5000);
        }
      });
  }

  // Action
  search() {
    this.pageNum.set(1);
    this.getProductByPage();
  }

  clear() {
    this.searchForm.patchValue({ keyword: '', categoryID: 0 });
    this.pageNum.set(1);
    this.getProductByPage();
  }

  findByCategory() {
    this.pageNum.set(1);
    this.getProductByPage();
  }

  sort(field: string) {
    if (field.toLowerCase() === this.sortField().toLowerCase()) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.getProductByPage();
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.pageSize.set(Number(target.value));
      this.pageNum.set(1); 
    }
    this.getProductByPage();
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber) || pageNumber > this.totalPages() || pageNumber < 1) return;
    this.pageNum.set(pageNumber);
    this.getProductByPage();
  }
}
