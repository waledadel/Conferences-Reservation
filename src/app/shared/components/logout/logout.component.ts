import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { SharedModule } from 'app/shared/shared.module';

@Component({
  templateUrl: './logout.component.html',
  standalone: true,
  imports: [SharedModule]
})
export class LogoutComponent {

  constructor(private dialogRef: MatDialogRef<LogoutComponent>) {}

  close(confirmLogout: boolean = false): void {
    this.dialogRef.close({logout: confirmLogout});
  }
}
