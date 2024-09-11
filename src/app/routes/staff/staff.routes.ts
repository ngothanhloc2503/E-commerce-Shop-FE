import { Routes } from "@angular/router";
import { SettingsComponent } from "../../components/staff/settings/settings/settings.component";
import { DashboardComponent } from "../../components/staff/dashboard/dashboard.component";


export const STAFF_ROUTES: Routes = [
    {
        path: 'users', 
        loadChildren: () => import('./user.routes').then(r => r.USER_ROUTES),
    },
    {
        path: 'categories', 
        loadChildren: () => import('./category.routes').then(r => r.CATEGORY_ROUTES),
    },
    {
        path: 'brands',
        loadChildren: () => import('./brand.routes').then(r => r.BRAND_ROUTES),
    },
    {
        path: 'products',
        loadChildren: () => import('./product.routes').then(r => r.PRODUCT_ROUTES),
    },
    {
        path: 'shipping-rates',
        loadChildren: () => import('./shipping-rate.routes').then(r => r.SHIPPING_RATE_ROUTES),
    },
    {
        path: 'orders',
        loadChildren: () => import('./order.routes').then(r => r.ORDER_ROUTES),
    },
    {
        path: 'settings',
        title: "Manage Settings",
        component: SettingsComponent
    },
    {
        path: '',
        title: "Manage E-commerce Shop",
        component: DashboardComponent
    },
    {
        path: '**',
        redirectTo: '/staff'
    },
];