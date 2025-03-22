import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Constants } from '@app/constants';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';
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
        loadComponent: () => import('./primary').then(c => c.PrimaryComponent)
      },
      {
        path: Constants.Routes.all,
        loadComponent: () => import('./all-subscription').then(c => c.AllSubscriptionComponent),
      },
      {
        path: Constants.Routes.deletedMembers,
        loadComponent: () => import('./deleted-members').then(c => c.DeletedMembersComponent),
      },
      {
        path: Constants.Routes.rooms,
        loadChildren: () => import('./rooms/rooms.module').then(m => m.RoomsModule),
      },
      {
        path: Constants.Routes.roomType,
        loadChildren: () => import('./room-type/room-type.module').then(m => m.RoomTypeModule),
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
        loadComponent: () => import('./statistics').then(c => c.StatisticsComponent),
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
