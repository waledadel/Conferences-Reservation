import { MatTableDataSource } from '@angular/material/table';

import { IDeletedMembersDataSourceVm } from '@app/models';

export class DeletedMembersModel {
  readonly desktopColumns = ['name', 'mobile'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IDeletedMembersDataSourceVm>([]);
  isMobileView = false;
  total = 0;
}
