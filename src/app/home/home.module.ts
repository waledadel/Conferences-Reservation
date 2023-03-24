import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from 'app/shared/shared.module';
import { InfoComponent } from './info/info.component';
import { ReservationModule } from 'app/admin/reservation/reservation.module';


@NgModule({
  declarations: [
    HomeComponent,
    InfoComponent,
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
    ReservationModule
  ]
})
export class HomeModule { }
