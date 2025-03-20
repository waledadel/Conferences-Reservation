import { Component, HostListener, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IBus } from '@app/models';
import { NotifyService, DialogService, TranslationService, FireStoreService } from '@app/services';
import { ManageBusComponent } from './manage-bus/manage-bus.component';
import { AdminService } from '../admin.service';

@Component({
    templateUrl: './buses.component.html',
    standalone: false
})
export class BusesComponent implements OnInit {

  readonly desktopColumn = ['name', 'price', 'actions'];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<IBus> = new MatTableDataSource<IBus>([]);
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
    this.getBuses();
    this.adminService.updatePageTitle('الإتوبيسات');
  }

  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  add(): void {
    this.dialogService.openAddEditDialog(ManageBusComponent, 'lg', false).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        this.getBuses();
      }
    });
  }

  update(item: IBus): void {
    this.dialogService.openAddEditDialog(ManageBusComponent, 'lg', true, item).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        this.getBuses();
      }
    });
  }

  delete(item: IBus): void {
    this.dialogService.openConfirmDeleteDialog(item.name).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.fireStoreService.delete(`${Constants.RealtimeDatabase.buses}/${item.id}`).subscribe(() => {
          this.getBuses();
          this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
        });
      }
    });
  }

  private getBuses(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
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
