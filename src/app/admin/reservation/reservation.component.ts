import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ReservationModel } from './reservation.models';
import { BookingType, ITicket } from '@app/models';


@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {


  @Input() canManageReservation = false;
  @Input() enableWaitingList = false;
  @Input() reservationData: Array<ITicket> = [];
  @Input() type: BookingType = BookingType.individual;
  @Input() fireSaveAction = false;
  @Output() showForm = new EventEmitter<boolean>(false);
  @Output() closeModal = new EventEmitter<boolean>(false);
  model: ReservationModel;

  constructor() {
    this.model = new ReservationModel();
  }

  ngOnInit(): void {
  }
}
