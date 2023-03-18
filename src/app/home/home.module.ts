import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from 'app/shared/shared.module';
import { InfoComponent } from './info/info.component';
import { TicketComponent } from './ticket/ticket.component';


@NgModule({
  declarations: [
    HomeComponent,
    InfoComponent,
    TicketComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
