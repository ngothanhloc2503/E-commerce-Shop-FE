import { Routes } from "@angular/router";
import { OrderListComponent } from "../../components/staff/orders/order-list/order-list.component";
import { OrderDetailsComponent } from "../../components/staff/orders/order-details/order-details.component";

export const ORDER_ROUTES: Routes = [
    { 
        path: "",
        title: "Manage Orders",
        component: OrderListComponent
    },
    { 
        path: "edit/:id",
        title: "Edit Order",
        component: OrderDetailsComponent
    },
    {
        path: "**",
        redirectTo: '/staff/orders'
    }
]