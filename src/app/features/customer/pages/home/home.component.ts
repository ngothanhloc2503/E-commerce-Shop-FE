import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthStateService } from '../../../../core/services/auth-state/auth-state.service';
import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { AuthService } from '../../../auth/services/auth-service/auth.service';
import { CartService } from '../../services/cart/cart.service';
import { CategoryService } from '../../services/category/category.service';
import { ProductService } from '../../services/product/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  // Đã bỏ CommonModule
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  public cartService = inject(CartService);
  private productService = inject(ProductService);
  private activatedRoute = inject(ActivatedRoute);
  public settingService = inject(GeneralSettingService);
  private router = inject(Router);
  private authState = inject(AuthStateService);

  // State
  listCategories = signal<any[]>([]);
  listProduct = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  // Init
  ngOnInit() {
    this.isLoading.set(true);

    forkJoin({
      categories: this.categoryService.getAllCategories(),
      products: this.productService.getTopFifteenRatedProduct()
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.listCategories.set(res.categories.data);
          this.listProduct.set(res.products.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });

    this.handleOAuthToken();
  }

  handleOAuthToken() {
    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const token = params.get('token');
        if (token) {
          this.getInfoAfterSignInWithOauth2(token);
        }
      });
  }

  // API
  getInfoAfterSignInWithOauth2(token: string) {
    this.authService.getInfoAfterSignInWithOauth2(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;
          this.authState.login(
            data.token,
            { email: data.email, fullName: data.fullName, roles: data.roles, image: data.image },
            data.expireDuration
          );

          this.router.navigate([], { queryParams: {}, replaceUrl: true });

          this.router.navigateByUrl(this.authState.isCustomer() ? "" : "/staff");
        },
        error: () => {
          this.authState.logout();
        }
      });
  }

  // Helper
  getLinkCategory(name: string): string {
    return 'categories/' + name.replace(/ /g, '-');
  }

  getShortName(name: string): string {
    return name.length < 40 ? name : name.slice(0, 40) + "...";
  }
}