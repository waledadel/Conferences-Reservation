import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IBus } from '@app/models';
import { NotifyService, DialogService, TranslationService, FireStoreService } from '@app/services';
import { ManageBusComponent } from './manage-bus/manage-bus.component';

@Component({
  templateUrl: './buses.component.html'
})
export class BusesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['name', 'price', 'actions'];
  dataSource: MatTableDataSource<IBus> = new MatTableDataSource<IBus>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
  ) {}

  ngOnInit(): void {
    this.getBuses();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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

}
