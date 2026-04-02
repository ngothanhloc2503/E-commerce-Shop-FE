import { Routes } from "@angular/router";
import { HomeComponent } from "../pages/home/home.component";
import { SearchResultComponent } from "../pages/search-result/search-result.component";
import { ProductDetailComponent } from "../pages/product-detail/product-detail.component";
import { CategoryDetailComponent } from "../pages/category-detail/category-detail.component";
import { AddressBookComponent } from "../pages/address-book/address-book/address-book.component";
import { AddressBookFormComponent } from "../pages/address-book/address-book-form/address-book-form.component";
import { CartComponent } from "../pages/cart/cart.component";
import { CheckoutComponent } from "../pages/checkout/checkout.component";
import { OrderListComponent } from "../pages/orders/order-list/order-list.component";
import { signedInGuard } from "../../../core/guards/signed-in.guard";

export const CUSTOMER_ROUTES: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'search', component: SearchResultComponent },
    { path: 'products/:alias', component: ProductDetailComponent },
    { path: 'categories/:name', component: CategoryDetailComponent },
    { path: 'address-book', component: AddressBookComponent, canMatch: [signedInGuard] },
    { path: 'address-book/new', component: AddressBookFormComponent, canMatch: [signedInGuard] },
    { path: 'address-book/edit/:id', component: AddressBookFormComponent, canMatch: [signedInGuard] },
    { path: 'cart', component: CartComponent },
    { path: 'checkout', component: CheckoutComponent, canMatch: [signedInGuard] },
    { path: 'orders', component: OrderListComponent, canMatch: [signedInGuard] },
    { path: '**', redirectTo: '' }
];