import { NgModule } from '@angular/core';

import { BusesRoutingModule } from './buses-routing.module';
import { BusesComponent } from './buses.component';
import { ManageBusComponent } from './manage-bus/manage-bus.component';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
  declarations: [
    BusesComponent,
    ManageBusComponent
  ],
  imports: [
    SharedModule,
    BusesRoutingModule
  ]
})
export class BusesModule { }
