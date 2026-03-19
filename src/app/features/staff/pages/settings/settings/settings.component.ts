import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { SettingService } from '../../../services/setting/setting.service';
import { CountriesSettingComponent } from '../countries-setting/countries-setting.component';
import { GeneralSettingComponent } from '../general-setting/general-setting.component';
import { MailServerSettingComponent } from '../mail-server-setting/mail-server-setting.component';
import { MailTemplatesSettingComponent } from '../mail-templates-setting/mail-templates-setting.component';
import { PaymentSettingComponent } from '../payment-setting/payment-setting.component';
import { StateSettingComponent } from '../state-setting/state-setting.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,
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
