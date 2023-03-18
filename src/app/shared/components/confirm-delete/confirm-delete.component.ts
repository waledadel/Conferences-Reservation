import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IDeleteDialog } from '../../models/dialog';

@Component({
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDeleteDialog) {
   }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }


  delete(): void {
    this.dialogRef.close({remove: true});
  }
}
