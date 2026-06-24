import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { GeneralSettingService } from '../../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './wishlist.component.html'
})
export class WishlistComponent implements OnInit {
  readonly wishlistService = inject(WishlistService);
  readonly settingService = inject(GeneralSettingService);
  private cartService = inject(CartService);

  ngOnInit(): void {
    this.wishlistService.loadWishlist();
  }

  removeFromWishlist(productId: number): void {
    if (confirm('Are you sure you want to remove this item from your wishlist?')) {
      this.wishlistService.removeFromWishlist(productId).subscribe();
    }
  }

  addToCart(productId: number): void {
    this.cartService.addProductToCart(productId, 1);
  }
}