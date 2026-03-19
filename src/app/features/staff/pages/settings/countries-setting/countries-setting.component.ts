import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { CountryService } from '../../../services/setting/country.service';

@Component({
  selector: 'app-countries-setting',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './countries-setting.component.html',
  styleUrl: './countries-setting.component.css'
})
export class CountriesSettingComponent {
  isChanging = false;
  listCountries: any[] = [];

  countryForm!: FormGroup;
  id = new FormControl(0);
  name = new FormControl('', [
    Validators.required,
  ]);
  code = new FormControl('', [
    Validators.required,
  ]);

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private countryService: CountryService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.countryForm = this.fb.group({
      id: this.id,
      name: this.name,
      code: this.code,
    })

    this.getAllCountries();
  }

  deleteCountry() {
    let id: number = this.countryForm.get('id')?.value;
    this.countryService.deleteCountryByID(id).subscribe({
      next: (res) => {
        this.onReloadCountryList();
        this.alertService.showAndCloseAlertAfterXSecond("Country has been deleted successfully!", "green", 3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  saveCountry() {
    this.countryService.saveCountry(this.countryForm.value).subscribe({
      next: (res) => {
        this.onReloadCountryList();
        this.alertService.showAndCloseAlertAfterXSecond("Country has been saved successfully!", "green", 3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getAllCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (res) => {
        this.listCountries = res;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  onSelectCountry(event: Event) {
    let target = event.target as HTMLInputElement;
    for (let country of this.listCountries) {
      if (country.id == target.value) {
        this.countryForm.patchValue(country);
      } 
    }

    this.isChanging = true;
  }

  onReloadCountryList() {
    const country = {
      id: 0,
      name: '',
      code: ''
    }
    this.countryForm.patchValue(country);

    this.isChanging = false;
    this.getAllCountries();
  }
}
