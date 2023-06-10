import { Component, Input } from '@angular/core';
import { BookingStatus } from '@app/models';

@Component({
  selector: 'app-ticket-status',
  templateUrl: './ticket-status.component.html'
})
export class TicketStatusComponent {

  @Input() status: BookingStatus = BookingStatus.all;
  bookingStatus = BookingStatus;
}
