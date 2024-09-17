import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BookingType, IPrimaryDataSourceVm, ITicket } from '@app/models';
import { FireStoreService } from '@app/services';
import { RoomType } from 'app/shared/models/ticket';

@Component({
  templateUrl: './manage-reservation.component.html'
})
export class ManageReservationComponent implements OnInit  {

  reservationData: Array<ITicket> = [];
  isDataLoaded = false;
  isSaveInProgress = false;
  activeBookingTab = 0;
  activeRoomTab = 0;
  readonly bookingType = BookingType;

  constructor(
    private dialogRef: MatDialogRef<ManageReservationComponent>,
    private fireStoreService: FireStoreService,
    @Inject(MAT_DIALOG_DATA) public data: IPrimaryDataSourceVm
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.fireStoreService.getPrimaryWithRelatedParticipants(this.data.id).subscribe(res => {
        this.reservationData = res;
        this.isDataLoaded = true;
        const primary = res.find(p => p.isMain);
        if (primary) {
          this.activeBookingTab = primary.bookingType === BookingType.individual ? 0 : 1;
          if (primary.bookingType === BookingType.group) {
            switch(primary.roomType) {
              case RoomType.triple:
                this.activeRoomTab = 1;
                break;
              case RoomType.quad:
                this.activeRoomTab = 2;
                break;
              default:
                this.activeRoomTab = 0;
                break;
            }
          }
        }
      });
    }
  }

  close(fireRefresh = false): void {
    this.dialogRef.close({fireRefresh});
  }

  onBookingTabChanged(index: number): void {
    this.activeBookingTab = index;
  }
}
