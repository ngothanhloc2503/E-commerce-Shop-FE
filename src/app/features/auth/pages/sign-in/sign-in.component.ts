import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { StorageService } from '../../../../core/services/storage/storage.service';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  message = '';

  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required, 
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required, 
      Validators.minLength(6)
    ]),
    rememberMe: new FormControl(false)
  })

  constructor(
    public alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private utilsService: UtilsService,
  ) { }

  ngOnInit() {
    if (StorageService.isCustomerLoggedIn()) {
      this.router.navigateByUrl("");
    } else if (StorageService.isStaffLoggedIn()) {
      this.router.navigateByUrl("/staff");
    }
  }

  signIn() {
    this.authService.signIn(this.loginForm.value).subscribe({
      next: (res) => {
        if (StorageService.isCustomerLoggedIn()) {
          this.router.navigateByUrl("");
        } else if (StorageService.isStaffLoggedIn()) {
          this.router.navigateByUrl("/staff");
        }
      },
      error: (err) => {
        this.utilsService.handleError(err);
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
