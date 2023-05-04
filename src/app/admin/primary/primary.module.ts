import { NgModule } from '@angular/core';

import { PrimaryRoutingModule } from './primary-routing.module';
import { PrimaryComponent } from './primary.component';
import { SharedModule } from 'app/shared/shared.module';
import { ReservationModule } from '../reservation/reservation.module';
import { CostDetailsComponent } from './cost-details/cost-details.component';


@NgModule({
  declarations: [
    PrimaryComponent,
    CostDetailsComponent
  ],
  imports: [
    SharedModule,
    ReservationModule,
    PrimaryRoutingModule
  ]
})
export class PrimaryModule { }
