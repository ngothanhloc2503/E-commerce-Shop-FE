import { Component, DestroyRef, inject, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { downloadBlob } from '../../../../../shared/utils/file-download.util';
import { getPaginationSignals } from '../../../../../shared/utils/pagination.utils';
import { CategoryService } from '../../../services/category/category.service';

@Component({
    selector: 'app-categories-list',
    imports: [RouterModule, PaginationComponent, ReactiveFormsModule],
    templateUrl: './category-list.component.html',
    styleUrl: './category-list.component.css'
})
export class CategoryListComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private categoryService = inject(CategoryService);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);
  private fb = inject(FormBuilder);

  // Signals
  listCategories = signal<any[]>([]);
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
    this.getCategoriesByPage();
  }

  // API
  getCategoriesByPage() {
    const keyword = this.searchForm.value.keyword || '';

    this.categoryService.getCategoriesByPage(this.pageNum(), this.pageSize(), this.sortField(), this.sortDir(), keyword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;

          this.listCategories.set(data.content);
          this.totalPages.set(data.totalPages);
          this.totalItems.set(data.totalItems);
        },
      })
  }

  deleteCategory(modalTemplate: TemplateRef<any>, categoryID: number) {
    const title = "Confirm delete category has ID: " + categoryID;
    this.modalService.open(modalTemplate, { title: title }).subscribe((res) => {
      if (res == "yes") {
        this.categoryService.deleteCategory(categoryID).subscribe({
          next: () => {
            this.getCategoriesByPage();
            this.alertService.showAlert("The category ID " + categoryID + " has been deleted successfully.", "green");

            this.alertService.closeAlert(3000);
          },
        })
      }
    });
  }

  exportToCsv() {
    this.categoryService.exportToCsv().subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'text/csv;charset=utf-8' });
        downloadBlob(blob, `categories_${Date.now()}.csv`);
      },
      error: () => {
        this.alertService.showAndCloseAlertAfterXSecond('Error downloading the file', 'red', 5000);
      }
    });
  }

  // Action
  changePageSize(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;

    this.pageSize.set(Number(value));
    this.pageNum.set(1);

    this.getCategoriesByPage();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    this.pageNum.set(page);
    this.getCategoriesByPage();
  }

  sort(field: string) {
    if (field === this.sortField()) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }

    this.getCategoriesByPage();
  }

  changeEnabledStatus(categoryID: number, status: boolean) {
    this.categoryService.changeEnabledStatus(categoryID, !status).subscribe({
      next: () => {
        this.getCategoriesByPage();
        this.alertService.showAlert("The category ID " + categoryID + " has been " + (status ? "disabled" : "enabled"), "green");

        this.alertService.closeAlert(3000);
      },
    });
  }

  clear() {
    this.searchForm.patchValue({ keyword: '' });

    this.getCategoriesByPage();
  }

  search() {
    this.getCategoriesByPage();
  }
}
