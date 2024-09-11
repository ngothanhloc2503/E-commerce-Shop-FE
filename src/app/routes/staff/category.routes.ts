import { Routes } from "@angular/router";
import { CategoryListComponent } from "../../components/staff/categories/category-list/category-list.component";
import { CategoryFormComponent } from "../../components/staff/categories/category-form/category-form.component";

export const CATEGORY_ROUTES: Routes = [
    {
        path: '',
        title: "Manage Categories",
        component: CategoryListComponent
    },
    {
        path: 'new',
        component: CategoryFormComponent
    },
    {
        path: 'edit/:id',
        component: CategoryFormComponent
    },
    {
        path: '**',
        redirectTo: '/staff/categories'
    },
];