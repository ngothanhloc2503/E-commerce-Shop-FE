import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputComponent } from '../../../../shared/components/input/input.component';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [ReactiveFormsModule, InputComponent, RouterModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  // Inject
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  // State
  isSent = signal<boolean>(false);
  isSuccess = signal<boolean>(false);
  message = signal<string>('');

  // Form
  forgotPasswordForm = inject(FormBuilder).group({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  // API
  forgotPassword() {
    this.isSent.set(false);

    const emailVal = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(emailVal)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.message.set('Please check your email to get link reset password. If you don\'t receive this, please send again.');
          this.isSent.set(true);
        },
        error: (err: any) => {
          this.isSuccess.set(false);
          this.message.set(err?.error?.message || "An unexpected error occurred. Please try again later.");
          this.isSent.set(true);
        }
      });
  }
}