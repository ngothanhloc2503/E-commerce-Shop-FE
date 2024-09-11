import { Routes } from "@angular/router";
import { HomeComponent } from "../../components/customer/home/home.component";
import { SearchResultComponent } from "../../components/customer/search-result/search-result.component";
import { ProductDetailComponent } from "../../components/customer/product-detail/product-detail.component";
import { CategoryDetailComponent } from "../../components/customer/category-detail/category-detail.component";
import { AddressBookComponent } from "../../components/customer/address-book/address-book.component";
import { AddressBookFormComponent } from "../../components/customer/address-book-form/address-book-form.component";
import { CartComponent } from "../../components/customer/cart/cart.component";
import { CheckoutComponent } from "../../components/customer/checkout/checkout.component";
import { OrderListComponent } from "../../components/customer/orders/order-list/order-list.component";

export const CUSTOMER_ROUTES: Routes = [
    {
        path: '',
        title: "E-commerce Shop",
        component: HomeComponent,
    },
    {
        path: 'home',
        title: "E-commerce Shop",
        component: HomeComponent,
    },
    {
        path: 'search',
        component: SearchResultComponent,
    },
    {
        path: 'products/:alias',
        component: ProductDetailComponent,
    },
    {
        path: 'categories/:name',
        component: CategoryDetailComponent,
    },
    {
        path: 'address-book',
        title: "Address Book",
        component: AddressBookComponent,
    },
    {
        path: 'address-book/new',
        component: AddressBookFormComponent,
    },
    {
        path: 'address-book/edit/:id',
        component: AddressBookFormComponent,
    },
    {
        path: 'cart',
        title: "Cart - E-commerce Shop",
        component: CartComponent,
    },
    {
        path: 'checkout',
        title: "Checkout - E-commerce Shop",
        component: CheckoutComponent,
    },
    {
        path: 'orders',
        title: "Orders - E-commerce Shop",
        component: OrderListComponent,
    },
    {
        path: '**',
        redirectTo: ''
    }
];