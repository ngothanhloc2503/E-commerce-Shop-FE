import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountService } from '../../../../../core/services/account/account.service';
import { AddressBookService } from '../../../services/address-book/address-book.service';
import { AlertService } from '../../../../../core/services/alert/alert.service';

@Component({
    selector: 'app-address-book',
    imports: [RouterModule],
    templateUrl: './address-book.component.html',
    styleUrl: './address-book.component.css'
})
export class AddressBookComponent implements OnInit {
  // Inject
  private accountService = inject(AccountService);
  private addressBookService = inject(AddressBookService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  // Signals
  readonly user = signal<any>({});
  readonly addressBook = signal<any[]>([]);
  readonly primaryAddressAsDefault = signal(true);
  readonly redirect = signal('');

  // Computed
  readonly activeDefaultId = computed(() => {
    const defaultAddr = this.addressBook().find(a => a.defaultForShipping);
    if (defaultAddr) return defaultAddr.id;
    return this.primaryAddressAsDefault() ? 0 : null;
  });

  readonly hasAddresses = computed(() => this.addressBook().length > 0);

  // Init
  ngOnInit() {
    this.listenToQueryParams();
    this.loadAccountDetails();
    this.loadAddressBook();
  }

  // Route
  private listenToQueryParams() {
    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.redirect.set(params.get('redirect') ?? ''));
  }

  // Data loading
  private loadAddressBook() {
    this.addressBookService.getAddressBook()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        const data = res.data;
        this.addressBook.set(data.addressBook);
        this.primaryAddressAsDefault.set(data.primaryAddressAsDefault);
      });
  }

  private loadAccountDetails() {
    this.accountService.getAccountDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.user.set(res.data));
  }

  // Actions
  setDefault(addressId: number) {
    this.addressBookService.setDefault(addressId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.redirect()) {
            this.router.navigateByUrl('/cart');
          } else {
            this.loadAddressBook();
          }
        },
      });
  }

  deleteAddress(addressId: number) {
    this.addressBookService.deleteAddress(addressId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.addressBook.update(list => list.filter(a => a.id !== addressId));
          this.alertService.showAndCloseAlertAfterXSecond(
            'Address has been deleted successfully.', 'green', 3000
          );
        },
      });
  }

  editAddress(addressId: string) {
    const navCommands = ['/address-book/edit', addressId];

    if (this.redirect()) {
      this.router.navigate(navCommands, {
        queryParams: { redirect: 'address-book' },
      });
    } else {
      this.router.navigate(navCommands);
    }
  }

  // Helpers
  getAddress(info: any): string {
    if (!info?.firstName) return '';

    const parts: string[] = [];

    const name = [info.firstName, info.lastName].filter(Boolean).join(' ');
    parts.push(name);

    if (info.addressLine1) parts.push(info.addressLine1);
    if (info.addressLine2) parts.push(info.addressLine2);

    const cityState = [info.city, info.state].filter(Boolean).join(', ');
    if (cityState) parts.push(cityState);

    if (info.country) parts.push(info.country);

    if (info.postalCode) parts.push(`Postal Code: ${info.postalCode}`);

    if (info.phoneNumber) parts.push(`Phone: ${info.phoneNumber}`);

    return parts.join(', ');
  }

  cardClasses(isDefault: boolean): string {
    const base = 'relative w-full border rounded-2xl shadow-sm hover:shadow-lg transition p-5';
    const theme = isDefault
      ? 'border-yellow-400 ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    return `${base} ${theme}`;
  }
}