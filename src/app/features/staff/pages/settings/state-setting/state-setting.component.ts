import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { CountryService } from '../../../services/setting/country.service';
import { StateService } from '../../../services/setting/state.service';

@Component({
  selector: 'app-state-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './state-setting.component.html',
  styleUrl: './state-setting.component.css'
})
export class StateSettingComponent {
  isChanging = false;
  listCountries: any[] = [];
  listStates: any[] = [];
  selectedCountry: number = 0;

  stateForm!: FormGroup;
  id = new FormControl(0);
  name = new FormControl('', [
    Validators.required,
  ])
  countryID = new FormControl(0);

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private countryService: CountryService,
    private stateService: StateService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.stateForm = this.fb.group({
      id: this.id,
      name: this.name,
      countryID: this.countryID,
    })

    this.getAllCountries();
  }

  deleteState() {
    let id: number = this.stateForm.get('id')?.value;
    this.stateService.deleteStateByID(id).subscribe({
      next: (res) => {
        this.onReloadStateList();
        this.alertService.showAlert("State has been deleted successfully!", "green");
        this.alertService.closeAlert(3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  saveState() {
    this.stateForm.patchValue({ countryID: this.selectedCountry});
    this.stateService.saveState(this.stateForm.value).subscribe({
      next: (res) => {
        this.onReloadStateList();
        this.alertService.showAndCloseAlertAfterXSecond("State has been saved successfully!", "green", 3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  onSelectState(event: Event) {
    let target = event.target as HTMLInputElement;
    for (let state of this.listStates) {
      if (state.id == target.value) {
        this.stateForm.patchValue(state);
      } 
    }

    this.isChanging = true;
  }

  getListStatesByCountryID(countryID: any) {
    this.stateService.getListStatesByCountryID(countryID).subscribe({
      next: (res) => {
        this.listStates = res;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    });
  }

  onSelectCountry(event: Event) {
    let target = event.target as HTMLInputElement;
    this.selectedCountry = parseInt(target.value);
    this.getListStatesByCountryID(target.value);
  }

  onReloadStateList() {
    this.getListStatesByCountryID(this.selectedCountry);
        const state = {
          id: 0,
          name: '',
          countryID: 0 
        }
        this.stateForm.patchValue(state);
        this.isChanging = false;
  }

  onReloadCountryList() {
    const state = {
      id: 0,
      name: '',
      countryID: 0 
    }
    this.stateForm.patchValue(state);

    this.isChanging = false;
    this.listStates = [];
    this.getAllCountries();
  }
 
  getAllCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (res) => {
        this.listCountries = res;
        this.selectedCountry = res[0].id;
        this.getListStatesByCountryID(res[0].id);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }
}
