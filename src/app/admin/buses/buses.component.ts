import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IBus } from '@app/models';
import { NotifyService, DialogService, BaseService, TranslationService } from '@app/services';
import { ConfirmDeleteComponent } from '@app/components';
import { ManageBusComponent } from '../manage-bus/manage-bus.component';

@Component({
  templateUrl: './buses.component.html',
  styleUrls: ['./buses.component.scss']
})
export class BusesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['arName', 'enName', 'actions'];
  dataSource: MatTableDataSource<IBus> = new MatTableDataSource<IBus>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  
  constructor(
    private baseService: BaseService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.getBuses();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  add(): void {
    this.dialogService.openAddEditDialog(ManageBusComponent, 'lg', false);
  }

  update(item: IBus): void {
    this.dialogService.openAddEditDialog(ManageBusComponent, 'lg', true, item);
  }

  delete(item: IBus): void {
    this.dialogService.openDeleteDialog(ConfirmDeleteComponent, 'xs', item).afterClosed().subscribe((res: {remove: boolean}) => {
      if (res && res.remove) {
        this.baseService.delete(Constants.RealtimeDatabase.buses, item.id).then(() => {
          this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
        });
      }
    });
  }

  private getBuses(): void {
    this.baseService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.dataSource.data = data;
    });
  }

}
