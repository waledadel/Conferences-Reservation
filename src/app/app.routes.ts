import { Routes } from '@angular/router';

import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { Constants } from '@app/constants';
import { AutoLoginGuard } from './shared/guard/auto-login.guard';
import { AuthGuard } from './shared/guard/auth.guard';

export const routes: Routes = [
  {
    path: Constants.Routes.login,
    loadChildren: () => import('./login/login.module').then(mod => mod.LoginModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: Constants.Routes.reset,
    loadChildren: () => import('./reset-password/reset-password.module').then(mod => mod.ResetPasswordModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: Constants.Routes.home,
    loadComponent: () => import('./home').then(c => c.HomeComponent),
  },
  {
    path: Constants.Routes.secure,
    loadChildren: () => import('./admin/admin.module').then(mod => mod.AdminModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: `/${Constants.Routes.home}`,
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
