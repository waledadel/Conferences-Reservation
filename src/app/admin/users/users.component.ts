import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IUser } from '@app/models';
import { NotifyService, DialogService, FireStoreService } from '@app/services';
import { AdminService } from '../admin.service';

@Component({
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['userName', 'email', 'phoneNumber', 'ssn', 'createdOn', 'actions'];
  dataSource: MatTableDataSource<IUser> = new MatTableDataSource<IUser>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
    this.adminService.updatePageTitle('الخدام');
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  delete(item: IUser): void {
    this.dialogService.openConfirmDeleteDialog(item.fullName).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.fireStoreService.delete(`${Constants.RealtimeDatabase.users}/${item.id}`).subscribe(() => {
          this.notifyService.showNotifier('User Deleted Successfully');
        });
      }
    });
  }

  private getAllUsers(): void {
    this.fireStoreService.getAll(Constants.RealtimeDatabase.users).subscribe(data => {
      // this.dataSource.data = data;
    });
  }
}
