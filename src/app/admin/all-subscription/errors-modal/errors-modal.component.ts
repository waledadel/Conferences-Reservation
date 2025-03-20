import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RoomErrorsModal } from '@app/models';
import { SharedModule } from 'app/shared/shared.module';

@Component({
    templateUrl: './errors-modal.component.html',
    styleUrls: ['./errors-modal.component.scss'],
    imports: [SharedModule]
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
