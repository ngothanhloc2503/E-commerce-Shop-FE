import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { InputComponent } from '../input/input.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  isSent = false;
  bgColor = 'green';
  message = '';

  forgotPasswordForm!: FormGroup;
  email = new FormControl('', [
    Validators.required, 
    Validators.email
  ])

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.forgotPasswordForm = this.fb.group({
      email: this.email
    })
  }

  forgotPassword() {
    this.isSent = true;
    this.authService.forgotPassword(this.email.value).subscribe({
      next: (res) => {
        this.bgColor = 'green';
        this.message = `Please check your email to get link reset password. If you don't receive this, please send again.`;
      },
      error: (err) => {
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
}
