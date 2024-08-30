import { NgModule } from '@angular/core';

import { ReservationComponent } from './reservation.component';
import { ManageReservationComponent } from './manage-reservation/manage-reservation.component';
import { ConfirmBookingComponent } from './confirm-booking/confirm-booking.component';
import { BookingSuccessfullyComponent } from './booking-successfully/booking-successfully.component';
import { SharedModule } from 'app/shared/shared.module';
import { ManageReservationFormComponent } from './manage-reservation-form/manage-reservation-form.component';


const components = [
  ReservationComponent,
  ManageReservationComponent,
  ConfirmBookingComponent,
  BookingSuccessfullyComponent,
  ManageReservationFormComponent
];

const modules = [
  SharedModule
];


@NgModule({
  declarations: components,
  exports: [
    ...modules,
    ...components
  ],
  imports: modules
})
export class ReservationModule { }
