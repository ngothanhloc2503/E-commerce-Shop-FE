import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { CountryService } from '../../../services/setting/country.service';

@Component({
  selector: 'app-countries-setting',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './countries-setting.component.html',
  styleUrl: './countries-setting.component.css'
})
export class CountriesSettingComponent {
  // Injects
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private countryService = inject(CountryService);
  
  // Signals
  isChanging = signal(false);
  listCountries = signal<any[]>([]);
  isSubmitting = signal(false);
  isDeleting = signal(false);

  // Form
  countryForm: FormGroup = this.fb.group({
    id: new FormControl(0),
    name: new FormControl('', Validators.required),
    code: new FormControl('', Validators.required),
  });

  constructor() {
    this.getAllCountries();
  }

  // API
  getAllCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (res) => {
        this.listCountries.set(res.data);
      },
    })
  }

  deleteCountry() {
    let id: number = this.countryForm.get('id')?.value;
    this.isDeleting.set(true);
    this.countryService.deleteCountryByID(id).subscribe({
      next: () => {
        this.onReloadCountryList();
        this.isDeleting.set(false);
        this.alertService.showAndCloseAlertAfterXSecond("Country has been deleted successfully!", "green", 3000);
      },
      error: () => {
        this.isDeleting.set(false);
      }
    })
  }

  saveCountry() {
    this.isSubmitting.set(true);
    this.countryService.saveCountry(this.countryForm.value).subscribe({
      next: () => {
        this.onReloadCountryList();
        this.isSubmitting.set(false);
        this.alertService.showAndCloseAlertAfterXSecond("Country has been saved successfully!", "green", 3000);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    })
  }

  // UI Handlers  
  onSelectCountry(event: Event) {
    let target = event.target as HTMLInputElement;
    for (let country of this.listCountries()) {
      if (country.id == target.value) {
        this.countryForm.patchValue(country);
      }
    }

    this.isChanging.set(true);
  }

  onReloadCountryList() {
    const country = {
      id: 0,
      name: '',
      code: ''
    }
    this.countryForm.patchValue(country);

    this.isChanging.set(false);
    this.getAllCountries();
  }
}
