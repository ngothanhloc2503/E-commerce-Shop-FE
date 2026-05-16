import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { AuthStateService } from '../../../../core/services/auth-state/auth-state.service';
import { AuthService } from '../../services/auth-service/auth.service';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}

@Component({
    selector: 'app-sign-in',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent {
  // Inject
  public alertService = inject(AlertService);
  private authStateService = inject(AuthStateService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Form
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

  // Signal
  isSubmitting = signal(false);

  constructor() {
    effect(() => {
      if (this.authStateService.isAuthenticated()) {
        const user = this.authStateService.user();
        if (user) {
          if (user.roles.includes('ROLE_CUSTOMER')) {
            this.router.navigateByUrl('');
          } else {
            this.router.navigateByUrl('/staff');
          }
        }
      }
    });
  }

  // API
  signIn() {
    if (this.loginForm.invalid) return;

    this.isSubmitting.set(true);
    this.authService.signIn(this.loginForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.alertService.showAndCloseAlertAfterXSecond(err?.error?.message || 'Login failed', 'red', 3000);
        }
      });
  }

  signInWithGoogle() {
    this.authService.signInWithGoogle();
  }
}
