import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ITicket } from '@app/models';
import { FireStoreService } from '@app/services';

@Component({
  templateUrl: './manage-reservation.component.html'
})
export class ManageReservationComponent implements OnInit  {

  reservationData: Array<ITicket> = [];
  fireSave = false;
  isDataLoaded = false;

  constructor(
    private dialogRef: MatDialogRef<ManageReservationComponent>,
    private fireStoreService: FireStoreService,
    @Inject(MAT_DIALOG_DATA) public data: Partial<ITicket>
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.fireStoreService.getPrimaryWithRelatedParticipants(this.data.id).subscribe(res => {
        this.reservationData = res;
        this.isDataLoaded = true;
      });
    }
  }

  close(fireRefresh = false): void {
    this.dialogRef.close({fireRefresh});
  }

  save(): void {
    this.fireSave = true;
  }
}
