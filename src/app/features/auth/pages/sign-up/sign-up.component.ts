import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { CountryService } from '../../../../core/services/country/country.service';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [InputComponent, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent {
  // Inject
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private countryService = inject(CountryService);
  private destroyRef = inject(DestroyRef);

  // Signals
  listCountries = signal<any[]>([]);
  listStates = signal<any[]>([]);
  isSubmitting = signal(false);

  // Form
  registerForm = inject(FormBuilder).group({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]),
    confirmPassword: new FormControl(''),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    birthOfDate: new FormControl('', [Validators.required]),
    addressLine1: new FormControl('', [Validators.required]),
    addressLine2: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    postalCode: new FormControl('', [Validators.required]),
  }, {
    validators: this.match('password', 'confirmPassword')
  });

  // Init
  ngOnInit() {
    this.getAllCountries();
  }

  // API
  signUp() {
    this.isSubmitting.set(true);
    this.authService.signUp(this.registerForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigateByUrl("/sign-in");
          this.alertService.showAndCloseAlertAfterXSecond("Account has been created successfully. Please check your email to verify your account!", "green", 20000);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.status > 0) {
            this.registerForm.get('email')?.setErrors({ emailNotUnique: true });
          } else {
            this.alertService.showAndCloseAlertAfterXSecond("An unexpected error occurred. Please try again later.", "red", 3000);
          }
        },
      });
  }

  getStateByCountryName() {
    const countryVal = this.registerForm.get('country')?.value;
    if (countryVal) {
      this.countryService.getStateByCountryName(countryVal)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.listStates.set(res.data);
          },
        });
    } else {
      this.listStates.set([]);
    }
  }

  getAllCountries() {
    this.countryService.getAllCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.listCountries.set(res.data);
        },
      });
  }

  // Validator
  private match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) return null; // Đã bỏ console.error bẩn code

      const error = control.value === matchingControl.value ? null : { noMatch: true };
      matchingControl.setErrors(error);
      return error;
    };
  }
}
