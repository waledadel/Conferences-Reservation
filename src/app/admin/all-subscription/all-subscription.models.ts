import { MatTableDataSource } from '@angular/material/table';

import { IAddress, IAllSubscriptionDataSourceVm, IBus } from '@app/models';

export class AllSubscriptionModel {
  readonly desktopColumns = ['name', 'mobile', 'birthDate', 'age', 'address', 'transportation', 'gender', 'status', 'room', 'actions'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IAllSubscriptionDataSourceVm>([]);
  filteredData: Array<IAllSubscriptionDataSourceVm> = [];
  addressList: Array<IAddress> = [];
  buses: Array<IBus> = [];
  isMobileView = false;
  isAdvancedSearchOpened = false;
  total = 0;
}
