import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ITicket } from '@app/models';
import { FireStoreService } from '@app/services';

@Component({
  templateUrl: './all-subscription.component.html'
})
export class AllSubscriptionComponent implements OnInit, AfterViewInit {

  pageSize = 10;
  pageIndex = 0;
  total = 0;
  displayedColumns: string[] = ['name', 'mobile', 'birthDate', 'age', 'gender', 'room', 'status'];
  dataSource: MatTableDataSource<Partial<ITicket>> = new MatTableDataSource<Partial<ITicket>>([]);
  loading = false;
  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  
  constructor(private fireStoreService: FireStoreService) {}

  ngOnInit(): void {
    this.getTickets();
    // this.getTicketCount();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadMore(): void {
    // this.loading = true;
    // // this.pageIndex = pageEvent.pageIndex;
    // // this.pageSize = pageEvent.pageSize;
    // this.getTickets();
  }

  // onPageChanged(pageEvent: PageEvent): void {
  //   this.pageIndex = pageEvent.pageIndex;
  //   this.pageSize = pageEvent.pageSize;
  //   this.getTickets();
  // }

  // private getTicketCount(): void {
  //   this.fireStoreService.getTicketCount().subscribe(res => {
  //     this.total = res;
  //   });
  // }

  private getTickets(): void {
    // const skip = this.pageIndex * this.pageSize;
    // const take = this.pageSize;
    // this.fireStoreService.getAllSubscriptionWithPagination(skip, take).subscribe(res => {
    //   this.dataSource.data = res;
    // });
    this.fireStoreService.getAllSubscription().subscribe(res => {
      this.dataSource.data = res;
      this.total = res.length;
    });
  }
}
