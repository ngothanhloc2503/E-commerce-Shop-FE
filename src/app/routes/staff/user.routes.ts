import { Routes } from '@angular/router';
import { UserListComponent } from '../../components/staff/users/user-list/user-list.component';
import { UserFormComponent } from '../../components/staff/users/user-form/user-form.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        title: "Manage Users",
        component: UserListComponent
    },
    {
        path: 'new',
        component: UserFormComponent
    },
    {
        path: 'edit/:id',
        component: UserFormComponent
    },
    {
        path: '**',
        redirectTo: '/staff/users'
    },
];