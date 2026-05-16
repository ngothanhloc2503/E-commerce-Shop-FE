
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, of, timer } from 'rxjs';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { BrandService } from '../../../services/brand/brand.service';
import { CategoryService } from '../../../services/category/category.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-brand-form',
    imports: [ReactiveFormsModule, RouterModule, InputComponent],
    templateUrl: './brand-form.component.html',
    styleUrl: './brand-form.component.css'
})
export class BrandFormComponent {
  // Inject
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private brandService = inject(BrandService);
  private alertService = inject(AlertService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);

  // Signals
  brandId = signal(0);
  title = signal("Add New Brand");
  listCategories = signal<any[]>([]);
  logoPreviewSrc = signal('https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/image_thumbnail.png');
  isSubmitting = signal<boolean>(false);

  brandLogo!: File;

  // Form
  brandForm = inject(FormBuilder).group({
    id: new FormControl<number | null>(null),
    logo: new FormControl(''),
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ], [this.uniqueName()]),
    listCategoryIDs: new FormControl<any>(null, [Validators.required])
  });

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => {
        const id = s['id'];
        this.brandId.set(Number(id) || 0);

        if (this.brandId()) {
          this.title.set("Edit Brand(ID: " + this.brandId() + ")");

          this.brandForm.get('logo')?.clearValidators();
          this.brandForm.get('logo')?.updateValueAndValidity();

          this.getBrandByID();
        } else {
          this.brandForm.get('logo')?.setValidators(Validators.required);
          this.brandForm.get('logo')?.updateValueAndValidity();
        }
      });

    this.titleService.setTitle(this.title());
    this.getAllCategories();
  }

  // API
  getBrandByID() {
    this.brandService.getBrandByID(this.brandId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.brandForm.patchValue(res.data);
          this.logoPreviewSrc.set(res.logoImagePath);
        },
      });
  }

  getAllCategories() {
    this.categoryService.getAllCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.listCategories.set(res.data),
      });
  }

  saveBrand() {
    this.isSubmitting.set(true);

    this.brandService.saveBrand(this.brandForm.value, this.brandLogo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.alertService.showAlert("The brand has been saved successfully.", "green");
          this.isSubmitting.set(false);

          setTimeout(() => {
            this.alertService.closeAlert();
            this.router.navigateByUrl("/staff/brands");
          }, 3000);
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
  }

  // Action
  onSelectLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      input.value = '';
      this.alertService.showAndCloseAlertAfterXSecond("Invalid image file!", "red", 3000);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: any) => {
      this.logoPreviewSrc.set(e.target.result);
    }

    this.brandForm.patchValue({ logo: file.name });
    this.brandLogo = file;
  }

  cancel() {
    this.router.navigateByUrl("/staff/brands");
  }

  // Validator custom
  uniqueName() {
    return (ctrl: AbstractControl) => {
      const name = ctrl.value;
      const id = this.brandId() ? this.brandId() : 0;

      return (name)
        ? this.brandService.isNameUnique(id, name).pipe(
          map(isUnique => isUnique ? null : { nameNotUnique: true })
        )
        : of(null);
    };
  }
}
