import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../services/cart/cart.service';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [RouterModule],
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

  // State
  keyword = '';
  sortField = 'averageRating_DESC';

  // Signals
  pageNum = signal(1);
  totalPages = signal(0);
  showFilter = signal(true);
  rating = signal(0);
  brandIDs = signal<any[]>([]);
  listProduct = signal<any[]>([]);
  listRecommendedBrands = signal<any[]>([]);
  isLoading = signal(false);

  // Computed
  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Init
  ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => {
        this.keyword = s['keyword'] || '';
        this.loadAll();
      });

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
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
      this.keyword, this.pageNum(), this.sortField, this.rating(), this.brandIDs()
    ).pipe(takeUntilDestroyed(this.destroyRef))
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

  loadAll() {
    this.isLoading.set(true);

    forkJoin([
      this.searchService.searchProduct(this.keyword, this.pageNum(), this.sortField, this.rating(), this.brandIDs()),
      this.searchService.getRecommendedBrands(this.keyword)
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([searchResult, brandResult]) => {
          this.listProduct.set(searchResult.data.content);
          this.totalPages.set(searchResult.data.totalPages);
          this.listRecommendedBrands.set(brandResult.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  // Action
  onUpdateBrand(event: Event, brandId: string) {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    if (target.checked) {
      this.brandIDs.update(ids => [...ids, brandId]);
    } else {
      this.brandIDs.update(ids => ids.filter(id => id !== brandId));
    }
    this.searchProduct();
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
  }

  changeRating(newRating: number) {
    this.rating.set(newRating);
    this.searchProduct();
  }

  // Helpers
  getShortName(name: string): string {
    return name.length < 20 ? name : name.substring(0, 20) + "...";
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber) || pageNumber < 1 || pageNumber > this.totalPages()) return;
    this.pageNum.set(pageNumber);
    this.searchProduct();
  }
}