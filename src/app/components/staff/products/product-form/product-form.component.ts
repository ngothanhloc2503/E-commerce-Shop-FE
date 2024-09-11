import { Component, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/staff/product/product.service';
import { AlertService } from '../../../../services/alert/alert.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../input/input.component';
import { CategoryService } from '../../../../services/staff/category/category.service';
import { BrandService } from '../../../../services/staff/brand/brand.service';
import { EditorModule } from '@tinymce/tinymce-angular';
import { map, of, timer } from 'rxjs';
import { UtilsService } from '../../../../services/utils/utils.service';

interface ExtrasImageFile {
  id: number,
  file: File,
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, FormsModule, EditorModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  title = 'Create Product';
  productID = 0;
  listCategories: any[] = [];
  listBrands: any[] = [];
  listExtrasImages: any[] = [];
  lastExtrasImageID = 0;
  listProductDetails: any[] = [];
  mainImageFile!: File;
  mainImagePreviewSrc = 'https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/image_thumbnail.png';
  defaultImage = 'https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/image_thumbnail.png';
  listExtrasImageFile: ExtrasImageFile[] = [];

  newDetail = {
    id: 0,
    name: '',
    value: '',
  }

  productForm!: FormGroup;
  id = new FormControl(0);
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ], [this.uniqueName()]);
  summary = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(1024)
  ]);
  description = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(4096)
  ]);
  enabled = new FormControl(true);
  inStock = new FormControl(true);
  reviewCount = new FormControl(0);
  averageRating = new FormControl(0);
  discountPercent = new FormControl(0);
  price = new FormControl(0);
  cost = new FormControl(0);
  length = new FormControl(0);
  width = new FormControl(0);
  height = new FormControl(0);
  weight = new FormControl(0);
  createdTime = new FormControl('');
  updatedTime = new FormControl('');
  category = new FormControl<any>(null);
  brand = new FormControl<any>(null);
  mainImage  = new FormControl('');
  images = new FormControl<any>(null);
  details = new FormControl<any>(null);

  constructor(
    private titleService: Title,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private router: Router,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(s => this.productID = s['id']);
    if (this.productID) {
      this.title = "Edit Product(ID: " + this.productID + ")";
      this.getProductByID();
    }
    this.titleService.setTitle(this.title);

    this.productForm = this.fb.group({
      id: this.id,
      name: this.name,
      description: this.description,
      summary: this.summary,
      enabled: this.enabled,
      inStock: this.inStock,
      reviewCount: this.reviewCount,
      averageRating: this.averageRating,
      discountPercent: this.discountPercent,
      price: this.price,
      cost: this.cost,
      length: this.length,
      width: this.width,
      height: this.height,
      weight: this.weight,
      createdTime: this.createdTime,
      updatedTime: this.updatedTime,
      category: this.category,
      brand: this.brand,
      mainImage: this.mainImage,
      images: this.images,
      details: this.details,
    })
    this.category.setValidators(this.productID ? null : Validators.required);
    this.brand.setValidators(this.productID ? null : Validators.required);
    this.mainImage.setValidators(this.productID ? null : Validators.required);
    
    this.getAllCategories();
  }

  save() {
    this.listProductDetails.filter(detail => (detail.name != '' && detail.value != ''));
    this.productForm.patchValue({details: this.listProductDetails});

    this.productForm.patchValue({images: this.listExtrasImages});

    let listExtrasImageFile: File[] = this.listExtrasImageFile.map(item => item.file);
    
    this.productService.saveProduct(this.productForm.value, this.mainImageFile, listExtrasImageFile).subscribe({
      next: (res) => {
        if(res.id != null) {
          this.alertService.showAlert("The product has been saved successfully.", "green")
  
          timer(3000).subscribe(i => {
            this.alertService.isShowAlert = false;
            this.router.navigateByUrl("/staff/products");
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

  getProductByID() {
    this.productService.getProductByID(this.productID).subscribe({
      next: (res) => {
        this.productForm.patchValue(res);
        this.listExtrasImages = res.images;
        this.listProductDetails = res.details;
        this.mainImagePreviewSrc = res.mainImagePath;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  onCategoryChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.brandService.getBrandByCategory(Number(target.value)).subscribe({
      next: (res) => {
        if (res.length > 0) {
          this.listBrands = res;
        } else {
          this.alertService.showAndCloseAlertAfterXSecond("Could not find any brand with category has ID: " + target.value, "red", 3000);
        }
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  addNewDetail() {
    if (this.newDetail.name != '' && this.newDetail.value != '') {
      this.newDetail.id = this.listProductDetails.length == 0 ? 0 : Math.max(...this.listProductDetails.map(p => p.id)) + 1;
      this.listProductDetails.push(this.newDetail);
      this.newDetail = {
        id: 0,
        name: '',
        value: '',
      }
    }
  }

  onSelectExtrasImage(event: Event, extraID: number) {
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
          this.listExtrasImages.forEach(image => {
            if (image.id === extraID) {
              image.imagePath = e.target.result
              image.name = file.name;
            }
          });
          this.listExtrasImageFile.forEach(f => {
            if (f.id === extraID) {
              f.file = file;
            }
          })
        }
      } else {
        target.value = '';
        this.alertService.showAndCloseAlertAfterXSecond("Image should be png, jpg, or jpeg extension!", "red", 3000);
      }
    }
  }

  onSelectNewExtraImage(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) {
      return;
    }
    const file = target.files[0];
    if (file) {
      if (file.type == 'image/png' || file.type == 'image/jpg' || file.type == 'image/jpeg') {
         this.lastExtrasImageID = this.listExtrasImages.length == 0 ? 0 : Math.max(...this.listExtrasImages.map(e => e.id)) + 1;
        let extraImage = {
          id: this.lastExtrasImageID,
          name: '',
          imagePath: ''
        }
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {
          extraImage.imagePath = e.target.result;
        }
        
        this.listExtrasImageFile.push({
          id: this.lastExtrasImageID,
          file: file,
        })

        extraImage.name = file.name;
        this.listExtrasImages.push(extraImage);
        target.value = '';
      } else {
        target.value = '';
        this.alertService.showAndCloseAlertAfterXSecond("Image should be png, jpg, or jpeg extension!", "red", 3000);
      }
    }
  }

  removeDetail(detailID: number) {
    this.listProductDetails = this.listProductDetails.filter((detail) => detail.id !== detailID);
    // this.elementRef.nativeElement.querySelector("#detail_" + detailID).remove();
  }

  removeExtraImage(extraID: number) {
    this.listExtrasImages = this.listExtrasImages.filter((extra) => extra.id !== extraID);
    this.listExtrasImageFile = this.listExtrasImageFile.filter((file) => file.id !== extraID);
    
    // this.elementRef.nativeElement.querySelector("#extra_image_" + extraID).remove();
  }

  onSelectMainImage(event: Event) {
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
          this.mainImagePreviewSrc = e.target.result;
        }
        
        this.productForm.patchValue({mainImage: file.name});
        this.mainImageFile  = file;
      } else {
        target.value = '';
        this.alertService.showAndCloseAlertAfterXSecond("Image should be png, jpg, or jpeg extension!", "red", 3000);
      }
    }
  }

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.listCategories = res;
      },
      error: (err: any) => {
        this.alertService.showAlert("An unexpected error occurred. Please try again later.", "red");
        this.alertService.closeAlert(3000);
      }
    })
  }

  uniqueName() {
    return (ctrl: AbstractControl) => {
      let name = ctrl.value;
      let id = this.productID ? this.productID : 0;
      return (name)
        ? this.productService.isNameUnique(id, name).pipe(
            map(isUnique => (isUnique) ? null : {nameNotUnique: true})
          )
        : of(null);
    }
  }

  cancel() {
    this.router.navigateByUrl("/staff/products")
  }
}
