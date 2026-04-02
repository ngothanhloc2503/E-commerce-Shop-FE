import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { SettingService } from '../../../services/setting/setting.service';

@Component({
  selector: 'app-mail-templates-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, EditorModule],
  templateUrl: './mail-templates-setting.component.html',
  styleUrl: './mail-templates-setting.component.css'
})
export class MailTemplatesSettingComponent {
  @Input() listAllSettings: any[] = [];

  mailTemplatesForm!: FormGroup;
  CUSTOMER_VERIFY_SUBJECT = new FormControl('', [Validators.required]);
  CUSTOMER_VERIFY_CONTENT = new FormControl('', [Validators.required]);
  ORDER_CONFIRMATION_SUBJECT = new FormControl('', [Validators.required]);
  ORDER_CONFIRMATION_CONTENT = new FormControl('', [Validators.required]);

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private settingService: SettingService,
  ) {
    this.mailTemplatesForm = this.fb.group({
      CUSTOMER_VERIFY_SUBJECT: this.CUSTOMER_VERIFY_SUBJECT,
      CUSTOMER_VERIFY_CONTENT: this.CUSTOMER_VERIFY_CONTENT,
      ORDER_CONFIRMATION_SUBJECT: this.ORDER_CONFIRMATION_SUBJECT,
      ORDER_CONFIRMATION_CONTENT: this.ORDER_CONFIRMATION_CONTENT,
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('listAllSettings' in changes) {
      if (changes['listAllSettings'].currentValue != undefined) {
        this.mailTemplatesForm.patchValue(changes['listAllSettings'].currentValue);
      }
    }
  }

  saveMailTemplatesSettings() {
    let data: FormData = new FormData();
    for(let item of Object.keys(this.mailTemplatesForm.controls)) {
      data.append(item, this.mailTemplatesForm.get(item)?.value);
    }
    
    this.settingService.saveMailTemplatesSettings(data).subscribe({
      next: (res) => {
        this.alertService.showAndCloseAlertAfterXSecond("Mail templates has been saved successfully.", "green", 3000);
      },
    })
  }
}
