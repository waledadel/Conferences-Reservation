import { Component, HostListener, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IRoomType } from '@app/models';
import { NotifyService, DialogService, TranslationService, FireStoreService } from '@app/services';
import { AdminService } from '../admin.service';
import { ManageRoomTypeComponent } from './manage-room-type/manage-room-type.component';

@Component({
    selector: 'app-room-type',
    templateUrl: './room-type.component.html',
    standalone: false
})
export class RoomTypeComponent implements OnInit {

  readonly desktopColumn = ['name', 'price', 'actions'];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<IRoomType> = new MatTableDataSource<IRoomType>([]);
  isMobileView = false;
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
    this.getRoomTypeList();
    this.adminService.updatePageTitle('نوع الغرف');
  }

  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  add(): void {
    this.dialogService.openAddEditDialog(ManageRoomTypeComponent, 'lg', false).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        this.getRoomTypeList();
      }
    });
  }

  update(item: IRoomType): void {
    this.dialogService.openAddEditDialog(ManageRoomTypeComponent, 'lg', true, item).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        this.getRoomTypeList();
      }
    });
  }

  delete(item: IRoomType): void {
    this.dialogService.openConfirmDeleteDialog(item.name).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.fireStoreService.delete(`${Constants.RealtimeDatabase.roomType}/${item.id}`).subscribe(() => {
          this.getRoomTypeList();
          this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
        });
      }
    });
  }

  private getRoomTypeList(): void {
    this.fireStoreService.getAll<IRoomType>(Constants.RealtimeDatabase.roomType).subscribe(data => {
      this.dataSource.data = data;
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
