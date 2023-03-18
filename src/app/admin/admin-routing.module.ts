import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Constants } from '@app/constants';
import { AllSubscriptionsComponent } from './all-subscriptions/all-subscriptions.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';
import { MajorSubscriptionsComponent } from './major-subscriptions/major-subscriptions.component';
import { RoomsComponent } from './rooms/rooms.component';
import { BusesComponent } from './buses/buses.component';
import { SettingsComponent } from './settings/settings.component';
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
        path: Constants.Routes.major,
        component: MajorSubscriptionsComponent
      },
      {
        path: Constants.Routes.all,
        component: AllSubscriptionsComponent
      },
      {
        path: Constants.Routes.rooms,
        component: RoomsComponent
      },
      {
        path: Constants.Routes.buses,
        component: BusesComponent
      },
      {
        path: Constants.Routes.settings,
        component: SettingsComponent
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
