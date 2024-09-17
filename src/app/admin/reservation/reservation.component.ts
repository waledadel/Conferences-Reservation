import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ReservationModel } from './reservation.models';
import { BookingType, ITicket } from '@app/models';
import { MatTabGroup } from '@angular/material/tabs';
import { RoomType } from 'app/shared/models/ticket';


@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html'
})
export class ReservationComponent implements AfterViewInit {

  @Input() isAdmin = false;
  @Input() isEditMode = false;
  @Input() reservationData: Array<ITicket> = [];
  @Output() bookingDone = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('mainTabGroup') mainTabGroup!: MatTabGroup;
  @ViewChild('roomTabGroup') groupTabGroup!: MatTabGroup;
  model: ReservationModel;

  constructor() {
    this.model = new ReservationModel();
  }

  ngAfterViewInit(): void {
    this.selectTabBasedOnReservationData();
  }

  private selectTabBasedOnReservationData(): void {
    if (this.reservationData && this.reservationData.length > 0) {
      const primary = this.reservationData.find(r => r.isMain);
      if (primary) {
        const reservationType = primary.bookingType;
        if (reservationType === BookingType.individual) {
          this.mainTabGroup.selectedIndex = 0;
        } else {
          this.mainTabGroup.selectedIndex = 1;
          const roomType = primary.roomType;
          switch (roomType) {
            case RoomType.double:
              this.groupTabGroup.selectedIndex = 0;
              break;
            case RoomType.triple:
              this.groupTabGroup.selectedIndex = 1;
              break;
            case RoomType.quad:
              this.groupTabGroup.selectedIndex = 2;
              break;
          }
        }
      }
    }
  }
}
