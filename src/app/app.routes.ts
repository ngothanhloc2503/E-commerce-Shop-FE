import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { staffGuard } from './guards/staff.guard';
import { customerGuard } from './guards/customer.guard';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { signedInGuard } from './guards/signed-in.guard';
import { VerifyAccountComponent } from './components/verify-account/verify-account.component';
import { notSignedInGuard } from './guards/not-signed-in.guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

export const routes: Routes = [
    {
        path: 'sign-in',
        title: "Sign In",
        component: SignInComponent
    },
    {
        path: 'sign-up',
        title: "Sign Up",
        component: SignUpComponent
    },
    {
        path: 'forgot-password',
        title: "Forgot Password",
        component: ForgotPasswordComponent
    },
    {
        path: 'reset-password',
        title: "Reset Password",
        component: ResetPasswordComponent
    },
    {
        path: 'verify',
        title: "Verify Account",
        component: VerifyAccountComponent,
        canMatch: [notSignedInGuard]
    },
    {
        path: 'account',
        title: "Account",
        component: AccountDetailComponent,
        canMatch: [signedInGuard]
    },
    {
        path: 'staff', 
        loadChildren: () => import('./routes/staff/staff.routes').then(r => r.STAFF_ROUTES),
        canMatch: [staffGuard]
    },
    {
        path: '', 
        loadChildren: () => import('./routes/customer/customer.routes').then(r => r.CUSTOMER_ROUTES),
        canMatch: [customerGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
