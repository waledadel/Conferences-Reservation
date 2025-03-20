import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SharedModule } from 'app/shared/shared.module';

@Component({
    templateUrl: './room-cancellation.component.html',
    imports: [SharedModule]
})
export class RoomCancellationComponent {

  constructor(
    private dialogRef: MatDialogRef<RoomCancellationComponent>,
    @Inject(MAT_DIALOG_DATA) public memberName: string
  ) {}

  close(confirmCancellation = false): void {
    this.dialogRef.close({confirmCancellation});
  }
}
