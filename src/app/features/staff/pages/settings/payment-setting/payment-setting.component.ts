import { Component, DestroyRef, effect, inject, input, Input, SimpleChanges } from '@angular/core';
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
  private destroyRef = inject(DestroyRef);

  // Inputs
  listAllSettings = input<any>();

  isSubmitting = false;

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


  constructor(
    private settingService: SettingService,
    private alertService: AlertService,
    private fb: FormBuilder,
  ) { }

  private syncFormEffect = effect(() => {
    const settings = this.listAllSettings();

    if (settings) {
      this.paymentSettingForm.patchValue(settings);
    }
  }, {
    allowSignalWrites: true
  });

  savePaymentSetting() {
    this.isSubmitting = true;

    this.settingService.savePaymentSettings(this.paymentSettingForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.alertService.showAndCloseAlertAfterXSecond("Payment settings has been saved successfully.", "green", 3000);
        },
      })
  }
}
