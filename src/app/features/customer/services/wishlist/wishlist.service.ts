import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BASE_URL } from '../../../../core/constants/app.constants';

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productAlias: string;
  mainImage: string;
  price: number;
  discountPrice: number;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  
  // State
  readonly wishlistItems = signal<WishlistItem[]>([]);
  readonly itemCount = signal(0);

  get hasItems(): boolean {
    return this.itemCount() > 0;
  }

  loadWishlist(): void {
    this.http.get<{ data: WishlistItem[] }>(`${BASE_URL}/api/wishlist`)
      .pipe(tap(res => {
        this.wishlistItems.set(res.data || []);
        this.itemCount.set((res.data || []).length);
      }))
      .subscribe();
  }

  addToWishlist(productId: number) {
    return this.http.post(`${BASE_URL}/api/wishlist/items/${productId}`, {}).pipe(
      tap(() => {
        this.loadWishlist(); 
      })
    );
  }

  removeFromWishlist(productId: number) {
    return this.http.delete(`${BASE_URL}/api/wishlist/items/${productId}`).pipe(
      tap(() => {
        this.wishlistItems.update(items => items.filter(i => i.productId !== productId));
        this.itemCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistItems().some(item => item.productId === productId);
  }
}