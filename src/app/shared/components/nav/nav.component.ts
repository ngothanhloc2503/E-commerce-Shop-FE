import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { GeneralSettingService } from '../../../core/services/general-setting/general-setting.service';
import { CartService } from '../../../features/customer/services/cart/cart.service';
import { ThemeService } from '../../../core/services/theme/theme.service';
import { AuthStateService } from '../../../core/services/auth-state/auth-state.service';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../constants';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  searchForm!: FormGroup;
  keyword = new FormControl('', [Validators.required]);

  darkMode = this.themeService.darkMode;

  constructor(
    private themeService: ThemeService,
    public cartService: CartService,
    private router: Router,
    private fb: FormBuilder,
    public settingService: GeneralSettingService,
    private authState: AuthStateService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      keyword: this.keyword
    })

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.cartService.getCart();
      }
    });
  }

  search() {
    let keyword = this.keyword.value ? this.keyword.value : '';
    this.router.navigate(['/search'], { queryParams: { keyword: keyword } });
  }

  signOut(event: any) {
    event.preventDefault();
    this.http.post(`${BASE_URL}/api/auth/logout`, {}).subscribe({
      next: () => {
        this.afterLogout();
      },
      error: () => {
        this.afterLogout();
      }
    });
  }

  private afterLogout() {
    this.authState.logout();
    this.cartService.cart = {};
    this.router.navigateByUrl('/');
  }

  getShortName(name: string): string {
    if (name.length < 15) return name;
    else return name.substring(0, 40) + "...";
  }

  // Role helpers
  isAdmin() { return this.authState.isAdmin(); }
  isSalesPerson() { return this.authState.isSalesPerson(); }
  isEditor() { return this.authState.isEditor(); }
  isShipper() { return this.authState.isShipper(); }
  isAssistant() { return this.authState.isAssistant(); }
  isCustomer() { return this.authState.isCustomer(); }
  isStaff() { return this.authState.isAuthenticated() && !this.authState.isCustomer(); }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  get isAuth() {
    return this.authState.isAuthenticated();
  }

  get user() {
    return this.authState.user();
  }
}
