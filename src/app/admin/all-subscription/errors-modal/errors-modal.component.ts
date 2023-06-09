import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RoomErrorsModal } from '@app/models';

@Component({
  templateUrl: './errors-modal.component.html',
  styleUrls: ['./errors-modal.component.scss']
})

export class ErrorsModalComponent {

  errors = RoomErrorsModal;

  constructor(
    private dialogRef: MatDialogRef<ErrorsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public error: RoomErrorsModal
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
