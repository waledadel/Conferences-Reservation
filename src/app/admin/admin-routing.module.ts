import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Constants } from '@app/constants';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: Constants.Routes.dashboard,
        component: DashboardComponent
      },
      {
        path: Constants.Routes.primary,
        loadChildren: () => import('./primary/primary.module').then(mod => mod.PrimaryModule),
      },
      {
        path: Constants.Routes.all,
        loadChildren: () => import('./all-subscription/all-subscription.module').then(mod => mod.AllSubscriptionModule),
      },
      {
        path: Constants.Routes.rooms,
        loadChildren: () => import('./rooms/rooms.module').then(mod => mod.RoomsModule),
      },
      {
        path: Constants.Routes.buses,
        loadChildren: () => import('./buses/buses.module').then(mod => mod.BusesModule),
      },
      {
        path: Constants.Routes.address,
        loadChildren: () => import('./address/address.module').then(mod => mod.AddressModule),
      },
      {
        path: Constants.Routes.settings,
        loadChildren: () => import('./settings/settings.module').then(mod => mod.SettingsModule),
      },
      {
        path: Constants.Routes.statistics,
        component: StatisticsComponent
      },
      {
        path: Constants.Routes.users,
        component: UsersComponent
      },
      {
        path: '',
        redirectTo: `/${Constants.Routes.secure}/${Constants.Routes.dashboard}`,
        pathMatch: 'full'
      }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
