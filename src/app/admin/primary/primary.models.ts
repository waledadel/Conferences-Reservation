import { MatTableDataSource } from '@angular/material/table';

import { Gender, IBus, IPrimaryDataSourceVm, IRelatedMemberViewModel, IUser } from '@app/models';

export class PrimaryModel {
  adultReservationPrice = 0;
  childReservationPriceLessThanEight = 0;
  childReservationPriceMoreThanEight = 0;
  childBedPrice = 0;
  readonly desktopColumn = ['name', 'mobile', 'adultsCount', 'childrenCount', 'roomId', 'transportation',
  'bookingType', 'birthDate', 'age', 'bookingDate', 'gender', 'totalCost', 'paid', 'remaining', 'adminNotes', 'userNotes', 
  'lastUpdateDate', 'lastUpdatedBy', 'bookingStatus', 'actions'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IPrimaryDataSourceVm>([]);
  filteredData: Array<IPrimaryDataSourceVm> = [];
  notPrimaryMembers: Array<IRelatedMemberViewModel> = [];
  buses: Array<IBus> = [];
  users: Array<IUser> = [];
  isMobileView = false;
  isAdvancedSearchOpened = false;
  gender = Gender;
  total = 0;
}
