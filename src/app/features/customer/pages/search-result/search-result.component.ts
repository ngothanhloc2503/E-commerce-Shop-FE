import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../services/cart/cart.service';
import { SearchService } from '../../services/search/search.service';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { getPaginationSignals } from '../../../../shared/utils/pagination.utils';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-search-result',
    imports: [RouterModule, PaginationComponent],
    templateUrl: './search-result.component.html',
    styleUrl: './search-result.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private searchService = inject(SearchService);
  private activatedRoute = inject(ActivatedRoute);
  public settingService = inject(GeneralSettingService);
  public cartService = inject(CartService);
  private router = inject(Router);
  public wishlistService = inject(WishlistService);

  searchSectionRef = viewChild<ElementRef<HTMLDivElement>>('searchSection');

  // State
  keyword = '';
  sortField = 'averageRating_DESC';

  showFilter = signal(true);
  rating = signal(0);
  brandIDs = signal<any[]>([]);
  listProduct = signal<any[]>([]);
  listRecommendedBrands = signal<any[]>([]);
  isLoading = signal(false);

  pageNum = signal(1);
  pageSize = signal(24);
  totalPages = signal(0);
  totalItems = signal(0);

  // Computed
  pagination = getPaginationSignals(this.pageNum, this.pageSize, this.totalItems, this.totalPages);

  // Init
  ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => {
        this.keyword = s['keyword'] || '';
        this.pageNum.set(1);
        this.loadAll();
      });

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.pageNum.set(1);
          this.loadAll();
        }
      });
  }

  // API
  searchProduct() {
    this.isLoading.set(true);
    this.listProduct.set([]);
    this.totalPages.set(0);

    this.searchService.searchProduct(
      this.keyword, this.pageNum(), this.pageSize(), this.sortField, this.rating(), this.brandIDs()
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;
          console.log(data)
          this.listProduct.set(data.content);
          this.totalPages.set(data.totalPages);
          this.totalItems.set(data.totalItems || 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  loadAll() {
    this.isLoading.set(true);

    forkJoin([
      this.searchService.searchProduct(this.keyword, this.pageNum(), this.pageSize(), this.sortField, this.rating(), this.brandIDs()),
      this.searchService.getRecommendedBrands(this.keyword)
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([searchResult, brandResult]) => {
          this.listProduct.set(searchResult.data.content);
          this.totalPages.set(searchResult.data.totalPages);
          this.totalItems.set(searchResult.data.totalItems || 0);
          this.listRecommendedBrands.set(brandResult.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  // Action
  changePageSize(newPageSize: number) {
    this.pageSize.set(newPageSize);
    this.pageNum.set(1);
    
    this.searchProduct();
    this.scrollToTop();
  }

  onUpdateBrand(event: Event, brandId: string) {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    if (target.checked) {
      this.brandIDs.update(ids => [...ids, brandId]);
    } else {
      this.brandIDs.update(ids => ids.filter(id => id !== brandId));
    }
    this.pageNum.set(1);
    this.searchProduct();
    this.scrollToTop();
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.sortField = target.value;
      this.sortProduct();
    }
  }

  sortProduct() {
    this.pageNum.set(1);
    this.searchProduct();
    this.scrollToTop();
  }

  changeRating(newRating: number) {
    this.rating.set(newRating);
    this.pageNum.set(1);
    this.searchProduct();
    this.scrollToTop();
  }

  // Helpers
  toggleWishlist(event: Event, productId: number) {
    event.preventDefault();
    event.stopPropagation();

    if (this.wishlistService.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe();
    } else {
      this.wishlistService.addToWishlist(productId).subscribe();
    }
  }
  
  getShortName(name: string): string {
    return name.length < 20 ? name : name.substring(0, 20) + "...";
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber) || pageNumber < 1 || pageNumber > this.totalPages()) return;
    this.pageNum.set(pageNumber);
    this.searchProduct();
    this.scrollToTop();
  }

  private scrollToTop() {
    const element = this.searchSectionRef()?.nativeElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}