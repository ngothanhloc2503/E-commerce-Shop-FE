import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { CategoryService } from '../../../services/category/category.service';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {
  listCategories: any = [];
  pageNum = 1;
  pageSize = 5;
  sortField = 'id';
  sortDir = 'asc';
  totalPages = 0;
  totalItems = 0;

  searchForm!: FormGroup;
  keyword = new FormControl('', [
    Validators.required
  ]);

  constructor(
    private categoryService: CategoryService,
    private alertService: AlertService,
    private modalService: ModalService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      keyword: this.keyword
    })

    this.getCategoriesByPage();
  }

  getCategoriesByPage() {
    let keyword = this.keyword.value ? this.keyword.value : '';
    this.categoryService.getCategoriesByPage(this.pageNum, this.pageSize, keyword, this.sortField, this.sortDir).subscribe({
      next: (res: any) => {
        this.listCategories = res.content;
        this.totalPages = res.totalPages;
        if (res.totalPages < this.pageNum) {
          this.goToPage(res.totalPages);
        }
        this.totalItems = res.totalItems;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  exportToCsv() {
    this.categoryService.exportToCsv().subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'text/csv;charset=utf-8' });
        
        // Create a link element
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'categories_' + new Date().toISOString().split('.')[0].replace(/:/g, '-') + '.csv';

        // Append to the DOM and trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up and remove the link
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.alertService.showAndCloseAlertAfterXSecond('Error downloading the file', 'red', 5000);
      }
    });
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.pageSize = Number(target.value);
    } else {
      return;
    }
    this.getCategoriesByPage();
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber)) {
      return
    } else if (pageNumber > this.totalPages || pageNumber < 1) {
      return;
    }
    this.pageNum = pageNumber;
    this.getCategoriesByPage();
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

    this.getCategoriesByPage();
  }

  changeEnabledStatus(categoryID: number, status: boolean) {
    this.categoryService.changeEnabledStatus(categoryID, !status).subscribe({
      next: (res) => {
        if (res == null) {
          this.getCategoriesByPage();
          this.alertService.showAlert("The category ID " + categoryID + " has been " + (status ? "disabled" : "enabled"), "green");
        } else {
          this.alertService.showAlert("An unexpected error occurred. Please try again later.", "red");
        }

        this.alertService.closeAlert(3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    });
  }

  deleteCategory(modalTemplate: TemplateRef<any>,  categoryID: number) {
    const title = "Confirm delete category has ID: " + categoryID;
    this.modalService
      .open(modalTemplate, { title: title })
      .subscribe((res) => {
        if (res == "yes") {
          this.categoryService.deleteCategory(categoryID).subscribe({
            next: (res) => {
              if (res == null) {
                this.getCategoriesByPage();
                this.alertService.showAlert("The category ID " + categoryID + " has been deleted successfully.", "green");
              } else {
                this.alertService.showAlert("An unexpected error occurred. Please try again later.", "red");
              }

              this.alertService.closeAlert(3000);
            },
            error: (err) => {
              this.utilsService.handleError(err);
            }
          })
        }
      });
  }

  clear() {
    this.searchForm.patchValue({keyword: ''});

    this.getCategoriesByPage();
  }

  search() {
    this.getCategoriesByPage();
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
