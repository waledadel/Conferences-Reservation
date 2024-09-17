import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ReservationModel } from './reservation.models';
import { BookingType, ITicket } from '@app/models';
import { RoomType } from 'app/shared/models/ticket';


@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html'
})
export class ReservationComponent {

  @Input() isAdmin = false;
  @Input() enableWaitingList = false;
  @Input() isEditMode = false;
  @Input() roomType: RoomType = RoomType.single;
  @Input() reservationData: Array<ITicket> = [];
  @Input() type: BookingType = BookingType.individual;
  @Input() set selectedRoomTab(val: number) {
    this.model.selectedRoomTab = val;
  }
  @Output() showForm = new EventEmitter<boolean>(false);
  @Output() closeModal = new EventEmitter<boolean>(false);
  model: ReservationModel;

  constructor() {
    this.model = new ReservationModel();
  }
}
