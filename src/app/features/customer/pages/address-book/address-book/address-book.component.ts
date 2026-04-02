import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../../../core/services/account/account.service';
import { AddressBookService } from '../../../services/address-book/address-book.service';
import { AlertService } from '../../../../../core/services/alert/alert.service';

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
    private addressBookService: AddressBookService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
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
      }
    })
  }

  deleteAddress(addressId: any) {
    this.addressBookService.deleteAddress(addressId).subscribe({
      next: (res) => {
        this.addressBook = this.addressBook.filter(addr => addr.id !== addressId);
        this.alertService.showAndCloseAlertAfterXSecond("Address has been deleted successfully.", "green", 3000);
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
      }
    })
  }

  getAccountDetails() {
    this.accountService.getAccountDetails().subscribe({
      next: (res) => {
        this.user = res;
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
