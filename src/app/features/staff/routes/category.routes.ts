import { Routes } from "@angular/router";
import { CategoryListComponent } from "../pages/categories/category-list/category-list.component";
import { CategoryFormComponent } from "../pages/categories/category-form/category-form.component";

export const CATEGORY_ROUTES: Routes = [
    { path: '', component: CategoryListComponent },
    { path: 'new', component: CategoryFormComponent },
    { path: 'edit/:id', component: CategoryFormComponent },
    { path: '**', redirectTo: '/staff/categories' },
];