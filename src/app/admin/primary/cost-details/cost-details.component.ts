import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { ICostDetailsDataSourceVm } from '@app/models';

@Component({
  templateUrl: './cost-details.component.html'
})
export class CostDetailsComponent implements OnInit {

  displayedColumns: string[] = ['name', 'reservationPrice', 'bedPrice', 'transportPrice', 'needBed', 'privateTransport', 'isChild'];
  dataSource: MatTableDataSource<ICostDetailsDataSourceVm> = new MatTableDataSource<ICostDetailsDataSourceVm>([]);
  total = 0;

  constructor(
    private dialogRef: MatDialogRef<CostDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Array<ICostDetailsDataSourceVm>
  ){}

  ngOnInit(): void {
    if (this.data && this.data.length > 0) {
      this.dataSource.data = this.data;
      this.data.forEach(item => {
        this.total += item.bedPrice + item.reservationPrice + item.transportPrice;
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
