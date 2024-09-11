import { Routes } from "@angular/router";
import { BrandListComponent } from "../../components/staff/brands/brand-list/brand-list.component";
import { BrandFormComponent } from "../../components/staff/brands/brand-form/brand-form.component";

export const BRAND_ROUTES: Routes = [
    { 
        path: "",
        title: "Manage Brands",
        component: BrandListComponent
    },
    { 
        path: "new",
        component: BrandFormComponent
    },
    { 
        path: "edit/:id",
        component: BrandFormComponent
    },
    {
        path: "**",
        redirectTo: '/staff/brands'
    }
]