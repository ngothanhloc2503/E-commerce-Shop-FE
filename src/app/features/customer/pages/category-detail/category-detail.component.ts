import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../services/cart/cart.service';
import { CategoryService } from '../../services/category/category.service';
import { ProductService } from '../../services/product/product.service';
import { getPaginationSignals } from '../../../../shared/utils/pagination.utils';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryDetailComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public settingService = inject(GeneralSettingService);
  public cartService = inject(CartService);

  // State
  name = '';

  category = signal<any>("");
  listProduct = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  pageNum = signal(1);
  pageSize = signal(5);
  totalPages = signal(0);
  totalItems = signal(0);

  // Computed
  pagination = getPaginationSignals(this.pageNum, this.pageSize, this.totalItems, this.totalPages);

  // Init
  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => {
        this.name = s["name"] || '';
        if (this.name) {
          this.loadAll();
        } else {
          this.router.navigateByUrl("/");
        }
      });
  }

  // API
  loadAll() {
    this.isLoading.set(true);

    forkJoin([
      this.categoryService.getCategoryByName(this.name),
      this.productService.getProductByCategoryName(this.name, 1)
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([categoryRes, productRes]) => {
          this.category.set(categoryRes.data);
          this.listProduct.set(productRes.data.content);
          this.totalPages.set(productRes.data.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.router.navigateByUrl("/");
          this.isLoading.set(false);
        }
      });
  }

  getProductByCategoryName(page: number) {
    this.isLoading.set(true);
    this.productService.getProductByCategoryName(this.name, page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;
          this.listProduct.set(data.content);
          this.totalPages.set(data.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  // Helper
  getLinkCategory(name: string): string {
    return '/categories/' + name.replace(/ /g, '-');
  }

  getShortName(name: string): string {
    return name.length < 40 ? name : name.substring(0, 40) + "...";
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber) || pageNumber < 1 || pageNumber > this.totalPages()) {
      return;
    }

    this.getProductByCategoryName(pageNumber);
  }
}