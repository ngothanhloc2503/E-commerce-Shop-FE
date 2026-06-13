import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../../core/services/auth-state/auth-state.service';
import { GeneralSettingService } from '../../../core/services/general-setting/general-setting.service';
import { ThemeService } from '../../../core/services/theme/theme.service';
import { CartService } from '../../../features/customer/services/cart/cart.service';
import { BASE_URL } from '../../../core/constants/app.constants';

interface StaffNavLink {
  path: string;
  label: string;
}

@Component({
    selector: 'app-nav',
    imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  // Inject
  private themeService = inject(ThemeService);
  readonly cartService = inject(CartService);
  readonly authState = inject(AuthStateService);
  readonly settingService = inject(GeneralSettingService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  // Form
  private fb = inject(NonNullableFormBuilder);
  searchForm = this.fb.group({
    keyword: ['', [Validators.required]],
  });

  // State
  readonly darkMode = this.themeService.darkMode;
  readonly user = this.authState.user;
  readonly isDropdownOpen = signal(false);

  // Data-driven staff nav
  readonly staffNavLinks: StaffNavLink[] = [
    { path: '/staff/dashboard', label: 'Dashboard' },
    { path: '/staff/users', label: 'Users' },
    { path: '/staff/categories', label: 'Categories' },
    { path: '/staff/brands', label: 'Brands' },
    { path: '/staff/products', label: 'Products' },
    { path: '/staff/reviews', label: 'Reviews' },
    { path: '/staff/shipping-rates', label: 'Shipping Rates' },
    { path: '/staff/orders', label: 'Orders' },
    { path: '/staff/settings', label: 'Settings' },
  ];

  // Init
  ngOnInit() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.cartService.getCart();
        }
      });
  }

  // Actions
  search() {
    const keyword = this.searchForm.value.keyword ?? '';
    this.router.navigate(['/search'], { queryParams: { keyword } });
  }

  signOut(event: Event) {
    event.preventDefault();
    this.http.post(`${BASE_URL}/api/auth/logout`, {}).subscribe({
      next: () => this.afterLogout(),
      error: () => this.afterLogout(),
    });
  }

  private afterLogout() {
    this.authState.logout();
    this.cartService.cart.set({});
    this.router.navigateByUrl('/');
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  // Dropdown
  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById('userDropdown');
    const button = document.getElementById('userMenuButton');
    if (dropdown && button && !dropdown.contains(target) && !button.contains(target)) {
      this.closeDropdown();
    }
  }

  // Helper
  getShortName(name: string, maxLen = 40): string {
    return name.length <= maxLen ? name : name.substring(0, maxLen) + '…';
  }
}