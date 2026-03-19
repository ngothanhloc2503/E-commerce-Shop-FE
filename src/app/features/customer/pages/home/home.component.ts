import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { StorageService } from '../../../../core/services/storage/storage.service';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { AuthService } from '../../../auth/services/auth-service/auth.service';
import { CartService } from '../../services/cart/cart.service';
import { CategoryService } from '../../services/category/category.service';
import { ProductService } from '../../services/product/product.service';

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
