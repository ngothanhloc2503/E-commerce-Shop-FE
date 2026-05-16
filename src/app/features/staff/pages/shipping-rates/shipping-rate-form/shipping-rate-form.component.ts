import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { CountryService } from '../../../../../core/services/country/country.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ShippingRateService } from '../../../services/shipping-rate/shipping-rate.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-shipping-rate-form',
    imports: [ReactiveFormsModule, InputComponent],
    templateUrl: './shipping-rate-form.component.html',
    styleUrl: './shipping-rate-form.component.css'
})
export class ShippingRateFormComponent {
  // Inject
  private activatedRoute = inject(ActivatedRoute);
  private alertService = inject(AlertService);
  private countryService = inject(CountryService);
  private shippingRateService = inject(ShippingRateService);
  private titleService = inject(Title);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  // Signals
  shippingRateId = signal(0); 
  title = signal("Add New Shipping Rate");
  listCountries = signal<any[]>([]);
  listStates = signal<any[]>([]);
  isSubmitting = signal(false);

  // Form
  shippingRateForm = inject(FormBuilder).group({
    id: new FormControl<number>(0),
    country: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    rate: new FormControl(0, [Validators.required]),
    days: new FormControl(1, [Validators.required]),
    codSupported: new FormControl(false)
  });

  // Init
  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => {
        const id = s['id'];
        this.shippingRateId.set(Number(id) || 0);
        
        if (this.shippingRateId() > 0) {
          this.title.set("Edit Shipping Rate(ID: " + this.shippingRateId() + ")");
          this.getShippingRateById();
        }
        
        this.titleService.setTitle(this.title());
      });

    this.getAllCountries();
  }

  // API
  saveShippingRate() {
    this.isSubmitting.set(true);

    let data: FormData = new FormData();
    for(let item of Object.keys(this.shippingRateForm.controls)) {
      data.append(item, this.shippingRateForm.get(item)?.value);
    }
    
    this.shippingRateService.saveShippingRate(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigateByUrl("/staff/shipping-rates");
          this.alertService.showAndCloseAlertAfterXSecond("Shipping rate has been saved successfully.", "green", 3000);
        },
        error: () => {
          this.isSubmitting.set(true);
        },
      });
  }

  getShippingRateById() {
    this.shippingRateService.getShippingRateById(this.shippingRateId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.shippingRateForm.patchValue(res.data);
          this.getStateByCountryName();
        },
      });
  }

  getStateByCountryName() {
    const countryVal = this.shippingRateForm.get('country')?.value;
    if (countryVal) {
      this.countryService.getStateByCountryName(countryVal)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => this.listStates.set(res.data),
        });
    } else {
      this.listStates.set([]);
    }
  }

  getAllCountries() {
    this.countryService.getAllCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.listCountries.set(res.data),
      });
  }

  // Action
  cancel() {
    this.router.navigateByUrl("/staff/shipping-rates");
  }
}
