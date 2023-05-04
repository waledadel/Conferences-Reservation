import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ITicket } from '@app/models';
import { FireStoreService } from '@app/services';

@Component({
  templateUrl: './all-subscription.component.html'
})
export class AllSubscriptionComponent implements OnInit {

  total = 0;
  displayedColumns: string[] = ['name', 'mobile', 'birthDate', 'age', 'gender', 'room', 'status'];
  dataSource: MatTableDataSource<Partial<ITicket>> = new MatTableDataSource<Partial<ITicket>>([]);

  constructor(private fireStoreService: FireStoreService) {}

  ngOnInit(): void {
    this.getTickets();
  }

  private getTickets(): void {
    this.fireStoreService.getAllSubscription().subscribe(res => {
      this.dataSource.data = res;
      this.total = res.length;
    });
  }
}
