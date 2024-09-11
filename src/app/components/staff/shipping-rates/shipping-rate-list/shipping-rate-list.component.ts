import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShippingRateService } from '../../../../services/staff/shipping-rate/shipping-rate.service';
import { AlertService } from '../../../../services/alert/alert.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UtilsService } from '../../../../services/utils/utils.service';

@Component({
  selector: 'app-shipping-rate-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './shipping-rate-list.component.html',
  styleUrl: './shipping-rate-list.component.css'
})
export class ShippingRateListComponent {
  listShippingRates: any[] = [];
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
    private shippingRateService: ShippingRateService,
    private alertService: AlertService,
    private modalService: ModalService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      keyword: this.keyword
    })

    this.getShippingRatesByPage();
  }

  getShippingRatesByPage() {
    let keyword = this.keyword.value ? this.keyword.value : '';
    this.shippingRateService.getShippingRatesByPage(this.pageNum, this.pageSize, this.sortField, this.sortDir, keyword).subscribe({
      next: (res: any) => {
        this.listShippingRates = res.content;
        this.totalPages = res.totalPages;
        this.totalItems = res.totalItems;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  changeCodSupportedStatus(id: number, supported: boolean) {
    this.shippingRateService.changeCodSupportedStatus(id, !supported).subscribe({
      next: (res) => {
        this.getShippingRatesByPage();
        this.alertService.showAndCloseAlertAfterXSecond("The shipping rate ID " + id + " has been " + (supported ? "disabled" : "enabled"), "green", 3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  deleteShippingRate(deleteModal: TemplateRef<any>, shippingRateId: number) {
    const title = "Confirm delete shipping rate has ID: " + shippingRateId;
    this.modalService.open(deleteModal, {title: title}).subscribe((res) => {
      if (res == "yes") {
        this.shippingRateService.deleteShippingRate(shippingRateId).subscribe({
          next: (res) => {
            this.getShippingRatesByPage();
            this.alertService.showAndCloseAlertAfterXSecond("The shipping rate ID " + shippingRateId + " has been deleted successfully.", "green", 3000);
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

    this.getShippingRatesByPage();
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.pageSize = Number(target.value);
    } else {
      return;
    }
    this.getShippingRatesByPage();
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber)) {
      return
    } else if (pageNumber > this.totalPages || pageNumber < 1) {
      return;
    }
    this.pageNum = pageNumber;
    this.getShippingRatesByPage();
  }

  search() {
    this.getShippingRatesByPage();
  }

  clear() {
    this.searchForm.patchValue({keyword: ''});
    this.getShippingRatesByPage();
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
