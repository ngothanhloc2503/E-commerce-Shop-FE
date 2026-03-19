import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-account.component.html',
  styleUrl: './verify-account.component.css'
})
export class VerifyAccountComponent {
  verifyCode = '';
  isVerified = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(s => this.verifyCode = s['code']);
    this.getVerifyResult();
  }

  getVerifyResult() {
    this.authService.verifyAccount(this.verifyCode).subscribe({
      next: (res) => {
        this.isVerified = res;
      },
      error: (err) => {
        if (err > 0 && err.status != 403) {
          this.isVerified = false;
        } else {
          this.alertService.showAndCloseAlertAfterXSecond("An unexpected error occurred. Please try again later.", "red", 3000);
        }
      }
    })
  }
}
