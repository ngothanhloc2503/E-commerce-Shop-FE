import { Component } from '@angular/core';
import { ProductService } from '../../../services/customer/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';
import { CommonModule } from '@angular/common';
import { GeneralSettingService } from '../../../services/general-setting/general-setting.service';
import { CartService } from '../../../services/customer/cart/cart.service';
import { FormsModule } from '@angular/forms';
import { UtilsService } from '../../../services/utils/utils.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  product: any = [];
  alias: string = '';
  bigImage: string = '';
  quantity = 1;

  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public settingService: GeneralSettingService,
    public cartService: CartService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(s => this.alias = s["alias"]);
    if (this.alias == '') {
      this.router.navigateByUrl("/");
    }
    this.getProductByAlias();
  }

  addProductToCart() {
    this.cartService.addProductToCart(this.product.id, this.quantity);
  }

  getProductByAlias() {
    this.productService.getProductByAlias(this.alias).subscribe({
      next: (res) => {
        this.product = res;
        this.bigImage = res.mainImagePath;
      },
      error: (err) => {
        this.router.navigateByUrl("/");
        this.utilsService.handleError(err);
      },
    })
  }
}
