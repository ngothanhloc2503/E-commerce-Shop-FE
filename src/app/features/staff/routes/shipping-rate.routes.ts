import { Routes } from "@angular/router";
import { ShippingRateFormComponent } from "../pages/shipping-rates/shipping-rate-form/shipping-rate-form.component";
import { ShippingRateListComponent } from "../pages/shipping-rates/shipping-rate-list/shipping-rate-list.component";

export const SHIPPING_RATE_ROUTES: Routes = [
    { path: "", component: ShippingRateListComponent },
    { path: "new", component: ShippingRateFormComponent },
    { path: "edit/:id", component: ShippingRateFormComponent },
    { path: "**", redirectTo: '/staff/shipping-rates' }
]