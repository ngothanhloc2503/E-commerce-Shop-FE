import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { InputComponent } from '../input/input.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { AlertService } from '../../services/alert/alert.service';
import { CountryService } from '../../services/country/country.service';
import { StateService } from '../../services/state/state.service';
import { UtilsService } from '../../services/utils/utils.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [InputComponent, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  listCountries: any[] = [];
  listStates: any[] = [];

  registerForm!: FormGroup;
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private countryService: CountryService,
    private stateService: StateService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
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
    }, {
      validators: this.match('password', 'confirm_password')
    });

    this.getAllCountries();
  }

  signUp() {
    this.authService.signUp(this.registerForm.value).subscribe({
      next: (res) => {
        if (res) {
          this.router.navigateByUrl("/sign-in")
          this.alertService.showAndCloseAlertAfterXSecond("Account has been created successfully. Please check your email to verify your account!", "green", 20000);
        } else {
          this.alertService.showAndCloseAlertAfterXSecond("An unexpected error occurred. Please try again later.", "red", 3000);
        }
      }, 
      error: (err) => {
          if(err.status > 0) {
            this.email.setErrors({emailNotUnique: true});
          } else {
            this.alertService.showAndCloseAlertAfterXSecond("An unexpected error occurred. Please try again later.", "red", 3000);
          }
      },
    })
  }

  getStateByCountryName() {
    if (this.country.value != null && this.country.value != undefined && this.country.value != '') {
      this.stateService.getStateByCountryName(this.country.value).subscribe({
        next: (res) => {
          this.listStates = res;
        },
        error: (err) => {
          this.utilsService.handleError(err);
        }
      })
    }
  }

  getAllCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (res) => {
        this.listCountries = res;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  match(controlName: string, matchingControlName: string) : ValidatorFn {
    return (group: AbstractControl) : ValidationErrors | null  => {
        const control = group.get(controlName);
        const matchingControl = group.get(matchingControlName);

        if (!control || !matchingControl) {
            console.error('Form controls can not be found in the form group.');
            return { controlNotFound: false };
        }

        const error = control.value === matchingControl.value ? null : { noMatch: true };
        
        matchingControl.setErrors(error);

        return error;
    }
  }
}
