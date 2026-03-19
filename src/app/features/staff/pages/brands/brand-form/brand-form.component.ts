import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, of, timer } from 'rxjs';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { UtilsService } from '../../../../../shared/utils/utils.service';
import { BrandService } from '../../../services/brand/brand.service';
import { CategoryService } from '../../../services/category/category.service';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, InputComponent],
  templateUrl: './brand-form.component.html',
  styleUrl: './brand-form.component.css'
})
export class BrandFormComponent {
  brandID = 0;
  brandLogo!: File;
  title = "Add New Brand";
  listCategories: any[] = [];
  logoPreviewSrc = 'https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/image_thumbnail.png';

  brandForm!: FormGroup;
  id = new FormControl<number | null>(null);
  logo = new FormControl('');
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ], [this.uniqueName()]);
  listCategoryIDs = new FormControl<any>(null, [
    Validators.required
  ]);

  constructor(
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private alertService: AlertService,
    private brandService: BrandService,
    private titleService: Title,
    private router: Router,
    private fb: FormBuilder,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.brandForm = this.fb.group({
      id: this.id,
      logo: this.logo,
      name: this.name,
      listCategoryIDs: this.listCategoryIDs
    })

    this.activatedRoute.params.subscribe(s => this.brandID = s['id']);
    if (this.brandID) {
      this.title = "Edit Brand(ID: " + this.brandID + ")";
      this.getBrandByID();
    }
    this.titleService.setTitle(this.title);
    this.logo.setValidators(this.brandID != null ? null : Validators.required);
    this.getAllCategories();
  }

  saveBrand() {
    this.brandService.saveBrand(this.brandForm.value, this.brandLogo).subscribe({
      next: (res) => {
        if(res.id != null) {
          this.alertService.showAlert("The category has been saved successfully.", "green")
  
          timer(3000).subscribe(i => {
            this.alertService.isShowAlert = false;
            this.router.navigateByUrl("/staff/brands");
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

  onSelectLogo(event: Event) {
    let target = event.target as HTMLInputElement;
    if (!target.files?.length) {
      return;
    }
    const file = target.files[0];
    if (file) {
      if (file.type == 'image/png' || file.type == 'image/jpg' || file.type == 'image/jpeg') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {
          this.logoPreviewSrc = e.target.result;
        }
        
        this.brandForm.patchValue({logo: file.name});
        this.brandLogo  = file;
      } else {
        target.value = '';
        this.alertService.showAndCloseAlertAfterXSecond("Image should be png, jpg, or jpeg extension!", "red", 3000);
      }
    }
  }

  getBrandByID() {
    this.brandService.getBrandByID(this.brandID).subscribe({
      next: (res: any) => {
        this.brandForm.patchValue(res);
        this.logoPreviewSrc = res.logoImagePath;
      },
      error: (err: any) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.listCategories = res;
      },
      error: (err: any) => {
        this.utilsService.handleError(err);
      }
    })
  }

  uniqueName() {
    return (ctrl: AbstractControl) => {
      let name = ctrl.value;
      let id = this.brandID ? this.brandID : 0;
      return (name)
        ? this.brandService.isNameUnique(id, name).pipe(
            map(isUnique => (isUnique) ? null : {nameNotUnique: true})
          )
        : of(null);
    }
  }

  cancel() {
    this.router.navigateByUrl("/staff/brands");
  }
}
