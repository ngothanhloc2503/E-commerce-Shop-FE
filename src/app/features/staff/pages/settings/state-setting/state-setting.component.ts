import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { CountryService } from '../../../services/setting/country.service';
import { StateService } from '../../../services/setting/state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-state-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './state-setting.component.html',
  styleUrl: './state-setting.component.css'
})
export class StateSettingComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private stateService = inject(StateService);
  private alertService = inject(AlertService);
  private countryService = inject(CountryService);
  private fb = inject(FormBuilder);

  // Signals
  isChanging = signal(false);
  listCountries = signal<any[]>([]);
  listStates = signal<any[]>([]);
  selectedCountry = signal<string>("");
  isSubmitting = signal(false);
  isDeleting = signal(false);

  // Form
  stateForm: FormGroup = this.fb.group({
    id: new FormControl(0),
    name: new FormControl('', Validators.required),
    countryID: new FormControl(0),
  });

  constructor() {
    this.getAllCountries();

    effect(() => {
      const country = this.selectedCountry();
      if (country) {
        this.getListStatesByCountryName(country);
      }
    });
  }

  // API
  getAllCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (res) => {
        const data = res.data;

        this.listCountries.set(data);
        if (data.length > 0) {
          this.selectedCountry.set(data[0].name);
        }
      },
    })
  }

  getListStatesByCountryName(countryName: any) {
    this.countryService.getStateByCountryName(countryName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.listStates.set(res.data);
        },
      });
  }

  deleteState() {
    const id = this.stateForm.value.id;

    if (!id) return;

    this.isDeleting.set(true);
    this.stateService.deleteStateByID(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.onReloadStateList();
          this.isDeleting.set(false);
          this.alertService.showAlert("State has been deleted successfully!", "green");
          this.alertService.closeAlert(3000);
        },
        error: () => {
          this.isDeleting.set(false);
        }
      })
  }

  saveState() {
    const country = this.listCountries()
      .find(c => c.name === this.selectedCountry());

    if (!country) return;

    this.stateForm.patchValue({ countryID: country.id });

    this.isSubmitting.set(true);
    this.stateService.saveState(this.stateForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.onReloadStateList();
          this.isSubmitting.set(false);
          this.alertService.showAndCloseAlertAfterXSecond("State has been saved successfully!", "green", 3000);
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      })
  }

  // UI Handlers
  onSelectState(event: Event) {
    const id = +(event.target as HTMLSelectElement).value;

    const state = this.listStates().find(s => s.id == id);
    if (!state) return;

    this.stateForm.patchValue(state);
    this.isChanging.set(true);
  }

  onSelectCountry(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCountry.set(value);
    this.isChanging.set(false);

    this.stateForm.reset({
      id: 0,
      name: '',
      countryID: 0
    });
  }

  onReloadStateList() {
    this.stateForm.reset({
      id: 0,
      name: '',
      countryID: 0
    });

    this.isChanging.set(false);
    this.getListStatesByCountryName(this.selectedCountry());
  }

  onReloadCountryList() {
    this.stateForm.reset({
      id: 0,
      name: '',
      countryID: 0
    });

    this.isChanging.set(false);
    this.listStates.set([]);
    this.getAllCountries();
  }
}
