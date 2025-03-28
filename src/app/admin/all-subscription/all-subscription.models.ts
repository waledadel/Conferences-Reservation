import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { IAddress, IAllSubscriptionDataSourceVm, IBus, BookingStatus, IRoom } from '@app/models';
import { IAdvancedFilterForm } from '../advanced-search/advanced-search.models';
import { RoomType } from 'app/shared/models/ticket';
import { signal } from '@angular/core';
import { IConferenceProgram } from '../conference-program/conference-program.models';

export class AllSubscriptionModel {
  readonly desktopColumns = ['name', 'mobile', 'birthDate', 'age', 'gender', 'address', 'transportation', 
    'status', 'total', 'paid', 'remaining', 'roomType', 'userNotes', 'adminNotes', 'room', 'actions'];
  readonly roomType = RoomType;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IAllSubscriptionDataSourceVm>([]);
  filteredData: Array<IAllSubscriptionDataSourceVm> = [];
  addressList: Array<IAddress> = [];
  buses: Array<IBus> = [];
  isMobileView = false;
  total = 0;
  previousFilter!: IAdvancedFilterForm;
  bookingStatus = BookingStatus;
  selection = new SelectionModel<IAllSubscriptionDataSourceVm>(true, []);
  rooms: Array<IRoom> = [];
  conferenceProgram = signal<IConferenceProgram>({
    id: '',
    locationUrl: '',
    imageUrl: '',
    message: ''
  });
}
