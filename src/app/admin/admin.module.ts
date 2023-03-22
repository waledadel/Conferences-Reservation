import { NgModule } from '@angular/core';
import { NgxEditorModule } from 'ngx-editor';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { LoadingModule } from '../shared/loading/loading.module';
import { UsersComponent } from './users/users.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoomsComponent } from './rooms/rooms.component';
import { ManageRoomsComponent } from './manage-rooms/manage-rooms.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MajorSubscriptionsComponent } from './major-subscriptions/major-subscriptions.component';
import { AllSubscriptionsComponent } from './all-subscriptions/all-subscriptions.component';
import { BusesComponent } from './buses/buses.component';
import { SettingsComponent } from './settings/settings.component';
import { ManageBusComponent } from './manage-bus/manage-bus.component';
import { ManageAddressComponent } from './manage-address/manage-address.component';
import { AddressComponent } from './address/address.component';


@NgModule({
  declarations: [
    AdminComponent,
    UsersComponent,
    DashboardComponent,
    MajorSubscriptionsComponent,
    AllSubscriptionsComponent,
    RoomsComponent,
    ManageRoomsComponent,
    BusesComponent,
    StatisticsComponent,
    SettingsComponent,
    ManageBusComponent,
    ManageAddressComponent,
    AddressComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    LoadingModule,
    NgxEditorModule
  ]
})
export class AdminModule { }
