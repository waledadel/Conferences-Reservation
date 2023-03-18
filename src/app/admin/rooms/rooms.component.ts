import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IRoom } from '@app/models';
import { NotifyService, DialogService, BaseService, TranslationService } from '@app/services';
import { ConfirmDeleteComponent } from '@app/components';
import { ManageRoomsComponent } from '../manage-rooms/manage-rooms.component';

@Component({
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['building', 'floor', 'name', 'type', 'rest', 'actions'];
  dataSource: MatTableDataSource<IRoom> = new MatTableDataSource<IRoom>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  
  constructor(
    private baseService: BaseService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.getRooms();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  add(): void {
    this.dialogService.openAddEditDialog(ManageRoomsComponent, 'lg', false);
  }

  update(item: IRoom): void {
    this.dialogService.openAddEditDialog(ManageRoomsComponent, 'lg', true, item);
  }

  delete(item: IRoom): void {
    this.dialogService.openDeleteDialog(ConfirmDeleteComponent, 'xs', item).afterClosed().subscribe((res: {remove: boolean}) => {
      if (res && res.remove) {
        this.baseService.delete(Constants.RealtimeDatabase.rooms, item.id).then(() => {
          this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
        });
      }
    });
  }

  private getRooms(): void {
    this.baseService.getAll<IRoom>(Constants.RealtimeDatabase.rooms).subscribe(data => {
      this.dataSource.data = data;
    });
  }
}
