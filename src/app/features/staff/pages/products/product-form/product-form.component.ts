import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import { map, of, Subject, takeUntil, timer } from 'rxjs';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { BrandService } from '../../../services/brand/brand.service';
import { CategoryService } from '../../../services/category/category.service';
import { ProductService } from '../../../services/product/product.service';
import { DEFAULT_IMAGE } from '../../../../../constants';

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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, EditorModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  title = 'Create Product';
  productId = 0;

  listCategories: Category[] = [];
  listBrands: Brand[] = [];
  defaultImage = DEFAULT_IMAGE;
  mainImageFile!: File;
  mainImagePreviewSrc = DEFAULT_IMAGE;

  productForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private titleService: Title,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.initForm();

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.productId = params['id'] ?? 0;
        if (this.productId) {
          this.title = `Edit Product (Id: ${this.productId})`;
          this.getProductById();
        }
        this.titleService.setTitle(this.title);
      });

    this.getAllCategories();
  }

  initForm() {
    this.productForm = this.fb.group({
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
      mainImage: ['', Validators.required],
      images: this.fb.array([]),
      details: this.fb.array([]),
    });
  }

  get details(): FormArray {
    return this.productForm.get('details') as FormArray;
  }

  get extrasImages(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  get extrasImagesValue(): ExtrasImage[] {
    return this.extrasImages.value;
  }

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

  addExtraImage(image: ExtrasImage) {
    this.extrasImages.push(this.fb.group({
      id: [image.id || null],
      name: [image.name],
      preview: [image.preview],
      file: [image.file]
    }));
  }

  removeExtraImage(index: number) {
    this.extrasImages.removeAt(index);
  }

  save() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    const mainImage = this.mainImageFile ?? null;
    const extraFiles: File[] = this.extrasImages.controls
      .map(ctrl => ctrl.value.file)
      .filter((f: File) => !!f);

    const selectedCategory = this.listCategories.filter(cat => cat.id == this.productForm.value.category)[0];
    const selectedBrand = this.listBrands.filter(brand => brand.id == this.productForm.value.brand)[0];

    const data = {
      ...this.productForm.value,
      category: selectedCategory,
      brand: selectedBrand,
    };

    this.productService.saveProduct(data, mainImage, extraFiles).subscribe({
      next: res => {
        if (res?.id) {
          this.alertService.showAlert("The product has been saved successfully.", "green");

          timer(2000).subscribe(() => {
            this.alertService.isShowAlert = false;
            this.router.navigateByUrl("/staff/products");
          });
        } else {
          this.alertService.showAndCloseAlertAfterXSecond("An unexpected error occurred.", "red", 3000);
        }
        this.isSubmitting = false;
      },
      error: err => {
        this.isSubmitting = false;
      }
    });
  }

  getProductById() {
    this.productService.getProductById(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.productForm.patchValue({
            ...res,
            brand: res.brand.id,
            category: res.category.id
          });

          // Populate extras images
          this.mainImagePreviewSrc = res.mainImagePath;
          this.extrasImages.clear();

          (res.images || []).forEach((img: any) => {
            this.extrasImages.push(this.fb.group({
              id: [img.id || null],
              name: [img.name],
              preview: [img.imagePath],
              file: [null]
            }));
          });

          // Populate details
          this.details.clear();
          (res.details || []).forEach((d: ProductDetail) => this.addDetail(d));

          if (res.category) {
            this.brandService.getBrandByCategory(res.category.id).subscribe(brands => {
              this.listBrands = brands || [];
            });
          }
        }
      });
  }

  onCategoryChange() {
    const categoryId = this.productForm.get('category')?.value;

    this.productForm.patchValue({ brand: null });

    this.brandService.getBrandByCategory(categoryId)
      .subscribe(brands => this.listBrands = brands || []);
  }

  onSelectMainImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.handleImage(file, base64 => this.mainImagePreviewSrc = base64);
    this.mainImageFile = file;
    this.productForm.patchValue({ mainImage: file.name });
    this.productForm.get('mainImage')?.updateValueAndValidity();
  }

  onSelectExtrasImage(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.handleImage(file, base64 => {
      this.extrasImages.removeAt(index);
      this.extrasImages.push(this.fb.group({
        name: file.name,
        preview: base64,
        file: file
      }));
    });
  }

  onSelectNewExtraImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.handleImage(file, base64 => {
      this.extrasImages.push(this.fb.group({
        name: file.name,
        preview: base64,
        file: file
      }));
    });

    input.value = '';
  }

  handleImage(file: File, callback: (base64: string) => void) {
    if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
      this.alertService.showAndCloseAlertAfterXSecond("Invalid image type", "red", 3000);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.alertService.showAndCloseAlertAfterXSecond("File too large", "red", 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => callback(e.target.result);
    reader.onerror = () => this.alertService.showAndCloseAlertAfterXSecond("Error reading file", "red", 3000);
    reader.readAsDataURL(file);
  }

  uniqueName() {
    return (ctrl: AbstractControl) => {
      const name = ctrl.value;

      if (!name) return of(null);

      // Nếu edit và không đổi tên → skip
      if (this.productId && name === this.productForm.get('name')?.value) {
        return of(null);
      }

      return this.productService.isNameUnique(this.productId, name).pipe(
        map(isUnique => (isUnique ? null : { nameNotUnique: true }))
      );
    };
  }

  cancel() {
    this.router.navigateByUrl("/staff/products");
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() {
    return this.productForm.controls;
  }

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe(res => this.listCategories = res);
  }

  trackByIndex(index: number) {
    return index;
  }
}