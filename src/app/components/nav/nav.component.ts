import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { StorageService } from '../../services/storage/storage.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralSettingService } from '../../services/general-setting/general-setting.service';
import { CartService } from '../../services/customer/cart/cart.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  isCustomerLoggedIn: boolean = false;
  isStaffLoggedIn: boolean = false;
  isAdminLoggedIn: boolean = false;
  isSalesPersonLoggedIn: boolean = false;
  isEditorLoggedIn: boolean = false;
  isShipperLoggedIn: boolean = false;
  isAssistantLoggedIn: boolean = false;

  searchForm!: FormGroup;
  keyword = new FormControl('', [
    Validators.required
  ]);

  isAuth = false;

  userFullName = '';
  userEmail = '';
  userImage = '';

  darkMode = signal<boolean>(
    JSON.parse(window.localStorage.getItem('darkMode') ?? 'false')
  );
  
  constructor(
    public cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    public settingService: GeneralSettingService
  ) {
    effect(() => {
      window.localStorage.setItem('darkMode', JSON.stringify(this.darkMode()));
    });
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      this.isCustomerLoggedIn = StorageService.isCustomerLoggedIn();
      this.isStaffLoggedIn  = StorageService.isStaffLoggedIn();
      this.isAdminLoggedIn = StorageService.isAdminLoggedIn();
      this.isSalesPersonLoggedIn = StorageService.isSalesPersonLoggedIn();
      this.isEditorLoggedIn = StorageService.isEditorLoggedIn();
      this.isShipperLoggedIn = StorageService.isShipperLoggedIn();
      this.isAssistantLoggedIn = StorageService.isAssistantLoggedIn();

      this.isAuth = this.isCustomerLoggedIn || this.isStaffLoggedIn;

      this.userFullName = StorageService.getUserFullName();
      this.userEmail = StorageService.getUserEmail();
      this.userImage = StorageService.getUserImage();
    })

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
    this.authService.signOut();
    this.cartService.cart = {};
    this.router.navigateByUrl("/");
  }

  getShortName(name: string): string {
    if (name.length < 15) return name;
    else return name.substring(0, 40) + "...";
  }
}
