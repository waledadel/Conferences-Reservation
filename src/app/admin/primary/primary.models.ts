import { MatTableDataSource } from '@angular/material/table';

import { BookingStatus, Gender, IAddress, IBus, IPrimaryDataSourceVm, IRelatedMemberViewModel, IUser } from '@app/models';
import { IAdvancedFilterForm } from '../advanced-search/advanced-search.models';

export class PrimaryModel {
  readonly desktopColumn = ['name', 'adultsCount', 'childrenCount', 'roomId', 'transportation', 'addressName',
  'bookingType', 'birthDate', 'age', 'bookingDate', 'gender', 'price', 'notes',
  'lastUpdate', 'bookingStatus', 'actions'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IPrimaryDataSourceVm>([]);
  filteredData: Array<IPrimaryDataSourceVm> = [];
  notPrimaryMembers: Array<IRelatedMemberViewModel> = [];
  buses: Array<IBus> = [];
  addressList: Array<IAddress> = [];
  users: Array<IUser> = [];
  isMobileView = false;
  gender = Gender;
  total = 0;
  previousFilter!: IAdvancedFilterForm;
  bookingStatus = BookingStatus;
}
