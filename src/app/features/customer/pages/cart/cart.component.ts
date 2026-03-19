import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  constructor(
    public cartService: CartService,
    public settingService: GeneralSettingService,
  ) {}

  ngOnInit() {
    this.cartService.getCart();
  }
}
