import { MatTableDataSource } from '@angular/material/table';

import { BookingStatus, Gender, IAddress, IBus, IPrimaryDataSourceVm, IRelatedMemberViewModel, IUser } from '@app/models';
import { IAdvancedFilterForm } from '../advanced-search/advanced-search.models';

export class PrimaryModel {
  adultReservationPrice = 0;
  childReservationPriceLessThanEight = 0;
  childReservationPriceMoreThanEight = 0;
  childBedPrice = 0;
  readonly desktopColumn = ['name', 'mobile', 'adultsCount', 'childrenCount', 'roomId', 'transportation', 'addressName',
  'bookingType', 'birthDate', 'age', 'bookingDate', 'gender', 'totalCost', 'paid', 'remaining', 'adminNotes', 'userNotes', 
  'lastUpdateDate', 'lastUpdatedBy', 'bookingStatus', 'actions'];
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
