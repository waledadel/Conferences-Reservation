import { IPrimaryDataSourceVm } from '@app/models';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { allOptions } from './export-members.model';

export interface IExportMembers { 
  key: string;
  columnName: keyof IPrimaryDataSourceVm;
  isChecked: boolean;
  isCustomizableOption: boolean;
}

@Component({
  templateUrl: './export-members.component.html',
  styleUrls: ['./export-members.component.scss']
})
export class ExportMembersComponent implements OnInit {

  selectAll = false;
  options: Array<IExportMembers> = [];
  get isExportBtnDisabled(): boolean {
    return this.options.filter(o => o.isChecked).length < 1;
  };
  constructor(
    public dialogRef: MatDialogRef<ExportMembersComponent>,
    @Inject(MAT_DIALOG_DATA) public showCustomizableOptions: boolean) {
  }

  ngOnInit(): void {
    if (this.showCustomizableOptions) {
      this.options = allOptions;
    } else {
      this.options = allOptions.filter(o => !o.isCustomizableOption);
    }
  }

  onSelectAllChanged(): void {
    if (this.selectAll) {
      this.options = this.options.map(item => ({...item, isChecked: true}));
    } else {
      this.options = this.options.map(item => ({...item, isChecked: false}));
    }
  }

  cancel(): void {
    this.close();
  }

  export(): void {
    this.close(true);
  }

  private close(exportData = false): void {
    this.dialogRef.close({exportData, options: this.options});
  }
}
