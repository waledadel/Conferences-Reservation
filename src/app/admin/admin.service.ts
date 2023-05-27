import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private titleSubject = new BehaviorSubject<string>('');
  private readonly excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  private readonly excelExtension = '.xlsx';
  title = this.titleSubject.asObservable();

  updatePageTitle(title: string): void {
    this.titleSubject.next(title);
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: {'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: this.excelType
    });
    const today = new Date();
    const date =  `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
    FileSaver.saveAs(data, `${fileName}_${date}${this.excelExtension}`);
  }
}
