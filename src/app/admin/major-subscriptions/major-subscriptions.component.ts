import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ITicket } from '@app/models';
import { FireStoreService } from '@app/services';

@Component({
  templateUrl: './major-subscriptions.component.html'
})
export class MajorSubscriptionsComponent implements OnInit {

  total = 0;
  displayedColumns: string[] = ['name', 'adultsCount', 'childrenCount', 'roomId',
  'bookingType', 'bookingDate', 'totalCost', 'paid', 'remaining', 'userNotes', 'bookingStatus'];
  dataSource: MatTableDataSource<Partial<ITicket>> = new MatTableDataSource<Partial<ITicket>>([]);
  
  constructor(private fireStoreService: FireStoreService) {}

  ngOnInit(): void {
    this.getPrimaryTickets();
  }

  private getPrimaryTickets(): void {
    this.fireStoreService.getPrimarySubscription().subscribe(res => {
      this.dataSource.data = res;
      this.total = res.length;
      console.log('res', res);
    });
  }
}
