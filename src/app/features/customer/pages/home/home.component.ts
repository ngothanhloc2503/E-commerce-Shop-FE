import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { AuthService } from '../../../auth/services/auth-service/auth.service';
import { CartService } from '../../services/cart/cart.service';
import { CategoryService } from '../../services/category/category.service';
import { ProductService } from '../../services/product/product.service';
import { AuthStateService } from '../../../../core/services/auth-state/auth-state.service';

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
    private activatedRoute: ActivatedRoute,
    public settingService: GeneralSettingService,
    private router: Router,
    private authState: AuthStateService
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
        this.authState.login(
          res.token,
          {
            email: res.email,
            fullName: res.fullName,
            roles: res.roles,
            image: res.image
          },
          res.expireDuration
        );

        // clear token khỏi URL
        this.router.navigate([], { queryParams: {}, replaceUrl: true });

        // redirect
        this.router.navigateByUrl(
          this.authState.isCustomer() ? "" : "/staff"
        );
      },
      error: (err) => {
        this.authState.logout();
      }
    })
  }

  getTopFifteenRatedProduct() {
    this.productService.getTopFifteenRatedProduct().subscribe({
      next: (res) => {
        this.listProduct = res;
      },
    })
  }

  getLinkCategory(name: string): string {
    return 'categories/' + name.replace(/ /g, '-');
  }

  getShortName(name: string): string {
    return name.length < 40 ? name : name.slice(0, 40) + "...";
  }
}
