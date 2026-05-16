import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  readonly cartService = inject(CartService);
  readonly settingService = inject(GeneralSettingService);

  ngOnInit() {
    this.cartService.getCart();
  }
}