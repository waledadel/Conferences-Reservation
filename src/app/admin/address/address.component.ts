import { Component, HostListener, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IAddress } from '@app/models';
import { NotifyService, DialogService, FireStoreService, TranslationService } from '@app/services';
import { ManageAddressComponent } from './manage-address/manage-address.component';
import { AdminService } from '../admin.service';

@Component({
    templateUrl: './address.component.html',
    standalone: false
})
export class AddressComponent implements OnInit {

  displayedColumns: string[] = ['name', 'actions'];
  dataSource: MatTableDataSource<IAddress> = new MatTableDataSource<IAddress>([]);
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
    this.getAddress();
    this.adminService.updatePageTitle('العنوان');
  }

  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  add(): void {
    this.dialogService.openAddEditDialog(ManageAddressComponent, 'lg', false).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        this.getAddress();
      }
    });
  }

  update(item: IAddress): void {
    this.dialogService.openAddEditDialog(ManageAddressComponent, 'lg', true, item).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        this.getAddress();
      }
    });
  }

  delete(item: IAddress): void {
    this.dialogService.openConfirmDeleteDialog(item.name).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.fireStoreService.delete(`${Constants.RealtimeDatabase.address}/${item.id}`).subscribe(() => {
          this.getAddress();
          this.notifyService.showNotifier(this.translationService.instant('notifications.removedSuccessfully'));
        });
      }
    });
  }

  private getAddress(): void {
    this.fireStoreService.getAll<IAddress>(Constants.RealtimeDatabase.address).subscribe(data => {
      this.dataSource.data = data.sort((a, b) => a.name > b.name ? 1 : -1);
    });
  }

  private detectMobileView(): void {
    this.isMobileView = this.isMobile;
  }
}
