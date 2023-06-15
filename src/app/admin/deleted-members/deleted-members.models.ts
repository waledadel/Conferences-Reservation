import { MatTableDataSource } from '@angular/material/table';

import { BookingStatus, IDeletedMembersDataSourceVm } from '@app/models';

export class DeletedMembersModel {
  readonly desktopColumns = ['name', 'primaryMemberName', 'mobile', 'deletedBy'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IDeletedMembersDataSourceVm>([]);
  isMobileView = false;
  total = 0;
  bookingStatus = BookingStatus;
}
