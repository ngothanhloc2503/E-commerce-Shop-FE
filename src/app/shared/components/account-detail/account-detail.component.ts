import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../core/services/account/account.service';
import { AlertService } from '../../../core/services/alert/alert.service';
import { CountryService } from '../../../core/services/country/country.service';
import { InputComponent } from '../input/input.component';
import { AuthStateService } from '../../../core/services/auth-state/auth-state.service';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.css'
})
export class AccountDetailComponent {
  userPhoto!: File;
  photoPreviewSrc: any = "https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/default-user.png";
  listCountries: any[] = [];
  listStates: any[] = [];
  redirect = '';

  accountForm!: FormGroup;
  id = new FormControl<number | null>(null);
  email = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  firstName = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);
  lastName = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);
  password = new FormControl('', [
    Validators.pattern(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
    ),
  ]);
  confirm_password = new FormControl('');
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(10),
  ]);
  birthOfDate = new FormControl('', [Validators.required]);
  addressLine1 = new FormControl('', [Validators.required]);
  addressLine2 = new FormControl('');
  city = new FormControl('');
  state = new FormControl('', [Validators.required]);
  country = new FormControl('', [Validators.required]);
  postalCode = new FormControl('', [Validators.required]);
  photo = new FormControl<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private accountService: AccountService,
    private countryService: CountryService,
    private authState: AuthStateService,
  ) { }

  ngOnInit() {
    this.accountForm = this.fb.group({
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      confirm_password: this.confirm_password,
      phoneNumber: this.phoneNumber,
      birthOfDate: this.birthOfDate,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
      photo: this.photo
    }, {
      validators: this.match('password', 'confirm_password')
    });

    this.activatedRoute.queryParams.subscribe(p => this.redirect = p['redirect']);

    this.getAccountDetails();
    this.getAllCountries();
  }

  saveAccount() {
    this.accountService.updateAccountDetails(this.accountForm.value, this.userPhoto).subscribe({
      next: (res) => {
        this.accountForm.patchValue(res);
        this.photoPreviewSrc = res.imagePath;

        this.authState.updateUser({
          fullName: res.firstName + ' ' + res.lastName,
          image: res.imagePath
        });

        if (this.redirect) {
          this.router.navigate(
            ["/address-book"],
            { queryParams: { redirect: "cart" } }
          );
        } else {
          this.router.navigateByUrl("/account");
        }
        this.alertService.showAndCloseAlertAfterXSecond("Your account details have been updated.", "green", 3000);
      },
    })
  }

  getStateByCountryName() {
    if (this.country.value != null && this.country.value != undefined && this.country.value != '') {
      this.countryService.getStateByCountryName(this.country.value).subscribe({
        next: (res) => {
          this.listStates = res;
        },
      })
    }
  }

  getAllCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (res) => {
        this.listCountries = res;
      },
    })
  }

  getAccountDetails() {
    this.accountService.getAccountDetails().subscribe({
      next: (res) => {
        this.accountForm.patchValue(res);
        this.photoPreviewSrc = res.imagePath;
        this.getStateByCountryName();
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

    this.userPhoto = file;

    const reader = new FileReader();
    reader.onload = () => this.photoPreviewSrc = reader.result;
    reader.readAsDataURL(file);

    this.accountForm.patchValue({ photo: file.name });
  }

  cancel() {
    if (this.redirect) {
      this.router.navigateByUrl("/address-book");
    } else {
      this.router.navigateByUrl("/account");
    }
  }

  match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        return { controlNotFound: false };
      }

      const error = control.value === matchingControl.value ? null : { noMatch: true };

      matchingControl.setErrors(error);

      return error;
    }
  }
}
