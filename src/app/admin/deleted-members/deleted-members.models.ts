import { MatTableDataSource } from '@angular/material/table';

import { BookingStatus, ITicket } from '@app/models';

export class DeletedMembersModel {
  readonly desktopColumns = ['name', 'primaryMemberName', 'mobile', 'deletedBy'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<ITicket>([]);
  isMobileView = false;
  total = 0;
  readonly bookingStatus = BookingStatus;
}
