import { Component } from '@angular/core';
import { CategoryService } from '../../../services/customer/category/category.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/customer/product/product.service';
import { GeneralSettingService } from '../../../services/general-setting/general-setting.service';
import { CartService } from '../../../services/customer/cart/cart.service';
import { UtilsService } from '../../../services/utils/utils.service';

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
    this.getCategoryByName();
    this.getProductByCategoryName();
  }

  getProductByCategoryName() {
    this.productService.getProductByCategoryName(this.name, this.pageNum).subscribe({
      next: (res) => {
        this.listProduct = res.content;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getCategoryByName() {
    this.categoryService.getCategoryByName(this.name).subscribe({
      next: (res) => {
        this.category = res;
      },
      error: (err) => {
        this.router.navigateByUrl("/");
        this.utilsService.handleError(err);
      },
    })
  }

  getLinkCategory(name: string): string {
    return '/categories/' + name.replace(/ /g, '-');
  }

  getShortName(name: string): string {
    if (name.length < 40) return name;
    else return name.substring(0, 40) + "...";
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
