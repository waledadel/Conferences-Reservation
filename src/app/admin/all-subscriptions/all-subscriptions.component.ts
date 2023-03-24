import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { ITicket } from '@app/models';
import { FireStoreService } from '@app/services';

@Component({
  templateUrl: './all-subscriptions.component.html'
})
export class AllSubscriptionsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['name', 'mobile', 'birthDate', 'age', 'room', 'status'];
  dataSource: MatTableDataSource<ITicket> = new MatTableDataSource<ITicket>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  
  constructor(private fireStoreService: FireStoreService) {}

  ngOnInit(): void {
    this.getTickets();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private getTickets(): void {
    this.fireStoreService.getAll<ITicket>(Constants.RealtimeDatabase.tickets).subscribe(res => {
      this.dataSource.data = res.map(item => ({...item, age: new Date().getFullYear() - item.birthDate.toDate().getFullYear() }));
    });
  }
}
