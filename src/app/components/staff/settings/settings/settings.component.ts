import { MailTemplatesSettingComponent } from './../mail-templates-setting/mail-templates-setting.component';
import { Component } from '@angular/core';
import { SettingService } from '../../../../services/staff/setting/setting.service';
import { AlertService } from '../../../../services/alert/alert.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../input/input.component';
import { CommonModule } from '@angular/common';
import { GeneralSettingComponent } from '../general-setting/general-setting.component';
import { CountriesSettingComponent } from '../countries-setting/countries-setting.component';
import { StateSettingComponent } from '../state-setting/state-setting.component';
import { MailServerSettingComponent } from '../mail-server-setting/mail-server-setting.component';
import { PaymentSettingComponent } from '../payment-setting/payment-setting.component';
import { UtilsService } from '../../../../services/utils/utils.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, CommonModule, 
    GeneralSettingComponent, CountriesSettingComponent, StateSettingComponent,
    MailServerSettingComponent, MailTemplatesSettingComponent, PaymentSettingComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  listAllSettings: any[] = [];
  logoImageBaseURI = '';

  constructor(
    private settingService: SettingService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.getAllSettings();
  }

  getAllSettings() {
    this.settingService.getAllSettings().subscribe({
      next: (res) => {
        this.listAllSettings = res.listSettings;
        this.logoImageBaseURI = res.logoImageBaseURI;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }
}
