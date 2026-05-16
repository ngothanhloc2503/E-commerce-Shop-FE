import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { SettingService } from '../../../services/setting/setting.service';

interface MailTemplatesForm {
  CUSTOMER_VERIFY_SUBJECT: FormControl<string>;
  CUSTOMER_VERIFY_CONTENT: FormControl<string>;
  ORDER_CONFIRMATION_SUBJECT: FormControl<string>;
  ORDER_CONFIRMATION_CONTENT: FormControl<string>;
}

@Component({
    selector: 'app-mail-templates-setting',
    imports: [CommonModule, ReactiveFormsModule, InputComponent, EditorModule],
    templateUrl: './mail-templates-setting.component.html',
    styleUrl: './mail-templates-setting.component.css'
})
export class MailTemplatesSettingComponent {
  // Injects
  private destroyRef = inject(DestroyRef);
  private settingService = inject(SettingService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);

  // Inputs
  listAllSettings = input<any>();

  // Signal
  isSubmitting = signal(false);

  // Form
  mailTemplatesForm: FormGroup<MailTemplatesForm> = this.fb.group({
    CUSTOMER_VERIFY_SUBJECT: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    CUSTOMER_VERIFY_CONTENT: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    ORDER_CONFIRMATION_SUBJECT: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    ORDER_CONFIRMATION_CONTENT: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private syncFormEffect = effect(() => {
    const value = this.listAllSettings();

    if (value && !this.mailTemplatesForm.dirty) {
      this.mailTemplatesForm.patchValue(value);
    }
  }, {
    allowSignalWrites: true
  });

  saveMailTemplatesSettings() {
    if (this.mailTemplatesForm.invalid) {
      this.mailTemplatesForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.settingService.saveMailTemplatesSettings(this.mailTemplatesForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.mailTemplatesForm.markAsPristine();
          this.alertService.showAndCloseAlertAfterXSecond("Mail templates has been saved successfully.", "green", 3000);
        },
      })
  }

  get f() {
    return this.mailTemplatesForm.controls;
  }
}
