import { Routes } from "@angular/router";
import { ProductListComponent } from "../../components/staff/products/product-list/product-list.component";
import { ProductFormComponent } from "../../components/staff/products/product-form/product-form.component";

export const PRODUCT_ROUTES: Routes = [
    {
        path: "",
        title: "Manage Products",
        component: ProductListComponent
    },
    {
        path: "new",
        component: ProductFormComponent
    },
    {
        path: "edit/:id",
        component: ProductFormComponent
    },
    {
        path: "**",
        redirectTo: '/staff/products'
    }
]