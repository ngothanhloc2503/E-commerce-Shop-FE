import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { GeneralSettingService } from '../../../../../core/services/general-setting/general-setting.service';
import { CategoryService } from '../../../services/category/category.service';
import { ProductService } from '../../../services/product/product.service';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-product-modal.component.html',
  styleUrl: './add-product-modal.component.css'
})
export class AddProductModalComponent {
  @Input() isVisible: boolean = false;
  @Output() addProductToOrderEmitter: EventEmitter<any> = new EventEmitter();
  @Output() closeModalEmitter: EventEmitter<boolean> = new EventEmitter();

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
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private alertService: AlertService,
    public settingService: GeneralSettingService,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      keyword: this.keyword,
      categoryID: this.categoryID
    })

    this.getProductByPage();
    this.getAllCategories();
  }

  addProductToOrder(productId: number) {
    let productInfo = this.listProducts.filter(product => product.id == productId);
    
    this.addProductToOrderEmitter.emit(productInfo[0]);

    this.isVisible = false;
  }

  closeModal() {
    this.isVisible = false;
    this.closeModalEmitter.emit();
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
    })
  }

  search() {
    this.getProductByPage();
  }
  
  clear() {
    this.searchForm.patchValue({keyword: ''});
    this.searchForm.patchValue({categoryID: 0});

    this.getProductByPage();
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

  getShortName(name: string): string {
    if (name.length < 40) return name;
    else return name.substring(0, 40) + "...";
  }
}
