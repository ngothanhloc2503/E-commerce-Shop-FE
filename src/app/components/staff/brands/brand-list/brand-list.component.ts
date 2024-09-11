import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandService } from '../../../../services/staff/brand/brand.service';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../../services/alert/alert.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { UtilsService } from '../../../../services/utils/utils.service';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.css'
})
export class BrandListComponent {

  listBrands: any[] = [];
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
    private brandService: BrandService,
    private alertService: AlertService,
    private modalService: ModalService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      keyword: this.keyword
    })

    this.getBrandsByPage();
  }

  getBrandsByPage() {
    let keyword = this.keyword.value ? this.keyword.value : '';
    this.brandService.getBrandByPage(this.pageNum, this.pageSize, this.sortField, this.sortDir, keyword).subscribe({
      next: (res: any) => {
        this.listBrands = res.content;
        this.totalPages = res.totalPages;
        this.totalItems = res.totalItems;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  deleteBrand(deleteModal: TemplateRef<any>, brandID: number) {
    const title = "Confirm delete brand has ID: " + brandID;
    this.modalService.open(deleteModal, {title: title}).subscribe((res) => {
      if (res == "yes") {
        this.brandService.deleteBrand(brandID).subscribe({
          next: (res) => {
            if (res == null) {
              this.getBrandsByPage();
              this.alertService.showAlert("The brand ID " + brandID + " has been deleted successfully.", "green");
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

    this.getBrandsByPage();
  }

  search() {
    this.getBrandsByPage();
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.pageSize = Number(target.value);
    } else {
      return;
    }
    this.getBrandsByPage();
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber)) {
      return
    } else if (pageNumber > this.totalPages || pageNumber < 1) {
      return;
    }
    this.pageNum = pageNumber;
    this.getBrandsByPage();
  }

  clear() {
    this.searchForm.patchValue({keyword: ''});
    this.getBrandsByPage();
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
