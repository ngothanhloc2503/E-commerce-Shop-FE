import { Routes } from "@angular/router";
import { BrandListComponent } from "../pages/brands/brand-list/brand-list.component";
import { BrandFormComponent } from "../pages/brands/brand-form/brand-form.component";

export const BRAND_ROUTES: Routes = [
    { path: "", component: BrandListComponent, title: "Manage Brands" },
    { path: "new", component: BrandFormComponent },
    { path: "edit/:id", component: BrandFormComponent },
    { path: "**", redirectTo: '/staff/brands' }
]