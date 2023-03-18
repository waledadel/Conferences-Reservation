import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public itemName: string) {
  }

  ngOnInit(): void {
  }

  cancel(): void {
    this.close();
  }

  delete(): void {
    this.close(true);
  }

  private close(confirmDelete = false): void {
    this.dialogRef.close({confirmDelete});
  }
}
