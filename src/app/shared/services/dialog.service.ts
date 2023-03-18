import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private body: any;

  constructor(public dialog: MatDialog, @Inject(DOCUMENT) private document: Document) {
    this.body = this.document.getElementById('body');
  }

  openDetailsDialog(component: any, size: string, incomingData: any): void {
    const dialogRef = this.dialog.open(component, {
      panelClass: `customDialogPanelClass-${size}`,
      disableClose: true,
      data: incomingData,
      autoFocus: false
    });
    this.preventScrollOnOpenDialog();
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.enableScrollAfterCloseDialog();
        dialogRef.beforeClosed();
      }
    });
  }

  openDeleteDialog(component: any, size: string, IDeleteDialog: any) {
    return this.dialog.open(component, {
      panelClass: `customDialogPanelClass-${size}`,
      disableClose: true,
      data: IDeleteDialog
    });
  }

  openEditDialog(component: any, size: string, incomingData: any, approveCallBack: () => void): void {
    const dialogRef = this.dialog.open(component, {
      panelClass: `customDialogPanelClass-${size}`,
      disableClose: true,
      data: incomingData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        approveCallBack();
      } else {
       dialogRef.beforeClosed();
      }
    });
  }

  openAddEditDialog(component: any, size: string, isEditMode: boolean, incomingData?: any): void {
    const dialogRef = this.dialog.open(component, {
      panelClass: `customDialogPanelClass-${size}`,
      disableClose: true,
      data: isEditMode ? incomingData : null
    });
    dialogRef.afterClosed();
  }

  private preventScrollOnOpenDialog(): void {
    this.body.classList.add('preventScrollOnOpenDialog');
  }

  private enableScrollAfterCloseDialog(): void {
    this.body.classList.remove('preventScrollOnOpenDialog');
  }
}
