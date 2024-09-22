import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IPrimaryDataSourceVm, ITicket } from '@app/models';
import { FireStoreService } from '@app/services';
import { ReservationComponent } from '../reservation.component';
import { timer } from 'rxjs';

@Component({
  templateUrl: './manage-reservation.component.html'
})
export class ManageReservationComponent implements OnInit {

  reservationData: Array<ITicket> = [];
  isDataLoaded = false;
  @ViewChild('reservationComp') reservationComp: ReservationComponent;

  constructor(
    private dialogRef: MatDialogRef<ManageReservationComponent>,
    private fireStoreService: FireStoreService,
    @Inject(MAT_DIALOG_DATA) public data: IPrimaryDataSourceVm
  ) {}
  
  ngOnInit(): void {
    this.getReservationData();
  }

  close(fireRefresh = false): void {
    this.dialogRef.close({fireRefresh});
  }

  private getReservationData(): void {
    if (this.data && this.data.id) {
      this.fireStoreService.getPrimaryWithRelatedParticipants(this.data.id).subscribe(res => {
        this.reservationData = res;
        this.isDataLoaded = true;
        timer(100).subscribe(() => {
          if (this.reservationComp && this.data && this.reservationData) {
            const primary = this.reservationData.find(r => r.isMain);
            if (primary) {
              this.reservationComp.setGroupTabBasedOnRoomType(primary.roomType);
            }
          }
        });
      });
    } else {
      this.isDataLoaded = true;
    }
  }
}
