import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './logout.component.html'
})
export class LogoutComponent {

  constructor(private dialogRef: MatDialogRef<LogoutComponent>) {}

  close(confirmLogout: boolean = false): void {
    this.dialogRef.close({logout: confirmLogout});
  }
}
