import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IUser } from '@app/models';
import { NotifyService, DialogService, BaseService } from '@app/services';
import { ConfirmDeleteComponent } from '@app/components';

@Component({
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['userName', 'email', 'phoneNumber', 'ssn', 'createdOn', 'actions'];
  dataSource: MatTableDataSource<IUser> = new MatTableDataSource<IUser>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  
  constructor(
    private baseService: BaseService,
    private dialogService: DialogService,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  delete(user: IUser): void {
    this.dialogService.openDeleteDialog(ConfirmDeleteComponent, 'xs', user).afterClosed().subscribe((res: {remove: boolean}) => {
      if (res && res.remove) {
        this.baseService.delete(Constants.RealtimeDatabase.users, user.id).then(() => {
          this.notifyService.showNotifier('User Deleted Successfully');
        });
      }
    });
  }

  private getAllUsers(): void {
    this.baseService.getAll<IUser>(Constants.RealtimeDatabase.users).subscribe(data => {
      this.dataSource.data = data;
    });
  }
}
