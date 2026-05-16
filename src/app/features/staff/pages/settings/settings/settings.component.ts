
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingService } from '../../../services/setting/setting.service';
import { CountriesSettingComponent } from '../countries-setting/countries-setting.component';
import { GeneralSettingComponent } from '../general-setting/general-setting.component';
import { MailTemplatesSettingComponent } from '../mail-templates-setting/mail-templates-setting.component';
import { PaymentSettingComponent } from '../payment-setting/payment-setting.component';
import { StateSettingComponent } from '../state-setting/state-setting.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
    selector: 'app-settings',
    imports: [ReactiveFormsModule, GeneralSettingComponent, CountriesSettingComponent, StateSettingComponent, MailTemplatesSettingComponent, PaymentSettingComponent],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent {
  // Inject
  private settingService = inject(SettingService);

  private settingsData = toSignal(
    this.settingService.getAllSettings().pipe(map(res => res.data)),
    { initialValue: [] }
  );

  listAllSettings = computed(() =>
    this.settingsData()?.listSettings ?? []
  );

  logoImageBaseURI = computed(() =>
    this.settingsData()?.logoImageBaseURI ?? ''
  );
}
