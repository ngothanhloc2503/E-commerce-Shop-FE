import { Routes } from "@angular/router";
import { ShippingRateFormComponent } from "../../components/staff/shipping-rates/shipping-rate-form/shipping-rate-form.component";
import { ShippingRateListComponent } from "../../components/staff/shipping-rates/shipping-rate-list/shipping-rate-list.component";

export const SHIPPING_RATE_ROUTES: Routes = [
    {
        path: "",
        title: "Manage Shipping Rates",
        component: ShippingRateListComponent,
    },
    {
        path: "new",
        component: ShippingRateFormComponent
    },
    {
        path: "edit/:id",
        component: ShippingRateFormComponent
    },
    {
        path: "**",
        redirectTo: '/staff/shipping-rates'
    }
]