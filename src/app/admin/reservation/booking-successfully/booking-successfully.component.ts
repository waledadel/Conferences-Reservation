import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './booking-successfully.component.html',
  styleUrls: ['./booking-successfully.scss']
})
export class BookingSuccessfullyComponent {

  constructor(private dialogRef: MatDialogRef<BookingSuccessfullyComponent>, @Inject(MAT_DIALOG_DATA) public isWaitingEnabled: boolean) {}

  close(): void {
    this.dialogRef.close();
  }
}
