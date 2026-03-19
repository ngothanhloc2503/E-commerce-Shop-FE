import { Routes } from '@angular/router';
import { staffGuard } from './core/guards/staff.guard';
import { customerGuard } from './core/guards/customer.guard';
import { AccountDetailComponent } from './shared/components/account-detail/account-detail.component';
import { signedInGuard } from './core/guards/signed-in.guard';
import { notSignedInGuard } from './core/guards/not-signed-in.guard';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { SignUpComponent } from './features/auth/pages/sign-up/sign-up.component';
import { SignInComponent } from './features/auth/pages/sign-in/sign-in.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { VerifyAccountComponent } from './features/auth/pages/verify-account/verify-account.component';

export const routes: Routes = [
    { path: 'sign-in',component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { 
        path: 'verify',
        title: "Verify Account",
        component: VerifyAccountComponent,
        canMatch: [notSignedInGuard]
    },
    {
        path: 'account',
        component: AccountDetailComponent,
        canMatch: [signedInGuard]
    },
    {
        path: 'staff', 
        loadChildren: () => import('./features/staff/routes/staff.routes').then(r => r.STAFF_ROUTES),
        canMatch: [staffGuard]
    },
    {
        path: '', 
        loadChildren: () => import('./features/customer/routes/customer.routes').then(r => r.CUSTOMER_ROUTES),
        canMatch: [customerGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
