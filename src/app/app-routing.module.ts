import { Constants } from '@app/constants';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AutoLoginGuard } from './shared/guard/auto-login.guard';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { AuthGuard } from './shared/guard/auth.guard';

const routes: Routes = [

  {
    path: Constants.Routes.login,
    loadChildren: () => import('./login/login.module').then(mod => mod.LoginModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: Constants.Routes.home,
    loadChildren: () => import('./home/home.module').then(mod => mod.HomeModule),
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
