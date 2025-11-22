import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/customer/category/category.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/customer/product/product.service';
import { GeneralSettingService } from '../../../services/general-setting/general-setting.service';
import { AuthService } from '../../../services/auth/auth.service';
import { StorageService } from '../../../services/storage/storage.service';
import { CartService } from '../../../services/customer/cart/cart.service';
import { UtilsService } from '../../../services/utils/utils.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  listCategories: any[] = [];
  listProduct: any[] = [];
  private token: any = null;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    public cartService: CartService,
    private productService: ProductService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public settingService: GeneralSettingService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.isLoading = true;
    forkJoin({
      categories: this.categoryService.getAllCategories(),
      products: this.productService.getTopFifteenRatedProduct()
    }).subscribe({
      next: (res) => {
        this.listCategories = res.categories;
        this.listProduct = res.products;
        this.isLoading = false;
      },
      error: (err) => {
        this.utilsService.handleError(err);
        this.isLoading = false;
      }
    });
    
    this.handleOAuthToken();
  }

  handleOAuthToken() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      if (this.token) {
        this.getInfoAfterSignInWithOauth2();
      }
    });
  }

  getInfoAfterSignInWithOauth2() {
    this.authService.getInfoAfterSignInWithOauth2(this.token).subscribe({
      next: (res) => {
        if (StorageService.isCustomerLoggedIn()) {
          this.router.navigateByUrl("");
        } else if (StorageService.isStaffLoggedIn()) {
          this.router.navigateByUrl("/staff");
        }
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getTopFifteenRatedProduct() {
    this.productService.getTopFifteenRatedProduct().subscribe({
      next: (res) => {
        this.listProduct = res;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getLinkCategory(name: string): string {
    return 'categories/' + name.replace(/ /g, '-');
  }

  getShortName(name: string): string {
    return name.length < 40 ? name : name.slice(0, 40) + "...";
  }
}
