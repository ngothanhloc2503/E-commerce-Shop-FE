import { Routes } from '@angular/router';
import { UserListComponent } from '../pages/users/user-list/user-list.component';
import { UserFormComponent } from '../pages/users/user-form/user-form.component';

export const USER_ROUTES: Routes = [
    { path: '', component: UserListComponent },
    { path: 'new', component: UserFormComponent },
    { path: 'edit/:id', component: UserFormComponent },
    { path: '**', redirectTo: '/staff/users' },
];