import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  // Inject
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // State
  isSent = signal<boolean>(false);
  isSuccess = signal<boolean>(false);
  message = signal<string>('');

  email = '';
  resetPasswordToken = '';

  // Form
  resetPasswordForm = inject(FormBuilder).group({
    password: new FormControl('', [Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]),
    confirmPassword: new FormControl('')
  }, {
    validators: this.match('password', 'confirmPassword')
  });

  ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.email = params['email'] || '';
        this.resetPasswordToken = params['token'] || '';

        if (!this.resetPasswordToken) {
          this.router.navigateByUrl('/sign-in');
        }
      });
  }

  // API
  resetPassword() {
    this.isSent.set(false);

    const passwordVal = this.resetPasswordForm.get('password')?.value;

    this.authService.resetPassword(this.resetPasswordToken, passwordVal)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.message.set('Reset password has been successfully.');
          this.isSent.set(true);
        },
        error: (err) => {
          this.isSuccess.set(false);
          this.message.set(err?.error?.message || "An unexpected error occurred. Please try again later.");
          this.isSent.set(true);
        }
      });
  }

  private match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);
      if (!control || !matchingControl) return null; // Bỏ console.error

      const error = control.value === matchingControl.value ? null : { noMatch: true };
      matchingControl.setErrors(error);
      return error;
    };
  }
}