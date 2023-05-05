import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IAddress, IAllSubscriptionDataSourceVm } from '@app/models';
import { FireStoreService } from '@app/services';

@Component({
  templateUrl: './all-subscription.component.html'
})
export class AllSubscriptionComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort!: MatSort;
  total = 0;
  readonly desktopColumns = ['name', 'mobile', 'birthDate', 'address', 'age', 'gender', 'room', 'status'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IAllSubscriptionDataSourceVm>([]);
  addressList: Array<IAddress> = [];
  isMobileView = false;
  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }
  
  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  constructor(private fireStoreService: FireStoreService) {}

  ngOnInit(): void {
    this.detectMobileView();
    this.getAddress();
  }

  private getAddress(): void {
    this.fireStoreService.getAll<IAddress>(Constants.RealtimeDatabase.address).subscribe(data => {
      this.addressList = data;
      this.getTickets();
    });
  }

  private getTickets(): void {
    this.fireStoreService.getAllSubscription().subscribe(res => {
      const data = res.map(item => ({...item, address: this.getAddressById(item.addressId) }));
      this.dataSource = new MatTableDataSource(data);
      this.total = res.length;
      this.dataSource.sort = this.sort;
    });
  }

  private getAddressById(addressId: string): string {
    if (addressId && this.addressList.length > 0) {
      const address = this.addressList.find(a => a.id === addressId);
      if (address) {
        return address.name;
      }
      return '';
    }
    return '';
  }

  private detectMobileView(): void {
    this.isMobileView = this.isMobile;
    if (this.isMobileView) {
      this.displayedColumns = ['mobileView'];
    } else {
      this.displayedColumns = this.desktopColumns;
    }
  }
}
