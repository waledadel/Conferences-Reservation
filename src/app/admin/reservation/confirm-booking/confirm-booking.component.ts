import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './confirm-booking.component.html'
})
export class ConfirmBookingComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public isGrouping: boolean) {
  }

  cancel(): void {
    this.close();
  }

  confirm(): void {
    this.close(true);
  }

  private close(confirmBooking = false): void {
    this.dialogRef.close({confirmBooking});
  }
}
