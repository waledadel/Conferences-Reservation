import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ExportPages, IExportMembers, allOptions } from './export-members.model';

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
    private dialogRef: MatDialogRef<ExportMembersComponent>,
    @Inject(MAT_DIALOG_DATA) private config: ExportPages) {
  }

  ngOnInit(): void {
    if (this.config) {
      this.options = allOptions.filter(o => o.visibility.includes(this.config)).map(item => ({...item, isChecked: false}));
    }
  }

  onSelectAllChanged(): void {
    this.options = this.options.map(item => ({...item, isChecked: this.selectAll}));
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
