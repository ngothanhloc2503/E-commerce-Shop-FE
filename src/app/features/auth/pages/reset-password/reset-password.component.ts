import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  isSent = false;
  isSuccess = false;
  bgColor = 'green';
  message = '';
  email = '';
  resetPasswordToken = '';

  resetPasswordForm!: FormGroup;
  password = new FormControl('', [
    Validators.pattern(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
    ),
  ]);
  confirmPassword = new FormControl('');

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      password: this.password,
      confirmPassword: this.confirmPassword
    }, {
      validators: this.match('password', 'confirmPassword')
    })

    this.activatedRoute.queryParams.subscribe(s => this.email = s['email']);
    this.activatedRoute.queryParams.subscribe(s => this.resetPasswordToken = s['token']);
    if (this.resetPasswordToken == null || this.resetPasswordToken == undefined) {
      this.router.navigateByUrl('/login');
    }
  }

  resetPassword() {
    this.isSent = true;
    this.authService.resetPassword(this.resetPasswordToken, this.password.value).subscribe({
      next: (res) => {
        this.isSuccess = true;
        this.bgColor = 'green'
        this.message = `Reset password has been successfully.`;
      },
      error: (err) => {
        this.isSuccess = false;
        this.bgColor = 'red';
        if (err.status > 0) {
          this.message = err.error;
        } else {
          this.message = "An unexpected error occurred. Please try again later.";
        }
      }
    })
  }

  getBgColor() {
    if (this.bgColor == 'green') {
      return 'bg-green-500';
    }
    return 'bg-red-500';
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
