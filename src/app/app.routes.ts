import { Routes } from '@angular/router';
import { PasswordRecoveryComponent } from './core/auth/components/password-recovery/password-recovery.component';

export const routes: Routes = [
    {
        path: 'unauthorised',
        loadComponent: () => import('./core/auth/components/unauthorised/unauthorised.component').then(m => m.UnauthorisedComponent)
    },
    {
        path: 'password-recovery/:token',
        loadComponent: () => import('./core/auth/components/unauthorised/unauthorised.component').then(m => m.UnauthorisedComponent)
    }
];
