import { Component } from '@angular/core';
import { CategoryService } from '../../../../services/staff/category/category.service';
import { AlertService } from '../../../../services/alert/alert.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../input/input.component';
import { Title } from '@angular/platform-browser';
import { map, of, timer } from 'rxjs';
import { UtilsService } from '../../../../services/utils/utils.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent {
  title: string = 'Create Category';
  categoryID = 0;
  listCategories: any[] = [];
  categoryImage!: File;
  imagePreviewSrc = 'https://ecommerce-bucket-hcmus.s3.ap-southeast-1.amazonaws.com/images/image_thumbnail.png';

  categoryForm!: FormGroup;
  id = new FormControl<number | null>(null);
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ], [this.uniqueName()]);
  description = new FormControl('', [Validators.required]);
  image = new FormControl<string | null>(null);
  enabled = new FormControl<boolean>(false);
  parentID = new FormControl(0);
  
  constructor(
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private router: Router,
    private utilsService: UtilsService,
  ) {

  }

  ngOnInit() {
    this.categoryForm = this.fb.group({
      id: this.id,
      name: this.name,
      description: this.description,
      image: this.image,
      enabled: this.enabled,
      parentID: this.parentID
    })
    
    this.activatedRoute.params.subscribe(s => this.categoryID = s["id"]);
    if (this.categoryID) {
      this.title = "Edit Category(ID: " + this.categoryID + ")";
      this.getCategoryById();
    }

    this.image.setValidators(this.categoryID != null ? null : [Validators.required])

    this.titleService.setTitle(this.title);
    
    this.getAllCategories();
  }

  saveCategory() {
    this.categoryService.saveCategory(this.categoryForm.value, this.categoryImage).subscribe({
      next: (res) => {
        if(res.id != null) {
          this.alertService.showAlert("The category has been saved successfully.", "green")
  
          timer(3000).subscribe(i => {
            this.alertService.isShowAlert = false;
            this.router.navigateByUrl("/staff/categories");
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

  onSelectImage(event: Event) {
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
          this.imagePreviewSrc = e.target.result;
        }
        
        this.categoryForm.patchValue({image: file.name});
        this.categoryImage = file;
      } else {
        target.value = '';
        this.alertService.showAndCloseAlertAfterXSecond("Image should be png, jpg, or jpeg extension!", "red", 3000);
      }
    }
  }

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.listCategories = res.filter((cat: any) => cat.id != this.categoryID);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  getCategoryById() {
    this.categoryService.getCategoryById(this.categoryID).subscribe({
      next: (res) => {
        this.categoryForm.patchValue(res);
        if (res.image != null && res.image != '') {
          this.imagePreviewSrc = res.imagePath;
        };
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  private uniqueName() {
    return (ctrl: AbstractControl) => {
      let name = ctrl.value;
      let id = this.categoryID ? this.categoryID : 0;
      return (name)
        ? this.categoryService.isNameUnique(id, name).pipe(
            map(isUnique => (isUnique) ? null : {nameNotUnique: true})
          )
        : of(null);
    }
  }

  cancel() {
    this.router.navigateByUrl("/staff/categories");
  }
}
