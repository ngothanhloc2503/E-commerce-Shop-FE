import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../../../core/services/account/account.service';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { AddressBookService } from '../../../services/address-book/address-book.service';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './address-book.component.html',
  styleUrl: './address-book.component.css'
})
export class AddressBookComponent {
  user: any = {};
  addressBook: any[] = [];
  userPrimaryAddressAsDefault: boolean = true;
  redirect = '';

  constructor(
    private accountService: AccountService,
    private alertService: AlertService,
    private addressBookService: AddressBookService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(p => this.redirect = p['redirect']);
    this.getAccountDetails();
    this.getAddressBookDetails();
  }

  setDefault(addressId: any) {
    this.addressBookService.setDefault(addressId).subscribe({
      next: (res) => {
        if (this.redirect) {
          this.router.navigateByUrl('/cart');
        } else {
          this.getAddressBookDetails();
        }
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  editAddressWithId(addressId: string) {
    if (this.redirect) {
      this.router.navigate(["/address-book/edit/" + addressId], {queryParams: {redirect: "address-book"}});
    } else {
      this.router.navigateByUrl("/address-book/edit/" + addressId);
    }
  }

  getAddressBookDetails() {
    this.addressBookService.getAddressBook().subscribe({
      next: (res) => {
        this.addressBook = res.addressBook;
        this.userPrimaryAddressAsDefault = res.primaryAddressAsDefault;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getAccountDetails() {
    this.accountService.getAccountDetails().subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      },
    })
  }

  getAddress(info: any): string {
    let address = info.firstName;

    if (info.lastName != null && info.lastName.length) address += " " + info.lastName;

    if (info.addressLine1.length) address += ", " + info.addressLine1;

    if (info.addressLine2 != null && info.addressLine2.length) address += ", " + info.addressLine2;

    if (info.city.length) address += ", " + info.city;

    if (info.state != null && info.state.length) address += ", " + info.state;

    address += ", " + info.country;

    if (info.postalCode.length) address += ". Postal Code: " + info.postalCode;
    if (info.phoneNumber.length) address += ". Phone Number: " + info.phoneNumber;

    return address;
  }
}
