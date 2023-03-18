import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDeleteComponent } from '../components/confirm-delete/confirm-delete.component';

type modalSize = 'sm' | 'md' | 'lg';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {}

  openConfirmDeleteDialog(itemName: string): MatDialogRef<unknown, any> {
    return this.dialog.open(ConfirmDeleteComponent, {
      panelClass: 'customDialogPanelClass-sm',
      disableClose: true,
      data: itemName
    });
  }

  openAddEditDialog(component: any, size: modalSize, isEditMode: boolean, data?: any): MatDialogRef<unknown, any> {
    return this.dialog.open(component, {
      panelClass: `customDialogPanelClass-${size}`,
      disableClose: true,
      data: isEditMode ? data : null
    });
  }
}
