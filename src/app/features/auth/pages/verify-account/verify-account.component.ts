import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './verify-account.component.html',
  styleUrl: './verify-account.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyAccountComponent {
  // Inject
  private activatedRoute = inject(ActivatedRoute);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  // Signals
  verifyCode = '';
  isVerified = signal<boolean>(false);

  // Init
  ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.verifyCode = params['code'] || '';

        this.getVerifyResult();
      });
  }

  getVerifyResult() {
    if (!this.verifyCode) return;

    this.authService.verifyAccount(this.verifyCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.isVerified.set(res.data);
        },
        error: (err: any) => {
          if (err.status > 0 && err.status != 403) {
            this.isVerified.set(false);
          } else {
            this.alertService.showAndCloseAlertAfterXSecond("An unexpected error occurred. Please try again later.", "red", 3000);
          }
        }
      });
  }
}
