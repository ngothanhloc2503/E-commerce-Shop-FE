import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { SettingService } from '../../../services/setting/setting.service';

@Component({
  selector: 'app-payment-setting',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './payment-setting.component.html',
  styleUrl: './payment-setting.component.css'
})
export class PaymentSettingComponent {
  @Input() listAllSettings: any[] = [];

  paymentSettingForm!: FormGroup;
  PAYPAL_API_BASE_URL = new FormControl('', [Validators.required]);
  PAYPAL_API_CLIENT_ID = new FormControl('', [Validators.required]);
  PAYPAL_API_CLIENT_SECRET = new FormControl('', [Validators.required]);

  constructor(
    private settingService: SettingService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.paymentSettingForm = this.fb.group({
      PAYPAL_API_BASE_URL: this.PAYPAL_API_BASE_URL,
      PAYPAL_API_CLIENT_ID: this.PAYPAL_API_CLIENT_ID,
      PAYPAL_API_CLIENT_SECRET: this.PAYPAL_API_CLIENT_SECRET
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('listAllSettings' in changes) {
      if (changes['listAllSettings'].currentValue != undefined) {
        this.paymentSettingForm.patchValue(changes['listAllSettings'].currentValue);
      }
    }
  }

  savePaymentSetting() {
    let data: FormData = new FormData();
    for(let item of Object.keys(this.paymentSettingForm.controls)) {
      data.append(item, this.paymentSettingForm.get(item)?.value);
    }
    
    this.settingService.savePaymentSettings(data).subscribe({
      next: (res) => {
        this.alertService.showAndCloseAlertAfterXSecond("Payment settings has been saved successfully.", "green", 3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }
}
