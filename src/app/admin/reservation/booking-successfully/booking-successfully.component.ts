import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './booking-successfully.component.html',
  styleUrls: ['./booking-successfully.scss']
})
export class BookingSuccessfullyComponent {

  constructor(private dialogRef: MatDialogRef<BookingSuccessfullyComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
