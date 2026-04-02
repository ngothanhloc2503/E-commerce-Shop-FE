import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  @Input() control!: AbstractControl;
  @Input() type = 'text';
  @Input() step = 1;
  @Input() placeholder = '';
  @Input() required = false;

  get formControl(): FormControl {
    return this.control as FormControl;
  }

  errorMessage(): string | null {
    if (!this.control.errors) return null;

    const errors = this.control.errors;

    if (errors['required']) return 'Field is required.';
    if (errors['minlength']) return `It must be at least ${errors['minlength'].requiredLength} characters long.`;
    if (errors['maxlength']) return `It can only have ${errors['maxlength'].requiredLength} characters or less.`;
    if (errors['email']) return 'You must enter a valid email.';
    if (errors['min']) return 'Value too low.';
    if (errors['max']) return 'Value too high.';
    if (errors['pattern']) return 'Password must be at least 8 characters long, have 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.';
    if (errors['noMatch']) return 'Password does not match.';
    if (errors['emailNotUnique']) return 'Email already taken. Please try another email.';
    if (errors['nameNotUnique']) return 'Name already taken. Please try another name.';

    return null; // fallback nếu có lỗi không xác định
  }
}
