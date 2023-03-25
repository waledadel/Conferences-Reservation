import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IAddress } from '@app/models';
import { NotifyService, DialogService, FireStoreService, TranslationService } from '@app/services';
import { ManageAddressComponent } from './manage-address/manage-address.component';

@Component({
  templateUrl: './address.component.html'
})
export class AddressComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['name', 'actions'];
  dataSource: MatTableDataSource<IAddress> = new MatTableDataSource<IAddress>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.getAddress();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
      this.dataSource.data = data;
    });
  }
}
