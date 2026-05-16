import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralSettingService } from '../../../../../core/services/general-setting/general-setting.service';
import { getPaginationSignals } from '../../../../../shared/utils/pagination.utils';
import { CategoryService } from '../../../services/category/category.service';
import { ProductService } from '../../../services/product/product.service';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-product-modal.component.html',
  styleUrl: './add-product-modal.component.css'
})
export class AddProductModalComponent {
  // Signal Inputs & Outputs
  isVisible = input<boolean>(false);
  addProductToOrderEmitter = output<any>();
  closeModalEmitter = output<void>();

  // Inject
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  public settingService = inject(GeneralSettingService);
  private destroyRef = inject(DestroyRef);

  // Signals
  listProducts = signal<any[]>([]);
  listCategories = signal<any[]>([]);
  pageNum = signal(1);
  pageSize = signal(5);
  totalPages = signal(0);
  totalItems = signal(0);

  // Form
  searchForm = this.fb.group({
    keyword: new FormControl('', [Validators.required]),
    categoryId: new FormControl(0)
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
    const categoryId = this.searchForm.get('categoryId')?.value || 0;

    this.productService.getProductByPage(this.pageNum(), this.pageSize(), 'id', 'asc', keyword, categoryId)
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

  // Action
  addProductToOrder(productId: number) {
    let productInfo = this.listProducts().find(product => product.id == productId);
    if (productInfo) {
      this.addProductToOrderEmitter.emit(productInfo);
    }
  }

  closeModal() {
    this.closeModalEmitter.emit();
  }

  search() {
    this.pageNum.set(1); 
    this.getProductByPage();
  }
  
  clear() {
    this.searchForm.patchValue({ keyword: '', categoryId: 0 });
    this.pageNum.set(1);
    this.getProductByPage();
  }

  findByCategory() {
    this.pageNum.set(1);
    this.getProductByPage();
  }

  goToPage(pageNumber: number) {
    if (pageNumber > this.totalPages() || pageNumber < 1) return;
    this.pageNum.set(pageNumber);
    this.getProductByPage();
  }

  getShortName(name: string): string {
    return name.length < 40 ? name : name.substring(0, 40) + "...";
  }
}
