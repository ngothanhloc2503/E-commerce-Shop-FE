import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../services/cart/cart.service';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css'
})
export class SearchResultComponent {
  keyword = '';
  sortField = 'averageRating_DESC';
  pageNum: number = 1;
  totalPages: number = 0;
  showFilter = true;
  rating: number = 0;
  brandIDs: any[] = [];
  listProduct: any[] = [];
  listRecommendedBrands: any[] = [];
  isLoading: boolean = false;

  constructor(
    private searchService: SearchService,
    private activatedRoute: ActivatedRoute,
    public settingService: GeneralSettingService,
    public cartService: CartService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(s => this.keyword = s['keyword']);

    // Search first time from another view
    this.loadAll();

    // Search in this view
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadAll();
      }
    });
  }

  searchProduct() {
    this.isLoading = true;

    this.listProduct = [];
    this.totalPages = 0;
    this.searchService.searchProduct(this.keyword, this.pageNum, this.sortField, this.rating, this.brandIDs).subscribe({
      next: (res) => {
        this.listProduct = res.content;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
    })
  }

  getListRecommendedBrands() {
    this.isLoading = true;

    this.searchService.getRecommendedBrands(this.keyword).subscribe({
      next: (res) => {
        this.listRecommendedBrands = res;
        this.isLoading = false;
      },
    })
  }

  sortProduct() {
    this.pageNum = 1;
    this.searchProduct();
  }

  updateBrandIDs() {
    this.brandIDs = [];
    document.querySelectorAll('input[name=brand]:checked').forEach((brand) => {
      if (brand.getAttribute('value') != null) {
        this.brandIDs.push(brand.getAttribute('value'));
      }
    })

    this.searchProduct();
  }

  changeRating(rating: number) {
    this.rating = rating;
    this.searchProduct();
  }

  getShortName(name: string): string {
    if (name.length < 20) return name;
    else return name.substring(0, 20) + "...";
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber)) {
      return
    } else if (pageNumber > this.totalPages || pageNumber < 1) {
      return;
    }
    this.pageNum = pageNumber;

    this.searchProduct();
  }

  loadAll() {
    this.isLoading = true;

    const api1 = this.searchService.searchProduct(
      this.keyword, this.pageNum, this.sortField, this.rating, this.brandIDs
    );

    const api2 = this.searchService.getRecommendedBrands(this.keyword);

    forkJoin([api1, api2]).subscribe({
      next: ([searchResult, brandResult]) => {
        this.listProduct = searchResult.content;
        this.totalPages = searchResult.totalPages;

        this.listRecommendedBrands = brandResult;

        this.isLoading = false;
      },
    });
  }
}
