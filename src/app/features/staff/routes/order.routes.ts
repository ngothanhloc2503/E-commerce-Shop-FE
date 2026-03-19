import { Routes } from "@angular/router";
import { OrderListComponent } from "../pages/orders/order-list/order-list.component";
import { OrderDetailsComponent } from "../pages/orders/order-details/order-details.component";

export const ORDER_ROUTES: Routes = [
    { path: "", component: OrderListComponent },
    { path: "edit/:id", component: OrderDetailsComponent },
    { path: "**", redirectTo: '/staff/orders' }
]