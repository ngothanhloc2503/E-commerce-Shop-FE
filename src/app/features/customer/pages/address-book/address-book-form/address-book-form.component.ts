import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { CountryService } from '../../../../../core/services/country/country.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { AddressBookService } from '../../../services/address-book/address-book.service';

@Component({
    selector: 'app-address-form',
    imports: [ReactiveFormsModule, InputComponent],
    templateUrl: './address-book-form.component.html',
    styleUrl: './address-book-form.component.css'
})
export class AddressBookFormComponent implements OnInit {
  // Inject
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private alertService = inject(AlertService);
  private countryService = inject(CountryService);
  private addressBookService = inject(AddressBookService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  // Signals
  readonly addressId = signal(0);
  readonly redirect = signal('');
  readonly listCountries = signal<any[]>([]);
  readonly listStates = signal<any[]>([]);

  readonly isEditMode = computed(() => this.addressId() > 0);
  readonly pageTitle = computed(() =>
    this.isEditMode()
      ? `Edit Address (ID: ${this.addressId()})`
      : 'Add New Address'
  );

  // Form
  private fb = inject(NonNullableFormBuilder);

  addressForm = this.fb.group({
    id: [0 as number],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    addressLine1: ['', [Validators.required]],
    addressLine2: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    country: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
  });

  // Aliases
  get firstName() { return this.addressForm.get('firstName')!; }
  get lastName() { return this.addressForm.get('lastName')!; }
  get phoneNumber() { return this.addressForm.get('phoneNumber')!; }
  get addressLine1() { return this.addressForm.get('addressLine1')!; }
  get addressLine2() { return this.addressForm.get('addressLine2')!; }
  get city() { return this.addressForm.get('city')!; }
  get state() { return this.addressForm.get('state')!; }
  get country() { return this.addressForm.get('country')!; }
  get postalCode() { return this.addressForm.get('postalCode')!; }

  // Init
  ngOnInit() {
    this.listenToRouteParams();
    this.loadCountries();
    this.listenToCountryChange();

    this.titleService.setTitle(this.pageTitle());
  }

  private listenToRouteParams() {
    this.activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = Number(params.get('id'));
        this.addressId.set(id);
        if (id) this.loadAddressById(id);
      });

    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.redirect.set(params.get('redirect') ?? ''));
  }

  private listenToCountryChange() {
    this.country.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(country => {
        this.state.setValue('');
        this.listStates.set([]);

        if (country) {
          this.countryService.getStateByCountryName(country)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => this.listStates.set(res.data));
        }
      });
  }

  // Data loading
  private loadCountries() {
    this.countryService.getAllCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.listCountries.set(res.data));
  }

  private loadAddressById(id: number) {
    this.addressBookService.getAddressById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.addressForm.patchValue(res.data);
      });
  }

  // API
  saveAddress() {
    if (this.addressForm.invalid) return;

    this.addressBookService.saveAddressBook(this.addressForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.redirect()) {
            this.router.navigate(['/address-book'], { queryParams: { redirect: 'cart' } });
          } else {
            this.router.navigateByUrl('/address-book');
            this.alertService.showAndCloseAlertAfterXSecond(
              'Address has been saved successfully.', 'green', 3000
            );
          }
        },
      });
  }

  cancel() {
    this.router.navigateByUrl('/address-book');
  }
}