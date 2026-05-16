import { Routes } from "@angular/router";
import { ProductListComponent } from "../pages/products/product-list/product-list.component";
import { ProductFormComponent } from "../pages/products/product-form/product-form.component";

export const PRODUCT_ROUTES: Routes = [
    { path: "", component: ProductListComponent, title: "Manage Products" },
    { path: "new", component: ProductFormComponent },
    { path: "edit/:id", component: ProductFormComponent },
    { path: "**", redirectTo: '/staff/products' }
]