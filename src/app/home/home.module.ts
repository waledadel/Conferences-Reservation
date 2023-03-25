import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { InfoComponent } from './info/info.component';
import { ReservationModule } from 'app/admin/reservation/reservation.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';


@NgModule({
  declarations: [
    HomeComponent,
    InfoComponent,
  ],
  imports: [
    MatTabsModule,
    MatToolbarModule,
    HomeRoutingModule,
    ReservationModule
  ]
})
export class HomeModule { }
