import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { AuthStateService } from '../../../../core/services/auth-state/auth-state.service';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  message = '';

  loginForm = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    rememberMe: new FormControl(false, { nonNullable: true })
  });

  constructor(
    public alertService: AlertService,
    private authStateService: AuthStateService,
    private authService: AuthService,
    private router: Router,
  ) { 
    effect(() => {
      if (this.authStateService.isAuthenticated()) {
        const user = this.authStateService.user();
        if (user) {
          // Ví dụ phân role customer/staff
          if (user.roles.includes('ROLE_CUSTOMER')) {
            this.router.navigateByUrl('');
          } else {
            this.router.navigateByUrl('/staff');
          }
        }
      }
    });
  }

  signIn() {
    if (this.loginForm.invalid) return;

    this.authService.signIn(this.loginForm.value).subscribe({
      next: (res) => {
        this.alertService.showAndCloseAlertAfterXSecond('Login successful', 'green', 2000);
      },
      error: (err) => {
        this.alertService.showAndCloseAlertAfterXSecond(err?.error?.message || 'Login failed', 'red', 3000);
      }
    });
  }

  signInWithGoogle() {
    this.authService.signInWithGoogle();
  }

  signInWithFacebook() {
    this.authService.signInWithFacebook();
  }
}
