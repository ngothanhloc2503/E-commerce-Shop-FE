import { Component, DestroyRef, effect, inject, input, Input, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { SettingService } from '../../../services/setting/setting.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface PaymentSettingForm {
  PAYPAL_API_BASE_URL: FormControl<string>;
  PAYPAL_API_CLIENT_ID: FormControl<string>;
  PAYPAL_API_CLIENT_SECRET: FormControl<string>;
}

@Component({
  selector: 'app-payment-setting',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './payment-setting.component.html',
  styleUrl: './payment-setting.component.css'
})
export class PaymentSettingComponent {
  // Injects
  private destroyRef = inject(DestroyRef);
  private settingService = inject(SettingService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);

  // Inputs
  listAllSettings = input<any>();

  // Signal
  isSubmitting = signal(false);

  paymentSettingForm: FormGroup<PaymentSettingForm> = this.fb.group({
    PAYPAL_API_BASE_URL: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    PAYPAL_API_CLIENT_ID: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    PAYPAL_API_CLIENT_SECRET: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private syncFormEffect = effect(() => {
    const settings = this.listAllSettings();

    if (settings) {
      this.paymentSettingForm.patchValue(settings);
    }
  }, {
    allowSignalWrites: true
  });

  savePaymentSetting() {
    this.isSubmitting.set(true);

    this.settingService.savePaymentSettings(this.paymentSettingForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.alertService.showAndCloseAlertAfterXSecond("Payment settings has been saved successfully.", "green", 3000);
        },
      })
  }
}
