import { CategoryService } from '../../../../services/staff/category/category.service';
import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../../services/staff/product/product.service';
import { AlertService } from '../../../../services/alert/alert.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../../services/modal/modal.service';
import { UtilsService } from '../../../../services/utils/utils.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  listProducts: any[] = [];
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
  categoryID = new FormControl(0);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private alertService: AlertService,
    private modalService: ModalService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      keyword: this.keyword,
      categoryID: this.categoryID
    })

    this.getProductByPage();
    this.getAllCategories();
  }

  getProductByPage() {
    let keyword = this.keyword.value ? this.keyword.value : '';
    let categoryID = this.categoryID.value ? this.categoryID.value : 0;
    this.productService.getProductByPage(this.pageNum, this.pageSize, this.sortField, this.sortDir, keyword, categoryID).subscribe({
      next: (res: any) => {
        this.listProducts = res.content;
        this.totalPages = res.totalPages;
        this.totalItems = res.totalItems;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }
  
  deleteProduct(modalTemplate: TemplateRef<any>, id: number) {
    const title = "Confirm delete product has ID: " + id;
    this.modalService
      .open(modalTemplate, { title: title })
      .subscribe((res) => {
        if (res == "yes") {
          this.productService.deleteProduct(id).subscribe({
            next: (res) => {
              if (res == null) {
                this.getProductByPage();
                this.alertService.showAlert("The product ID " + id + " has been deleted successfully.", "green");
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

  search() {
    this.getProductByPage();
  }

  clear() {
    this.searchForm.patchValue({keyword: ''});
    this.searchForm.patchValue({categoryID: 0});

    this.getProductByPage();
  }

  changeEnabledStatus(id: number, status: boolean) {
    this.productService.changeEnabledStatus(id, !status).subscribe({
      next: (res) => {
        if (res == null) {
          this.getProductByPage();
          this.alertService.showAlert("The user ID " + id + " has been " + (status ? "disabled" : "enabled"), "green");
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

  findByCategory(event: Event) {
    this.getProductByPage();
  }

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        this.listCategories = res;
      },
      error: (err) => {
        this.alertService.showAlert("An unexpected error occurred. Please try again later.", "red");
        this.alertService.closeAlert(3000);
      }
    })
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

    this.getProductByPage();
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.pageSize = Number(target.value);
    } else {
      return;
    }
    this.getProductByPage();
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber)) {
      return
    } else if (pageNumber > this.totalPages || pageNumber < 1) {
      return;
    }
    this.pageNum = pageNumber;
    this.getProductByPage();
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
