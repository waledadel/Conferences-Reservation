import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { InfoComponent } from './info/info.component';
import { ReservationModule } from 'app/admin/reservation/reservation.module';


@NgModule({
  declarations: [
    HomeComponent,
    InfoComponent
  ],
  imports: [
    MatTabsModule,
    MatToolbarModule,
    HomeRoutingModule,
    ReservationModule
  ]
})
export class HomeModule { }
