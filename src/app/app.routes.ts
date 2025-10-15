import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'unauthorised',
        loadComponent: () => import('./core/auth/components/unauthorised/unauthorised.component').then(m => m.UnauthorisedComponent)
    }
];
