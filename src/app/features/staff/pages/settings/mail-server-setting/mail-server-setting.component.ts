import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { SettingService } from '../../../services/setting/setting.service';

@Component({
  selector: 'app-mail-server-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './mail-server-setting.component.html',
  styleUrl: './mail-server-setting.component.css'
})
export class MailServerSettingComponent {
  @Input() listAllSettings: any[] = [];

  mailServerSettingForm!: FormGroup;
  MAIL_HOST = new FormControl('', [Validators.required]);
  MAIL_PORT = new FormControl('', [Validators.required]);
  MAIL_USERNAME = new FormControl('', [Validators.required]);
  MAIL_PASSWORD = new FormControl('', [Validators.required]);
  SMTP_AUTH = new FormControl(true, [Validators.required]);
  SMTP_SECURED = new FormControl(true, [Validators.required]);
  MAIL_FROM = new FormControl('', [Validators.required]);
  MAIL_SENDER_NAME = new FormControl('', [Validators.required]);

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private settingService: SettingService,
    private utilsService: UtilsService,
  ) {
    this.mailServerSettingForm = this.fb.group({
      MAIL_HOST: this.MAIL_HOST,
      MAIL_PORT: this.MAIL_PORT,
      MAIL_USERNAME: this.MAIL_USERNAME,
      MAIL_PASSWORD: this.MAIL_PASSWORD,
      SMTP_AUTH: this.SMTP_AUTH,
      SMTP_SECURED: this.SMTP_SECURED,
      MAIL_FROM: this.MAIL_FROM,
      MAIL_SENDER_NAME: this.MAIL_SENDER_NAME,
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('listAllSettings' in changes) {
      if (changes['listAllSettings'].currentValue != undefined) {
        this.mailServerSettingForm.patchValue(changes['listAllSettings'].currentValue);
      }
    }
  }

  saveMailServerSettings() {
    let data: FormData = new FormData();
    for(let item of Object.keys(this.mailServerSettingForm.controls)) {
      data.append(item, this.mailServerSettingForm.get(item)?.value);
    }
    
    this.settingService.saveMailServerSettings(data).subscribe({
      next: (res) => {
        this.alertService.showAndCloseAlertAfterXSecond("Mail server settings has been saved successfully.", "green", 3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }
}
