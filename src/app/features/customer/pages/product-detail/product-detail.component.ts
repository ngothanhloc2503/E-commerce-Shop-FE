import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../services/cart/cart.service';
import { ProductService } from '../../services/product/product.service';

@Component({
    selector: 'app-product-detail',
    imports: [RouterModule],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private productService = inject(ProductService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public settingService = inject(GeneralSettingService);
  public cartService = inject(CartService);

  // State
  alias = '';
  bigImage = signal<string>('');
  quantity = signal<number>(1);
  product = signal<any>({ images: [] });

  // Computed
  gridCols = computed(() => {
    const imgCount = this.product()?.images?.length || 0;
    return `grid-cols-${imgCount + 1}`;
  });

  // Init
  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => {
        this.alias = s["alias"] || '';
        if (this.alias) {
          this.getProductByAlias();
        } else {
          this.router.navigateByUrl("/");
        }
      });
  }

  // API
  getProductByAlias() {
    this.productService.getProductByAlias(this.alias)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;
          this.product.set(data);
          this.bigImage.set(data.mainImagePath);
        },
        error: () => {
          this.router.navigateByUrl("/");
        },
      });
  }

  // Action
  onUpdateQuantity(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    this.quantity.set(Number(target.value));
  }

  addProductToCart() {
    const id = this.product()?.id;
    if (id) {
      this.cartService.addProductToCart(id, this.quantity());
    }
  }

  changeImage(imagePath: string) {
    this.bigImage.set(imagePath);
  }
}