import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';

import { Constants } from '@app/constants';
import { IRoomDataSource } from '@app/models';
import { NotifyService, DialogService, TranslationService, FireStoreService } from '@app/services';
import { ManageRoomsComponent } from './manage-rooms/manage-rooms.component';
import { AdminService } from '../admin.service';
import { RoomsModel } from './rooms.model';
import { RoomType } from 'app/shared/models/ticket';

@Component({
    templateUrl: './rooms.component.html',
    styleUrls: ['./rooms.component.scss'],
    standalone: false
})
export class RoomsComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort!: MatSort;
  @ViewChild('input', {static: true}) input!: ElementRef<HTMLInputElement>;
  model: RoomsModel;

  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
    private adminService: AdminService
  ) {
    this.model = new RoomsModel();
  }

  ngOnInit(): void {
    this.detectMobileView();
    this.getRooms();
    this.adminService.updatePageTitle('الغرف');
  }

  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  readExcelFile(event: Event): void {
    this.model.showLoading = true;
    this.model.showErrorMessage = false;
    this.model.dataSource = new MatTableDataSource<IRoomDataSource>([]);
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
        const dataSource: IRoomDataSource[] = [];
        data.forEach((row, index) => {
          const header = data[0];
          if (header[0] === 'room' && header[1] === 'building' && header[2] === 'floor' && header[3] === 'sizeName') {
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
                room: Number(row[0]),
                building: (row[1]),
                floor: Number(row[2]),
                sizeName: row[3],
                size: roomSize,
                displayedName: `R:${row[0]}_S:(${row[3]})_B:${row[1]}_F:${row[2]}_A:${roomSize}`,
                // current: 0,
                available: roomSize,
                // notUsed: 0,
                members: [],
                roomType: RoomType.unknown
              });
            }
          } else {
            this.model.showErrorMessage = true;
          }
        });
        if (dataSource.length > 0) {
          this.model.dataSource = new MatTableDataSource(dataSource);
          this.model.isDataLocal = true;
        } else {
          this.model.showErrorMessage = true;
          this.model.isDataLocal = false;
        }
        this.model.showLoading = false;
      };
      reader.readAsBinaryString(selectedFile);
    } else {
      this.model.showLoading = false;
      this.model.isDataLocal = false;
    }
  }

  add(): void {
    this.dialogService.openAddEditDialog(ManageRoomsComponent, 'lg', false).afterClosed().subscribe((res: {fireRefresh: boolean}) => {
      if (res && res.fireRefresh) {
        this.getRooms();
      }
    });
  }

  update(item: IRoomDataSource): void {
    this.dialogService.openAddEditDialog(ManageRoomsComponent, 'lg', true, item).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res && res.fireRefresh) {
        this.updateTableRow(item);
      }
    });
  }

  delete(item: IRoomDataSource): void {
    this.dialogService.openConfirmDeleteDialog(item.displayedName).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        if (this.model.isDataLocal) {
          const index = this.model.dataSource.data.findIndex(t => t.id === item.id);
          if (index > -1) {
            this.model.dataSource.data.splice(index, 1);
            this.model.dataSource._updateChangeSubscription();
            this.notifyService.showNotifier(this.translationService.instant('notifications.removedSuccessfully'));
          }
        } else {
          this.fireStoreService.delete(`${Constants.RealtimeDatabase.rooms}/${item.id}`).subscribe(() => {
            const index = this.model.dataSource.data.findIndex(t => t.id === item.id);
            if (index > -1) {
              this.model.dataSource.data.splice(index, 1);
              this.model.dataSource._updateChangeSubscription();
              this.notifyService.showNotifier(this.translationService.instant('notifications.removedSuccessfully')); 
            }
          });
        }
      }
    });
  }

  uploadRooms(): void {
    this.model.showLoading = true;
    const rooms: Array<IRoomDataSource> = this.model.dataSource.data.map(r => ({
      id: this.fireStoreService.createId(),
      available: r.available,
      building: r.building,
      // current: r.current,
      floor: r.floor,
      // notUsed: r.notUsed,
      room: r.room,
      sizeName: r.sizeName,
      members: [],
      size: r.size,
      displayedName: '',
      roomType: RoomType.unknown
    }));
    this.fireStoreService.uploadRooms(rooms).subscribe(() => {
      this.model.isDataLocal = false;
      this.model.showLoading = false;
      this.getRooms();
    });
  }

  removeAll(): void {
    this.dialogService.openConfirmDeleteDialog('حذف جميع الغرف').afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.model.showLoading = true;
        if (!this.model.isDataLocal) {
          this.fireStoreService.deleteAllRooms(this.model.dataSource.data).subscribe(() => {
            this.notifyService.showNotifier(this.translationService.instant('notifications.removedSuccessfully'));
          });
        }
        this.input.nativeElement.value = '';
        this.model.dataSource.data = [];
        this.model.showErrorMessage = false;
        this.model.isDataLocal = false;
        this.model.showLoading = false;
      }
    });
  }

  private getRooms(): void {
    this.fireStoreService.getRoomsWithMembers().subscribe(data => {
      if (data && data.length > 0) {
        this.model.dataSource.data = data.map(r => ({
          ...r,
          displayedName: `R:${r.room}_S:(${r.sizeName})_B:${r.building}_F:${r.floor}_A:${r.available}`,
          size: this.getRoomCountSize(r.sizeName),
        }));
        this.model.dataSource.sort = this.sort;
        console.log(this.model.dataSource.data);
      }
    });
  }

  private detectMobileView(): void {
    this.model.isMobileView = this.isMobile;
    if (this.model.isMobileView) {
      this.model.displayedColumns = ['mobileView'];
    } else {
      this.model.displayedColumns = this.model.desktopColumn;
    }
  }

  private getRoomCountSize(sizeName: string): number {
    let roomSize = 0;
    if (sizeName.toString().includes('+')) {
      const list = sizeName.split('+');
      roomSize = list.reduce((accumulator, currentValue) => accumulator + (+currentValue), 0);
    } else {
      roomSize = (+sizeName);
    }
    return roomSize;
  }

  private updateTableRow(item: Partial<IRoomDataSource>): void {
    this.fireStoreService.getById(`${Constants.RealtimeDatabase.rooms}/${item.id}`).subscribe((res: IRoomDataSource) => {
      if (res) {
        const index = this.model.dataSource.data.findIndex(t => t.id === item.id);
        if (index > -1) {
          this.model.dataSource.data[index] = {
            ...res,
            size: this.getRoomCountSize(res.sizeName),
            displayedName: `R:${res.room}_S:(${res.sizeName})_B:${res.building}_F:${res.floor}_A:${res.available}`,
          };
        }
        this.model.dataSource._updateChangeSubscription();
      }
    });
  }
}
