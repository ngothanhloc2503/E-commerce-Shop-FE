import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { CountryService } from '../../../../../core/services/country/country.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { AddressBookService } from '../../../services/address-book/address-book.service';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, CommonModule],
  templateUrl: './address-book-form.component.html',
  styleUrl: './address-book-form.component.css'
})
export class AddressBookFormComponent {
  title = "Add New Address";
  addressId = 0;
  redirect = '';
  
  listCountries: any[] = [];
  listStates: any[] = [];

  addressForm!: FormGroup;
  id = new FormControl<number | null>(null);
  firstName = new FormControl('', [
    Validators.required, 
    Validators.minLength(2)
  ]);
  lastName = new FormControl('', [
    Validators.required, 
    Validators.minLength(2)
  ]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(10),
  ]);
  addressLine1 = new FormControl('', [Validators.required]);
  addressLine2 = new FormControl('');
  city = new FormControl('');
  state = new FormControl('', [Validators.required]);
  country = new FormControl('', [Validators.required]);
  postalCode = new FormControl('', [Validators.required]);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private countryService: CountryService,
    private addressBookService: AddressBookService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.addressForm = this.fb.group({
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
    })

    this.activatedRoute.params.subscribe(s => this.addressId = s['id']);
    this.activatedRoute.queryParams.subscribe(p => this.redirect = p['redirect']);
    if (this.addressId) {
      this.title = "Edit Address(ID: " + this.addressId + ")";
      this.getAddressById();
    }
    this.titleService.setTitle(this.title);
    this.getAllCountries();
  }

  saveAddress() {
    this.addressBookService.saveAddressBook(this.addressForm.value).subscribe({
      next: (res) => {
        if (this.redirect) {
          this.router.navigate(["/address-book"], {queryParams: {redirect: "cart"}});
        } else {
          this.router.navigateByUrl("/address-book");
          this.alertService.showAndCloseAlertAfterXSecond("Address has been saved successfully.", "green", 3000);
        }
      },
    })
  }

  getAddressById() {
    this.addressBookService.getAddressById(this.addressId).subscribe({
      next: (res) => {
        this.addressForm.patchValue(res);
        this.getStateByCountryName();
      },
    })
  }

  getStateByCountryName() {
    if (this.country.value != null && this.country.value != undefined && this.country.value != '') {
      this.countryService.getStateByCountryName(this.country.value).subscribe({
        next: (res) => {
          this.listStates = res;
        },
      })
    }
  }

  getAllCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (res) => {
        this.listCountries = res;
      },
    })
  }

  cancel() {
    this.router.navigateByUrl("/address-book");
  }
}
