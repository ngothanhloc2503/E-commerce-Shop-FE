import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, of, timer } from 'rxjs';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { CategoryService } from '../../../services/category/category.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, InputComponent],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent {
  // Inject
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private categoryService = inject(CategoryService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  // Signals
  title = signal('Create Category');
  categoryID = signal(0);
  listCategories = signal<any[]>([]);
  imagePreviewSrc = signal('https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/image_thumbnail.png');
  isSubmitting = signal<boolean>(false);

  categoryImage!: File;

  // Form
  categoryForm = inject(FormBuilder).group({
    id: new FormControl<number | null>(null),
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ], [this.uniqueName()]),
    description: new FormControl('', [Validators.required]),
    image: new FormControl<string | null>(null),
    enabled: new FormControl<boolean>(false),
    parentID: new FormControl(0)
  });

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => {
        const id = s["id"];
        this.categoryID.set(Number(id) || 0);

        if (this.categoryID()) {
          this.title.set("Edit Category(ID: " + this.categoryID() + ")");

          this.categoryForm.get('image')?.clearValidators();
          this.categoryForm.get('image')?.updateValueAndValidity();

          this.getCategoryById();
        } else {
          this.categoryForm.get('image')?.setValidators([Validators.required]);
          this.categoryForm.get('image')?.updateValueAndValidity();
        }

        this.titleService.setTitle(this.title());

        this.getAllCategories();
      });
  }

  // API
  getAllCategories() {
    this.categoryService.getAllCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;

          const filteredCategories = data.filter((cat: any) => cat.id != this.categoryID());
          this.listCategories.set(filteredCategories);
        },
      });
  }

  getCategoryById() {
    this.categoryService.getCategoryById(this.categoryID())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;

          this.categoryForm.patchValue(data);
          if (data.image != null && data.image != '') {
            this.imagePreviewSrc.set(data.imagePath);
          }
        },
      });
  }

  saveCategory() {
    this.isSubmitting.set(true);

    this.categoryService.saveCategory(this.categoryForm.value, this.categoryImage).subscribe({
      next: () => {
        this.alertService.showAlert("The category has been saved successfully.", "green");
        this.isSubmitting.set(false);

        setTimeout(() => {
          this.alertService.closeAlert();
          this.router.navigateByUrl("/staff/categories");
        }, 3000);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    })
  }

  // Action
  onSelectImage(event: Event) {
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
      this.imagePreviewSrc.set(e.target.result);
    }

    this.categoryForm.patchValue({ image: file.name });
    this.categoryImage = file;
  }

  cancel() {
    this.router.navigateByUrl("/staff/categories");
  }

  // Validator
  private uniqueName() {
    return (ctrl: AbstractControl) => {
      const name = ctrl.value;
      const id = this.categoryID() ? this.categoryID() : 0;

      return (name)
        ? this.categoryService.isNameUnique(id, name).pipe(
          map(isUnique => isUnique ? null : { nameNotUnique: true })
        )
        : of(null);
    };
  }
}
