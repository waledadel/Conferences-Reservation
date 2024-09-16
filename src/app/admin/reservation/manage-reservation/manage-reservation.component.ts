import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BookingType, IPrimaryDataSourceVm, ITicket } from '@app/models';
import { FireStoreService } from '@app/services';
import { ManageReservationFormComponent } from '../manage-reservation-form/manage-reservation-form.component';

@Component({
  templateUrl: './manage-reservation.component.html'
})
export class ManageReservationComponent implements OnInit  {

  reservationData: Array<ITicket> = [];
  isDataLoaded = false;
  isSaveInProgress = false;
  selectedTabIndex = 0;
  readonly bookingType = BookingType;
  @ViewChild('manageReservationForm') manageReservationForm: ManageReservationFormComponent;

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
      });
    }
  }

  close(fireRefresh = false): void {
    this.dialogRef.close({fireRefresh});
  }

  save(): void {
    this.isSaveInProgress = true;
    this.manageReservationForm.update();
  }

  onTabChanged(index: number): void {
    this.selectedTabIndex = index;
  }
}
