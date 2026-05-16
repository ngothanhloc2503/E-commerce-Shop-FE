import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../core/services/account/account.service';
import { AlertService } from '../../../core/services/alert/alert.service';
import { CountryService } from '../../../core/services/country/country.service';
import { InputComponent } from '../input/input.component';
import { AuthStateService } from '../../../core/services/auth-state/auth-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-account-detail',
    imports: [ReactiveFormsModule, InputComponent],
    templateUrl: './account-detail.component.html',
    styleUrl: './account-detail.component.css'
})
export class AccountDetailComponent {
  // Signals
  userPhoto = signal<File | null>(null);
  photoPreviewSrc = signal<string>(
    "https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/default-user.png"
  );

  listCountries = signal<any[]>([]);
  listStates = signal<any[]>([]);
  redirect = signal<string>('');

  // Injects
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);
  private accountService = inject(AccountService);
  private countryService = inject(CountryService);
  private authState = inject(AuthStateService);
  private destroyRef = inject(DestroyRef);

  // Form
  accountForm = this.fb.group({
    id: [null as number | null],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    ]],
    confirmPassword: [''],
    phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    birthOfDate: ['', Validators.required],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: [''],
    state: ['', Validators.required],
    country: ['', Validators.required],
    postalCode: ['', Validators.required],
    photo: [null as string | null]
  }, {
    validators: this.matchValidator('password', 'confirmPassword')
  });

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(p => {
        this.redirect.set(p['redirect'] || '');
      });

    this.loadInitialData();
  }

  ngOnInit() {
    this.accountForm.get('country')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(country => {
        if (country) this.getStateByCountryName();
      });
  }

  // Load Init
  loadInitialData() {
    this.getAccountDetails();
    this.getAllCountries();
  }

  // Call API
  getStateByCountryName() {
    const country = this.accountForm.get('country')?.value;
    if (!country) return;


    this.countryService.getStateByCountryName(country)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.listStates.set(res.data)
      });
  }

  getAllCountries() {
    this.countryService.getAllCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.listCountries.set(res.data)
      });
  }

  getAccountDetails() {
    this.accountService.getAccountDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;

          this.accountForm.patchValue(data);
          this.photoPreviewSrc.set(data.imagePath);
        }
      });
  }

  // Action
  saveAccount() {
    if (this.accountForm.invalid) return;

    this.accountService
      .updateAccountDetails(this.accountForm.value, this.userPhoto())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;

          this.accountForm.patchValue(data);
          this.photoPreviewSrc.set(data.imagePath);

          this.authState.updateUser({
            fullName: data.firstName + ' ' + data.lastName,
            image: data.imagePath
          });

          if (this.redirect()) {
            this.router.navigate(['/address-book'], {
              queryParams: { redirect: 'cart' }
            });
          } else {
            this.router.navigateByUrl('/account');
          }

          this.alertService.showAndCloseAlertAfterXSecond("Your account details have been updated.", "green", 3000);
        },
      })
  }

  onSelectPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      input.value = '';
      this.alertService.showAndCloseAlertAfterXSecond("Invalid image file!", "red", 3000);
      return;
    }

    this.userPhoto.set(file);

    const reader = new FileReader();
    reader.onload = () => this.photoPreviewSrc.set(reader.result as string);
    reader.readAsDataURL(file);

    this.accountForm.patchValue({ photo: file.name });
  }

  cancel() {
    if (this.redirect()) {
      this.router.navigateByUrl("/address-book");
    } else {
      this.router.navigateByUrl("/account");
    }
  }

  matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matching = group.get(matchingControlName);

      if (!control || !matching) return null;

      return control.value === matching.value ? null : { noMatch: true };
    };
  }
}
