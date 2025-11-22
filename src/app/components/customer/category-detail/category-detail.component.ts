import { Component } from '@angular/core';
import { CategoryService } from '../../../services/customer/category/category.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/customer/product/product.service';
import { GeneralSettingService } from '../../../services/general-setting/general-setting.service';
import { CartService } from '../../../services/customer/cart/cart.service';
import { UtilsService } from '../../../services/utils/utils.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.css'
})
export class CategoryDetailComponent {
  category: any = [];
  name: string = '';
  pageNum: number = 1;
  totalPages: number = 0;
  listProduct: any[] = [];
  isLoading: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public settingService: GeneralSettingService,
    public cartService: CartService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(s => this.name = s["name"]);
    if (this.name == '') {
      this.router.navigateByUrl("/");
    }

    this.loadAll();
  }
  
  loadAll() {
    this.isLoading = true;

    const apiCategory = this.categoryService.getCategoryByName(this.name);
    const apiProducts = this.productService.getProductByCategoryName(this.name, this.pageNum);

    forkJoin([apiCategory, apiProducts]).subscribe({
      next: ([categoryRes, productRes]) => {
        this.category = categoryRes;

        this.listProduct = productRes.content;
        this.totalPages = productRes.totalPages;

        this.isLoading = false;
      },
      error: (err) => {
        // Nếu category lỗi -> về trang chủ
        this.router.navigateByUrl("/");
        this.utilsService.handleError(err);

        this.isLoading = false;
      }
    });
  }

  getProductByCategoryName() {
    this.isLoading = true;
    this.productService.getProductByCategoryName(this.name, this.pageNum).subscribe({
      next: (res) => {
        this.listProduct = res.content;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.utilsService.handleError(err);
        this.isLoading = false;
      }
    })
  }

  getLinkCategory(name: string): string {
    return '/categories/' + name.replace(/ /g, '-');
  }

  getShortName(name: string): string {
    return name.length < 40 ? name : name.slice(0, 40) + "...";
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber)) {
      return
    } else if (pageNumber > this.totalPages || pageNumber < 1) {
      return;
    }
    this.pageNum = pageNumber;
    this.getProductByCategoryName();
  }
}
