import { NgModule } from '@angular/core';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { LoadingModule } from '../shared/components/loading/loading.module';
import { UsersComponent } from './users/users.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';


@NgModule({
  declarations: [
    AdminComponent,
    UsersComponent,
    DashboardComponent,
    StatisticsComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    LoadingModule,
    MatListModule,
    MatToolbarModule,
    MatExpansionModule,
    MatSidenavModule
  ]
})
export class AdminModule { }
