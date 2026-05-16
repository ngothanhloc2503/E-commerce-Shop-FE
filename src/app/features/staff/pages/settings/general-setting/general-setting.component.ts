
import { Component, DestroyRef, effect, inject, input, Input, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { GeneralSettingService } from '../../../../../core/services/general-setting/general-setting.service';
import { SettingService } from '../../../services/setting/setting.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
interface GeneralSettingsForm {
  CURRENCY_ID: FormControl<number>;
  CURRENCY_SYMBOL: FormControl<string>;
  CURRENCY_SYMBOL_POSITION: FormControl<string>;
  DECIMAL_DIGITS: FormControl<number>;
  DECIMAL_POINT_TYPE: FormControl<string>;
  THOUSANDS_POINT_TYPE: FormControl<string>;
  SITE_LOGO: FormControl<string>;
}

@Component({
    selector: 'app-general-setting',
    imports: [ReactiveFormsModule],
    templateUrl: './general-setting.component.html',
    styleUrl: './general-setting.component.css'
})
export class GeneralSettingComponent {
  // Injects
  private settingService = inject(SettingService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);
  private generalSettingService = inject(GeneralSettingService);
  private destroyRef = inject(DestroyRef);

  // Inputs
  listAllSettings = input<any>();
  logoImageBaseURI = input<string>();

  // Signals
  logoPreviewSrc = signal<string>('');
  siteLogoFile = signal<File | null>(null);
  isSubmitting = signal(false);

  listCurrencies = toSignal(
    this.settingService.getAllCurrencies().pipe(
      map(res => res.data)
    ),
    { initialValue: [] }
  );

  // Form
  generalSettingForm: FormGroup<GeneralSettingsForm> = this.fb.group({
    CURRENCY_ID: new FormControl(1, { nonNullable: true, validators: [Validators.required] }),
    CURRENCY_SYMBOL: new FormControl('$', { nonNullable: true, validators: [Validators.required] }),
    CURRENCY_SYMBOL_POSITION: new FormControl('before', { nonNullable: true, validators: [Validators.required] }),
    DECIMAL_DIGITS: new FormControl(2, { nonNullable: true, validators: [Validators.required] }),
    DECIMAL_POINT_TYPE: new FormControl('POINT', { nonNullable: true, validators: [Validators.required] }),
    THOUSANDS_POINT_TYPE: new FormControl('COMMA', { nonNullable: true, validators: [Validators.required] }),
    SITE_LOGO: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  private syncFormEffect = effect(() => {
    const settings = this.listAllSettings();
    const base = this.logoImageBaseURI();

    if (settings) {
      this.generalSettingForm.patchValue(settings);

      const logo = settings.SITE_LOGO;
      if (logo && base) {
        this.logoPreviewSrc.set(base + logo);
      }
    }
  }, {
    allowSignalWrites: true
  });

  // Action
  saveGeneralSettings() {
    this.isSubmitting.set(true);

    if (this.generalSettingForm.invalid) {
      this.generalSettingForm.markAllAsTouched();
      return;
    }

    const data = new FormData();

    Object.entries(this.generalSettingForm.getRawValue())
      .forEach(([key, value]) => data.append(key, String(value)));

    const file = this.siteLogoFile();
    if (file) {
      data.append('logoFile', file);
    }

    this.settingService.saveGeneralSettings(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async () => {
          await this.generalSettingService.loadSettings();
          this.isSubmitting.set(false);
          this.alertService.showAndCloseAlertAfterXSecond("General settings has been saved successfully", "green", 3000);
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      })
  }

  // Upload logo
  uploadLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSizeMB = 2;

    if (!allowedTypes.includes(file.type)) {
      this.resetFile(input, 'Image should be png, jpg, or jpeg extension!');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      this.resetFile(input, 'Max file size is 2MB');
      return;
    }

    this.siteLogoFile.set(file);
    this.generalSettingForm.controls.SITE_LOGO.setValue(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewSrc.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  private resetFile(input: HTMLInputElement, message: string) {
    input.value = '';
    this.alertService.showAndCloseAlertAfterXSecond(message, 'red', 3000);
  }
}
