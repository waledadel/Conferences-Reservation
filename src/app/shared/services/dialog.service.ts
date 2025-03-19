import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDeleteComponent } from '../components/confirm-delete/confirm-delete.component';
import { ConfirmBookingComponent } from './../../admin/reservation/confirm-booking/confirm-booking.component';
import { BookingSuccessfullyComponent } from './../../admin/reservation/booking-successfully/booking-successfully.component';
import { RoomCancellationComponent } from 'app/admin/all-subscription/room-cancellation/room-cancellation.component';
import { ErrorsModalComponent } from './../../admin/all-subscription/errors-modal/errors-modal.component';
import { RoomErrorsModal } from '../models/room';

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

  openSuccessfullyBookingDialog(isWaitingEnabled: boolean): MatDialogRef<unknown, any> {
    return this.dialog.open(BookingSuccessfullyComponent, {
      panelClass: 'customDialogPanelClass-md',
      disableClose: true,
      data: isWaitingEnabled
    });
  }

  openRoomCancellationModal(itemName: string): MatDialogRef<unknown, any> {
    return this.dialog.open(RoomCancellationComponent, {
      panelClass: 'customDialogPanelClass-md',
      disableClose: true,
      data: itemName
    });
  }

  openRoomErrorsModal(error: RoomErrorsModal): MatDialogRef<unknown, any> {
    return this.dialog.open(ErrorsModalComponent, {
      panelClass: 'customDialogPanelClass-md',
      disableClose: true,
      data: error
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
