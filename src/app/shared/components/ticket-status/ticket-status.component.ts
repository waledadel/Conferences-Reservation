import { Component, input, signal } from '@angular/core';

import { BookingStatus } from '@app/models';

@Component({
  selector: 'app-ticket-status',
  templateUrl: './ticket-status.component.html',
  standalone: false
})
export class TicketStatusComponent {

  readonly status = input.required<BookingStatus>();
  bookingStatus = signal(BookingStatus).asReadonly();
}
