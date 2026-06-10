import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import { map, of } from 'rxjs';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { BrandService } from '../../../services/brand/brand.service';
import { CategoryService } from '../../../services/category/category.service';
import { ProductService } from '../../../services/product/product.service';
import { DEFAULT_IMAGE, TinyMceApiKey } from '../../../../../core/constants/app.constants';

interface ExtrasImage {
  id?: number,
  name: string;
  preview: string;
  file?: File;
}

interface ProductDetail {
  id?: number;
  name: string;
  value: string;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

@Component({
    selector: 'app-product-form',
    imports: [ReactiveFormsModule, InputComponent, EditorModule],
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  // Inject
  private destroyRef = inject(DestroyRef);
  private titleService = inject(Title);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals
  title = signal('Create Product');
  productId = signal(0);
  listCategories = signal<Category[]>([]);
  listBrands = signal<Brand[]>([]);
  mainImagePreviewSrc = signal(DEFAULT_IMAGE);
  isSubmitting = signal(false);
  extraImageFiles = signal<File[]>([]);

  defaultImage = DEFAULT_IMAGE;
  mainImageFile!: File;
  tinyMceApiKey = TinyMceApiKey;

  // Form
  productForm: FormGroup = this.fb.group({
    id: [0],
    name: ['', {
      validators: [Validators.required, Validators.minLength(2)],
      asyncValidators: [this.uniqueName()],
      updateOn: 'blur'
    }],
    summary: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1024)]],
    description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(4096)]],
    enabled: [true],
    inStock: [true],
    reviewCount: [0],
    averageRating: [0],
    discountPercent: [0],
    price: [0, [Validators.required, Validators.min(0)]],
    cost: [0, [Validators.required, Validators.min(0)]],
    length: [0],
    width: [0],
    height: [0],
    weight: [0],
    category: [null, Validators.required],
    brand: [null, Validators.required],
    mainImage: ['', [this.mainImageRequired(this.mainImageFile, false)]],
    images: this.fb.array([]),
    details: this.fb.array([]),
  });

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = params['id'] ?? 0;
        this.productId.set(Number(id));

        if (this.productId()) {
          this.title.set(`Edit Product (Id: ${this.productId()})`);
          this.getProductById();
        }
        this.titleService.setTitle(this.title());
      });

    this.getAllCategories();
  }

  // Getter
  get details(): FormArray { return this.productForm.get('details') as FormArray; }

  get extrasImages(): FormArray { return this.productForm.get('images') as FormArray; }

  // API
  save() {
    if (this.productForm.invalid) return;

    this.isSubmitting.set(true);

    const mainImage = this.mainImageFile ?? null;
    const extraFiles = this.extraImageFiles();

    const selectedCategory = this.listCategories().find(cat => cat.id == this.productForm.value.category);
    const selectedBrand = this.listBrands().find(brand => brand.id == this.productForm.value.brand);

    const data = {
      ...this.productForm.value,
      category: selectedCategory || null,
      brand: selectedBrand || null,
    };

    this.productService.saveProduct(data, mainImage, extraFiles)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.alertService.showAlert("The product has been saved successfully.", "green");

          setTimeout(() => {
            this.alertService.closeAlert();
            this.router.navigateByUrl("/staff/products");
          }, 3000);
        },
        error: () => { this.isSubmitting.set(false); }
      });
  }

  getProductById() {
    this.productService.getProductById(this.productId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;

          this.productForm.patchValue({
            ...data,
            brand: data.brand.id,
            category: data.category.id
          });

          this.mainImagePreviewSrc.set(data.mainImagePath);
          this.extrasImages.clear();
          (data.images || []).forEach((img: any) => {
            this.extrasImages.push(this.fb.group({
              id: [img.id || null], name: [img.name], preview: [img.imagePath], file: [null]
            }));
          });

          this.details.clear();
          (data.details || []).forEach((d: ProductDetail) => this.addDetail(d));

          this.brandService.getBrandByCategory(data.category.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => this.listBrands.set(res.data || []));
        }
      });
  }

  getAllCategories() {
    this.categoryService.getAllCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.listCategories.set(res.data));
  }

  onCategoryChange() {
    const categoryId = this.productForm.get('category')?.value;
    this.productForm.patchValue({ brand: null });

    this.brandService.getBrandByCategory(categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.listBrands.set(res.data || []));
  }

  // Action
  addDetail(detail: ProductDetail = { name: '', value: '' }) {
    this.details.push(this.fb.group({
      id: [detail.id || null],
      name: [detail.name, Validators.required],
      value: [detail.value, Validators.required]
    }));
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
  }

  addExtraImage(image: ExtrasImage, file: File) {
    this.extraImageFiles.update(files => [...files, file]); // Save file

    this.extrasImages.push(this.fb.group({
      id: [image.id || null],
      name: [image.name],
      preview: [image.preview],
    }));
  }

  removeExtraImage(index: number) {
    this.extrasImages.removeAt(index);
    this.extraImageFiles.update(files => {
      const newFiles = [...files];
      newFiles.splice(index, 1); // Remove file
      return newFiles;
    });
  }

  async onSelectMainImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const base64 = await this.handleImage(file);
      this.mainImagePreviewSrc.set(base64);
      this.mainImageFile = file;
      this.productForm.patchValue({ mainImage: file.name });
      this.productForm.get('mainImage')?.updateValueAndValidity();
    } catch (error) {
      (event.target as HTMLInputElement).value = '';
    }
  }

  async onSelectExtrasImage(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const base64 = await this.handleImage(file);
      this.extraImageFiles.update(files => {
        const newFiles = [...files];
        newFiles[index] = file;
        return newFiles;
      });
      
      this.extrasImages.at(index).patchValue({ preview: base64, name: file.name });
    } catch (error) {
      (event.target as HTMLInputElement).value = '';
    }
  }

  async onSelectNewExtraImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const base64 = await this.handleImage(file);

      this.extrasImages.push(this.fb.group({ 
        name: file.name, 
        preview: base64 
      }));

      this.extraImageFiles.update(files => [...files, file]);

      input.value = ''; 
      
    } catch (error) {
      input.value = '';
    }
  }

  cancel() {
    this.router.navigateByUrl("/staff/products");
  }

  // helpers
  handleImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
        this.alertService.showAndCloseAlertAfterXSecond("Invalid image type", "red", 3000);
        reject("Invalid type");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.alertService.showAndCloseAlertAfterXSecond("File too large", "red", 3000);
        reject("Too large");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = () => reject("Error reading file");
      reader.readAsDataURL(file);
    });
  }

  uniqueName() {
    return (ctrl: AbstractControl) => {
      const name = ctrl.value;
      if (!name) return of(null);
      // Gọi signal this.productId()
      return this.productService.isNameUnique(this.productId(), name).pipe(
        map(isUnique => (isUnique ? null : { nameNotUnique: true }))
      );
    };
  }

  mainImageRequired(mainImageFile: File | undefined, isEditMode: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (isEditMode || mainImageFile) return null;
      if (!control.value) return { mainImageRequired: true };
      return null;
    };
  }
}