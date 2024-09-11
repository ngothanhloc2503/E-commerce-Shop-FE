import { Component } from '@angular/core';
import { UserService } from '../../../../services/staff/user/user.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { map, of, timer } from 'rxjs';
import { InputComponent } from '../../../input/input.component';
import { AlertComponent } from '../../../alert/alert.component';
import { AlertService } from '../../../../services/alert/alert.service';
import { CountryService } from '../../../../services/country/country.service';
import { StateService } from '../../../../services/state/state.service';
import { UtilsService } from '../../../../services/utils/utils.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, InputComponent, AlertComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  listRoles: any[] = [];
  title = "Create User"
  userListRoles: any[] = [];
  userId = 0;
  userPhoto!: File;
  photoPreviewSrc: any = "https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/default-user.png";
  listCountries: any[] = [];
  listStates: any[] = [];

  userForm!: FormGroup;
  id = new FormControl<number | null>(null);
  email = new FormControl('', [
    Validators.required,
    Validators.email
  ], [this.uniqueEmail()]);
  firstName = new FormControl('', [
    Validators.required, 
    Validators.minLength(2)
  ]);
  lastName = new FormControl('', [
    Validators.required, 
    Validators.minLength(2)
  ]);
  password = new FormControl('', [
    Validators.pattern(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
    ),
  ]);
  confirm_password = new FormControl('');
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(10),
  ]);
  birthOfDate = new FormControl('', [Validators.required]);
  addressLine1 = new FormControl('', [Validators.required]);
  addressLine2 = new FormControl('');
  city = new FormControl('');
  state = new FormControl('', [Validators.required]);
  country = new FormControl('', [Validators.required]);
  postalCode = new FormControl('', [Validators.required]);
  roles = new FormControl('', [Validators.required]);
  enabled = new FormControl<boolean>(false);
  photo = new FormControl<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private userService: UserService,
    private alertService: AlertService,
    private countryService: CountryService,
    private stateService: StateService,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      confirm_password: this.confirm_password,
      phoneNumber: this.phoneNumber,
      birthOfDate: this.birthOfDate,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
      roles: this.roles,
      enabled: this.enabled,
      photo: this.photo
    }, {
      validators: this.match('password', 'confirm_password')
    });

    this.activatedRoute.params.subscribe(s => this.userId = s["id"]);
    if (this.userId) {
      this.title = "Edit User(ID: " + this.userId + ")";
      this.getUserById();
    }
    this.titleService.setTitle(this.title);
    
    this.getAllRoles();
    this.getAllCountries();
  }

  onSelectPhoto(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) {
      return;
    }
    const file = target.files[0];
    if (file) {
      if (file.type == 'image/png' || file.type == 'image/jpg' || file.type == 'image/jpeg') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {
          this.photoPreviewSrc = e.target.result;
        }
        
        this.userForm.patchValue({photo: file.name});
        this.userPhoto  = file;
      } else {
        target.value = '';
        this.alertService.showAndCloseAlertAfterXSecond("Image should be png, jpg, or jpeg extension!", "red", 3000);
      }
    }
  }

  saveUser() {
    this.userService.saveUser(this.userForm.value, this.userPhoto).subscribe({
      next: (res) => {
        if(res.id != null) {
          this.alertService.showAlert("The user has been saved successfully.", "green")
  
          timer(3000).subscribe(i => {
            this.alertService.isShowAlert = false;
            this.router.navigateByUrl("/staff/users");
          })
        } else {
          this.alertService.showAndCloseAlertAfterXSecond("An unexpected error occurred. Please try again later.", "red", 3000);
        }
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  updateRole() {
    let listRolesTemp: any = [];
    document.querySelectorAll('input[name=roles]:checked').forEach((role) => {
      const r = {
        id: role.getAttribute('id'),
        name: role.getAttribute('value')
      };
      listRolesTemp.push(r);
    })
    this.userForm.patchValue({roles: listRolesTemp});
  }

  private uniqueEmail() {
    return (ctrl: AbstractControl) => {
      let email = ctrl.value;
      let id = this.userId ? this.userId : 0;
      return (email)
        ? this.userService.isEmailUnique(id, email).pipe(
            map(isUnique => (isUnique) ? null : {emailNotUnique: true})
          )
        : of(null);
    }
  }

  getStateByCountryName() {
    if (this.country.value != null && this.country.value != undefined && this.country.value != '') {
      this.stateService.getStateByCountryName(this.country.value).subscribe({
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

  getAllRoles() {
    this.userService.getAllRoles().subscribe({
      next: (res) => {
        this.listRoles = res;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getUserById() {
    this.userListRoles = [];
    this.userService.getUserById(this.userId).subscribe({
      next: (res) => {
        this.userForm.patchValue(res);
        if (res.photo != null && res.photo != '') {
          this.photoPreviewSrc = res.imagePath;
        };
        res.roles.forEach((role: any) => {
          this.userListRoles.push(role);
        });
        this.getStateByCountryName();
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  userHasRole(role: any): boolean {
    for (let r of this.userListRoles) {
      if (r.id == role.id) {
        return true;
      }
    }
    return false;
  }

  cancel() {
    this.router.navigateByUrl("/staff/users");
  }

  match(controlName: string, matchingControlName: string) : ValidatorFn {
    return (group: AbstractControl) : ValidationErrors | null  => {
        const control = group.get(controlName);
        const matchingControl = group.get(matchingControlName);

        if (!control || !matchingControl) {
            console.error('Form controls can not be found in the form group.');
            return { controlNotFound: false };
        }

        const error = control.value === matchingControl.value ? null : { noMatch: true };
        
        matchingControl.setErrors(error);

        return error;
    }
  }
}
