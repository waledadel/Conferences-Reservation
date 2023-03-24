import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ITicket } from '@app/models';
import { DialogService, FireStoreService } from '@app/services';
import { ManageReservationComponent } from '../manage-reservation/manage-reservation.component';

@Component({
  templateUrl: './major-subscriptions.component.html'
})
export class MajorSubscriptionsComponent implements OnInit {

  total = 0;
  displayedColumns: string[] = ['name', 'adultsCount', 'childrenCount', 'roomId',
  'bookingType', 'bookingDate', 'totalCost', 'paid', 'remaining', 'userNotes', 'bookingStatus', 'actions'];
  dataSource: MatTableDataSource<Partial<ITicket>> = new MatTableDataSource<Partial<ITicket>>([]);
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.getPrimaryTickets();
  }

  update(item: Partial<ITicket>): void {
    this.dialogService.openAddEditDialog(ManageReservationComponent, 'lg', true, item).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        // TODO: to update list
        this.getPrimaryTickets(2);
      }
    });
  }

  delete(item: Partial<ITicket>): void {

  }

  private getPrimaryTickets(takeCount = 1): void {
    this.fireStoreService.getPrimarySubscription(takeCount).subscribe(res => {
      this.dataSource.data = res;
      this.total = res.length;
    });
  }
}
