import { Component } from '@angular/core';
import { CartService } from '../../../services/customer/cart/cart.service';
import { AlertService } from '../../../services/alert/alert.service';
import { StorageService } from '../../../services/storage/storage.service';
import { GeneralSettingService } from '../../../services/general-setting/general-setting.service';
import { CommonModule } from '@angular/common';

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
