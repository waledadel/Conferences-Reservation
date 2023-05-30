import { Component, HostListener, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';

import { Constants } from '@app/constants';
import { IRoom } from '@app/models';
import { NotifyService, DialogService, TranslationService, FireStoreService } from '@app/services';
import { ManageRoomsComponent } from './manage-rooms/manage-rooms.component';
import { AdminService } from '../admin.service';

@Component({
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  readonly desktopColumn = ['room', 'building', 'floor', 'sizeName', 'size', 'displayedName', 'current', 'available', 'notUsed', 'actions'];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<IRoom> = new MatTableDataSource<IRoom>([]);
  isMobileView = false;
  showLoading = false;
  showErrorMessage = false;

  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.detectMobileView();
    this.getRooms();
    this.adminService.updatePageTitle('الغرف');
  }

  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  readExcelFile(event: Event): void {
    this.showLoading = true;
    this.showErrorMessage = false;
    this.dataSource = new MatTableDataSource<IRoom>([]);
    const fileInput = event.target as HTMLInputElement;
    const selectedFile = fileInput.files?.[0];
    if (selectedFile && selectedFile.name.includes('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const binaryString = event.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Array<string>>(sheet, { header: 1 });
        const dataSource: Array<IRoom> = [];
        data.forEach((row, index) => {
          if (index > 0 && row && row.length === 4) {
            let roomSize = 0;
            if (row[3].toString().includes('+')) {
              const list = row[3].split('+');
              roomSize = list.reduce((accumulator, currentValue) => accumulator + (+currentValue), 0);
            } else {
              roomSize = (+row[3]);
            }
            dataSource.push({
              id: '',
              room: +(row[0]),
              building: +(row[1]),
              floor: +(row[2]),
              sizeName: row[3],
              size: roomSize,
              displayedName: `Room:${row[0]}-(${row[3]})-Building:${row[1]}-Floor:${row[2]}-Available:${roomSize}`,
              current: 0,
              available: roomSize,
              notUsed: 0 
            });
          }
        });
        if (dataSource.length > 0) {
          this.dataSource = new MatTableDataSource(dataSource);
        } else {
          this.showErrorMessage = true;
        }
        this.showLoading = false;
      };
      reader.readAsBinaryString(selectedFile);
    } else {
      this.showLoading = false;
      this.showErrorMessage = true;
    }
  }

  add(): void {
    // this.dialogService.openAddEditDialog(ManageRoomsComponent, 'lg', false);
  }

  update(item: IRoom): void {
    this.dialogService.openAddEditDialog(ManageRoomsComponent, 'lg', true, item);
  }

  delete(item: IRoom): void {
    this.dialogService.openConfirmDeleteDialog(item.displayedName).afterClosed().subscribe((res: {remove: boolean}) => {
      if (res && res.remove) {
        // this.fireStoreService.delete(Constants.RealtimeDatabase.rooms, item.id).then(() => {
          this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
        // });
      }
    });
  }

  private getRooms(): void {
    this.fireStoreService.getAll(Constants.RealtimeDatabase.rooms).subscribe(data => {
      // this.dataSource.data = data;
    });
  }

  private detectMobileView(): void {
    this.isMobileView = this.isMobile;
    if (this.isMobileView) {
      this.displayedColumns = ['mobileView'];
    } else {
      this.displayedColumns = this.desktopColumn;
    }
  }
}
