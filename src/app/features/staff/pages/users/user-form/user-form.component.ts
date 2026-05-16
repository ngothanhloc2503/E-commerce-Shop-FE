import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of, timer } from 'rxjs';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { CountryService } from '../../../../../core/services/country/country.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { UserService } from '../../../services/user/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  // Inject
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  private countryService = inject(CountryService);
  private destroyRef = inject(DestroyRef);

  // Form
  userForm = this.fb.group({
    id: new FormControl<number | null>(null),
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email], [this.uniqueEmail()]),
    password: new FormControl('', [Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]),
    confirmPassword: new FormControl(''),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    birthOfDate: new FormControl('', [Validators.required]),
    addressLine1: new FormControl('', [Validators.required]),
    addressLine2: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    postalCode: new FormControl('', [Validators.required]),
    roles: new FormControl('', [Validators.required]),
    enabled: new FormControl<boolean>(false),
    photo: new FormControl<string | null>(null)
  }, { validators: this.match('password', 'confirmPassword') });

  // Signals
  listRoles = signal<any[]>([]);
  userListRoles = signal<any[]>([]);
  listCountries = signal<any[]>([]);
  listStates = signal<any[]>([]);

  title = signal("Create User");
  userId = 0;
  userPhoto = signal<File | null>(null);
  photoPreviewSrc = signal<any>("https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/default-user.png");
  isSubmitting = signal<boolean>(false);

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => {
        this.userId = s["id"];
        if (this.userId) {
          this.title.set("Edit User(ID: " + this.userId + ")");
          this.getUserById();
        }
        this.titleService.setTitle(this.title());
      });

    this.getAllRoles();
    this.getAllCountries();
  }

  // API
  getAllCountries() {
    this.countryService.getAllCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.listCountries.set(res.data),
      });
  }

  getAllRoles() {
    this.userService.getAllRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.listRoles.set(res.data),
      });
  }

  getUserById() {
    this.userService.getUserById(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;

          this.userForm.patchValue(data);
          if (data.photo) {
            this.photoPreviewSrc.set(data.imagePath);
          }
          this.userListRoles.set(data.roles || []);
          this.getStateByCountryName();
        },
      });
  }

  getStateByCountryName() {
    const countryVal = this.userForm.get('country')?.value;
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

  saveUser() {
    this.isSubmitting.set(true);

    this.userService.saveUser(this.userForm.value, this.userPhoto())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.alertService.showAlert("The user has been saved successfully.", "green")
          this.isSubmitting.set(false);

          setTimeout(() => {
            this.alertService.closeAlert();
            this.router.navigateByUrl("/staff/users");
          }, 3000);
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      })
  }

  // Action
  onSelectPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      input.value = '';
      this.alertService.showAndCloseAlertAfterXSecond("Invalid image file!", "red", 3000);
      return;
    }

    this.userPhoto.set(file);

    const reader = new FileReader();
    reader.onload = () => this.photoPreviewSrc.set(reader.result as string);
    reader.readAsDataURL(file);

    this.userForm.patchValue({ photo: file.name });
  }

  updateRole() {
    let listRolesTemp: any = [];
    document.querySelectorAll('input[name=roles]:checked').forEach((role) => {
      listRolesTemp.push({
        id: role.getAttribute('id'),
        name: role.getAttribute('value')
      });
    });
    this.userForm.patchValue({ roles: listRolesTemp });
  }

  // Helper
  private uniqueEmail() {
    return (ctrl: AbstractControl) => {
      let email = ctrl.value;
      let id = this.userId ? this.userId : 0;
      return (email)
        ? this.userService.isEmailUnique(id, email).pipe(
          map(isUnique => (isUnique) ? null : { emailNotUnique: true })
        )
        : of(null);
    }
  }

  userHasRole(role: any): boolean {
    return this.userListRoles().some(r => r.id == role.id);
  }

  cancel() {
    this.router.navigateByUrl("/staff/users");
  }

  match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) return null;

      const error = control.value === matchingControl.value ? null : { noMatch: true };
      matchingControl.setErrors(error);
      return error;
    }
  }
}
