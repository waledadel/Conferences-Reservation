import { BookingSuccessfullyComponent } from './../../admin/reservation/booking-successfully/booking-successfully.component';
import { ConfirmBookingComponent } from './../../admin/reservation/confirm-booking/confirm-booking.component';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDeleteComponent } from '../components/confirm-delete/confirm-delete.component';

type modalSize = 'sm' | 'md' | 'lg' | 'xlg';

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

  openConfirmBookingDialog(isGrouping: boolean): MatDialogRef<unknown, any> {
    return this.dialog.open(ConfirmBookingComponent, {
      panelClass: 'customDialogPanelClass-md',
      disableClose: true,
      data: isGrouping
    });
  }

  openSuccessfullyBookingDialog(): MatDialogRef<unknown, any> {
    return this.dialog.open(BookingSuccessfullyComponent, {
      panelClass: 'customDialogPanelClass-md',
      disableClose: true
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
