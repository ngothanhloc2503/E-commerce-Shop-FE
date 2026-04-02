import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { GeneralSettingService } from '../../../../../core/services/general-setting/general-setting.service';
import { SettingService } from '../../../services/setting/setting.service';

@Component({
  selector: 'app-general-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-setting.component.html',
  styleUrl: './general-setting.component.css'
})
export class GeneralSettingComponent {
  @Input() listAllSettings: any[] = [];
  @Input() logoImageBaseURI: string = '';

  listCurrencies: any = [];
  generalSettingForm!: FormGroup;
  siteLogoFile!: File;
  logoPreviewSrc = '';

  CURRENCY_ID = new FormControl(1, [
    Validators.required,
  ]);
  CURRENCY_SYMBOL = new FormControl('$', [
    Validators.required,
  ]);
  CURRENCY_SYMBOL_POSITION = new FormControl('before', [
    Validators.required,
  ]);
  DECIMAL_DIGITS = new FormControl(2, [
    Validators.required,
  ]);
  DECIMAL_POINT_TYPE = new FormControl('POINT', [
    Validators.required,
  ]);
  THOUSANDS_POINT_TYPE = new FormControl('COMMA', [
    Validators.required,
  ]);
  SITE_LOGO = new FormControl('', [
    Validators.required,
  ]);

  constructor(
    private settingService: SettingService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private generalSettingService: GeneralSettingService,
  ) {
    this.generalSettingForm = this.fb.group({
      CURRENCY_ID: this.CURRENCY_ID,
      CURRENCY_SYMBOL: this.CURRENCY_SYMBOL,
      CURRENCY_SYMBOL_POSITION: this.CURRENCY_SYMBOL_POSITION,
      DECIMAL_DIGITS: this.DECIMAL_DIGITS,
      DECIMAL_POINT_TYPE: this.DECIMAL_POINT_TYPE,
      THOUSANDS_POINT_TYPE: this.THOUSANDS_POINT_TYPE,
      SITE_LOGO: this.SITE_LOGO
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('listAllSettings' in changes && 'logoImageBaseURI' in changes) {
      if (changes['listAllSettings'].currentValue != undefined) {
        this.generalSettingForm.patchValue(changes['listAllSettings'].currentValue);
        this.logoPreviewSrc = changes['logoImageBaseURI'].currentValue + this.generalSettingForm.get('SITE_LOGO')?.value;
      }
    }
  }

  ngOnInit() {
    this.getAllCurrencies();
  }
  
  saveGeneralSettings() {
    let data: FormData = new FormData();
    for(let item of Object.keys(this.generalSettingForm.controls)) {
      data.append(item, this.generalSettingForm.get(item)?.value);
    }
    data.append("logoFile", this.siteLogoFile);
    
    this.settingService.saveGeneralSettings(data).subscribe({
      next: async (res) => {
        await this.generalSettingService.loadSettings();
        this.alertService.showAndCloseAlertAfterXSecond("General settings has been saved successfully.", "green", 3000);
      },
    })
  }

  getAllCurrencies() {
    this.settingService.getAllCurrencies().subscribe({
      next: (res) => {
        this.listCurrencies = res;
      },
    })
  }

  onSelectLogo(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) {
      return;
    }
    const file = target.files[0];
    if (file) {
      if (file.type == 'image/png' || file.type == 'image/jpg' || file.type == 'image/jpeg') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {
          this.logoPreviewSrc = e.target.result;
        }
        
        this.generalSettingForm.patchValue({SITE_LOGO: file.name});
        this.siteLogoFile = file;
      } else {
        target.value = '';
        this.alertService.showAndCloseAlertAfterXSecond("Image should be png, jpg, or jpeg extension!", "red", 3000);
      }
    }
  }
}
