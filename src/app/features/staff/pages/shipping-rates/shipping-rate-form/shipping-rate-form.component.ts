import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { CountryService } from '../../../../../core/services/country/country.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { ShippingRateService } from '../../../services/shipping-rate/shipping-rate.service';

@Component({
  selector: 'app-shipping-rate-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputComponent],
  templateUrl: './shipping-rate-form.component.html',
  styleUrl: './shipping-rate-form.component.css'
})
export class ShippingRateFormComponent {
  shippingRateId = 0;
  title = "Add New Shipping Rate";
  listCountries: any[] = [];
  listStates: any[] = [];

  shippingRateForm!: FormGroup;
  id = new FormControl<number>(0);
  country = new FormControl('', [Validators.required]);
  state = new FormControl('', [Validators.required]);
  rate = new FormControl(0, [Validators.required]);
  days = new FormControl(1, [Validators.required]);
  codSupported = new FormControl(false);
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private countryService: CountryService,
    private shippingRateService: ShippingRateService,
    private titleService: Title,
    private router: Router,
    private fb: FormBuilder,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.shippingRateForm = this.fb.group({
      id: this.id,
      country: this.country,
      state: this.state,
      rate: this.rate,
      days: this.days,
      codSupported: this.codSupported
    })

    this.activatedRoute.params.subscribe(s => this.shippingRateId = s['id']);
    if (this.shippingRateId) {
      this.title = "Edit Shipping Rate(ID: " + this.shippingRateId + ")";
      this.getShippingRateById();
    }
    this.titleService.setTitle(this.title);
    this.getAllCountries();
  }

  saveShippingRate() {
    let data: FormData = new FormData();
    for(let item of Object.keys(this.shippingRateForm.controls)) {
      data.append(item, this.shippingRateForm.get(item)?.value);
    }
    this.shippingRateService.saveShippingRate(data).subscribe({
      next: (res) => {
        this.router.navigateByUrl("/staff/shipping-rates");
        this.alertService.showAndCloseAlertAfterXSecond("Shipping rate has been saved successfully.", "green", 3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getShippingRateById() {
    this.shippingRateService.getShippingRateById(this.shippingRateId).subscribe({
      next: (res) => {
        this.shippingRateForm.patchValue(res);
        this.getStateByCountryName();
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getStateByCountryName() {
    if (this.country.value != null && this.country.value != undefined && this.country.value != '') {
      this.countryService.getStateByCountryName(this.country.value).subscribe({
        next: (res) => {
          this.listStates = res;
        },
        error: (err) => {
          this.utilsService.handleError(err);
        }
      })
    }
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

  cancel() {
    this.router.navigateByUrl("/staff/shipping-rates");
  }
}
