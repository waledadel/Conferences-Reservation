import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SharedModule } from 'app/shared/shared.module';

@Component({
  templateUrl: './booking-successfully.component.html',
  styleUrls: ['./booking-successfully.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class BookingSuccessfullyComponent {

  constructor(private dialogRef: MatDialogRef<BookingSuccessfullyComponent>, @Inject(MAT_DIALOG_DATA) public isWaitingEnabled: boolean) {}

  close(): void {
    this.dialogRef.close();
  }
}
